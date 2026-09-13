import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  PageBreak,
  ImageRun,
} from 'docx';
import { runOcr } from '@/lib/ocr/ocr-engine';
import { getPdfJsLib } from '@/lib/utils/formatters';

/**
 * High-Fidelity Client-Side PDF to Word (DOCX) Converter Engine with Deep OCR.
 * Monotonic progress guaranteed (never jumps backwards).
 */
export async function pdfToDocx(
  file: File | Blob,
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  const fileName = (file as File).name || 'document.pdf';
  
  // If user dropped an image file into the PDF converter, route to Image-to-Word
  if (
    file.type?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|bmp|tiff|heic|svg)$/i.test(fileName)
  ) {
    return imageToDocx(file, onProgress);
  }

  let currentMaxPercent = 5;
  const updateProgress = (pct: number, status: string) => {
    if (pct > currentMaxPercent) {
      currentMaxPercent = Math.min(99, Math.round(pct));
    }
    onProgress?.(currentMaxPercent, status);
  };

  updateProgress(10, 'Initializing PDF parser engine...');
  const pdfjsLib = await getPdfJsLib();
  if (!pdfjsLib) {
    throw new Error('PDF parsing library is unavailable in this environment.');
  }

  const arrayBuffer = await file.arrayBuffer();
  updateProgress(18, 'Reading document structure...');
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const docChildren: Paragraph[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageBasePct = 20 + Math.floor(((pageNum - 1) / totalPages) * 70);
    const pageNextPct = 20 + Math.floor((pageNum / totalPages) * 70);
    updateProgress(pageBasePct, `Processing page ${pageNum} of ${totalPages}...`);

    if (pageNum % 2 === 0 || totalPages > 10) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = (textContent.items || []) as any[];

      // Extract existing digital text
      const digitalText = items.map((i) => i.str || '').join(' ').trim();

      if (items.length > 0 && digitalText.length > 0) {
        // 1. Digital PDF Vector Layout Reconstruction
        items.sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 4) return yDiff;
          return a.transform[4] - b.transform[4];
        });

        const lines: { y: number; fontSize: number; text: string; isBold: boolean }[] = [];
        let currentLine = { y: items[0].transform[5], fontSize: items[0].height || 12, text: '', isBold: false };

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const str = item.str || '';
          const y = item.transform[5];
          const fontName = (item.fontName || '').toLowerCase();
          const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');
          const fontSize = Math.round(item.height || item.transform[0] || 12);

          if (Math.abs(y - currentLine.y) > 6) {
            if (currentLine.text.trim()) {
              lines.push({ ...currentLine, text: currentLine.text.trim() });
            }
            currentLine = { y, fontSize, text: str, isBold };
          } else {
            currentLine.text += (currentLine.text.length > 0 && !currentLine.text.endsWith(' ') ? ' ' : '') + str;
            if (isBold) currentLine.isBold = true;
            if (fontSize > currentLine.fontSize) currentLine.fontSize = fontSize;
          }
        }
        if (currentLine.text.trim()) {
          lines.push({ ...currentLine, text: currentLine.text.trim() });
        }

        let paragraphBuffer: { text: string; isBold: boolean; fontSize: number }[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.fontSize >= 18) {
            if (paragraphBuffer.length > 0) {
              docChildren.push(buildParagraph(paragraphBuffer));
              paragraphBuffer = [];
            }
            docChildren.push(
              new Paragraph({
                text: line.text,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 240, after: 120 },
              })
            );
          } else if (line.fontSize >= 14) {
            if (paragraphBuffer.length > 0) {
              docChildren.push(buildParagraph(paragraphBuffer));
              paragraphBuffer = [];
            }
            docChildren.push(
              new Paragraph({
                text: line.text,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 180, after: 80 },
              })
            );
          } else {
            paragraphBuffer.push(line);
            if (line.text.endsWith('.') || line.text.endsWith('!') || line.text.endsWith('?')) {
              docChildren.push(buildParagraph(paragraphBuffer));
              paragraphBuffer = [];
            }
          }
        }

        if (paragraphBuffer.length > 0) {
          docChildren.push(buildParagraph(paragraphBuffer));
        }
        updateProgress(pageNextPct, `Finished page ${pageNum} of ${totalPages}`);
      } else {
        // 2. SCANNED / IMAGE PDF -> RUN OPTICAL CHARACTER RECOGNITION (OCR)
        updateProgress(pageBasePct + 2, `Scanned page ${pageNum} detected. Extracting text via OCR...`);

        const ocrScale = totalPages > 15 ? 1.25 : totalPages > 6 ? 1.5 : 1.85;
        const viewport = page.getViewport({ scale: ocrScale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pageDataUrl = canvas.toDataURL('image/png');

          try {
            updateProgress(pageBasePct + 4, `Reading characters from page ${pageNum}...`);
            const ocrResult = await runOcr(pageDataUrl, 'eng');

            if (ocrResult.text && ocrResult.text.trim()) {
              const rawParagraphs = ocrResult.text.split(/\n\s*\n/);
              for (const pText of rawParagraphs) {
                const cleanP = pText.trim().replace(/\n/g, ' ');
                if (cleanP) {
                  docChildren.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cleanP,
                          size: 24, // 12pt
                        }),
                      ],
                      spacing: { after: 140 },
                    })
                  );
                }
              }
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `[Page ${pageNum} - Graphic / Non-Text Layout]`,
                      italics: true,
                      color: '888888',
                    }),
                  ],
                  spacing: { after: 120 },
                })
              );
            }
          } catch (ocrErr) {
            console.warn('OCR fallback warning on page', pageNum, ocrErr);
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[Page ${pageNum} content]`,
                    color: '666666',
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }
        }

        // Clean up canvas
        canvas.width = 0;
        canvas.height = 0;
        updateProgress(pageNextPct, `Finished scanning page ${pageNum} of ${totalPages}`);
      }

      // Page Break between pages
      if (pageNum < totalPages) {
        docChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    } catch (pageErr) {
      console.warn(`Error processing page ${pageNum}:`, pageErr);
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `[Page ${pageNum}]` })],
        })
      );
    }
  }

  updateProgress(94, 'Assembling editable Microsoft Word document...');

  const doc = new Document({
    title: fileName.replace(/\.[^/.]+$/, ''),
    description: 'Converted from PDF with OCR by Miftah Tools',
    sections: [
      {
        properties: {},
        children: docChildren.length > 0 ? docChildren : [new Paragraph({ text: 'Converted Document' })],
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word document successfully created!');
  return docxBlob;
}

/**
 * Helper to extract image Uint8Array and calculate scaled dimensions for DOCX embedding
 */
async function extractImageForDocx(
  file: File | Blob
): Promise<{ data: Uint8Array; width: number; height: number; type: 'png' | 'jpg' } | null> {
  try {
    const mime = file.type || '';
    const imgType: 'png' | 'jpg' = mime.includes('png') ? 'png' : 'jpg';

    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = url;
        });
        URL.revokeObjectURL(url);

        const width = img.naturalWidth || 600;
        const height = img.naturalHeight || 800;

        // Render to canvas to get guaranteed valid PNG/JPG bytes compatible with DOCX
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const outMime = imgType === 'png' ? 'image/png' : 'image/jpeg';
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, outMime, 0.95));
          if (blob) {
            const arr = await blob.arrayBuffer();
            const maxWidth = 500;
            const maxHeight = 650;
            const scale = Math.min(maxWidth / width, maxHeight / height, 1);
            return {
              data: new Uint8Array(arr),
              width: Math.max(100, Math.round(width * scale)),
              height: Math.max(100, Math.round(height * scale)),
              type: imgType,
            };
          }
        }
      } catch {
        URL.revokeObjectURL(url);
      }
    }

    // Fallback if canvas is not available
    const arrayBuffer = await file.arrayBuffer();
    return {
      data: new Uint8Array(arrayBuffer),
      width: 480,
      height: 640,
      type: imgType,
    };
  } catch (e) {
    console.warn('Failed to extract image for DOCX:', e);
    return null;
  }
}

/**
 * High-Fidelity Image to Word (DOCX) Converter using embedded images & deep OCR.
 */
export async function imageToDocx(
  file: File | Blob,
  onProgress?: (percent: number, status: string) => void,
  language: string = 'eng'
): Promise<Blob> {
  const fileName = (file as File).name || 'image-document';
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '');

  onProgress?.(15, 'Loading image for document synthesis...');

  // 1. Extract and scale image for embedding in Word DOCX
  const imgInfo = await extractImageForDocx(file);

  let ocrText = '';
  try {
    onProgress?.(30, 'Extracting text and structure from image...');
    const result = await runOcr(file, language, (pct, status) => {
      onProgress?.(30 + Math.round(pct * 0.5), status);
    });
    ocrText = result.text || '';
  } catch (err) {
    console.warn('Image OCR error:', err);
  }

  onProgress?.(85, 'Formatting editable Word document...');

  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      text: cleanTitle,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 100, after: 140 },
    })
  );

  // Embed original image
  if (imgInfo) {
    try {
      paragraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgInfo.data,
              type: imgInfo.type,
              transformation: {
                width: imgInfo.width,
                height: imgInfo.height,
              },
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } catch (imgErr) {
      console.warn('Could not embed ImageRun in DOCX:', imgErr);
    }
  }

  // Embed OCR Text
  if (ocrText.trim()) {
    paragraphs.push(
      new Paragraph({
        text: 'Extracted Editable Text (OCR)',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    );

    const rawParagraphs = ocrText.split(/\n\s*\n/);
    for (const p of rawParagraphs) {
      const clean = p.trim();
      if (!clean) continue;

      const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
      paragraphs.push(
        new Paragraph({
          children: lines.map(
            (line, idx) =>
              new TextRun({
                text: line + (idx < lines.length - 1 ? ' ' : ''),
                size: 24, // 12pt standard
              })
          ),
          spacing: { after: 140 },
        })
      );
    }
  } else if (!imgInfo) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'No clear text was recognized from the uploaded image.',
            italics: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  onProgress?.(95, 'Packaging Microsoft Word DOCX file...');

  const doc = new Document({
    title: cleanTitle,
    description: 'Converted from Image via OCR by Miftah Tools',
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word DOCX document ready!');
  return docxBlob;
}

/**
 * Convert Multiple Images to a single multi-page Word DOCX document with embedded images & OCR.
 */
export async function imagesToDocx(
  files: (File | Blob)[],
  onProgress?: (percent: number, status: string) => void,
  language: string = 'eng'
): Promise<Blob> {
  const total = files.length;
  const allParagraphs: Paragraph[] = [];

  for (let i = 0; i < total; i++) {
    const f = files[i];
    const name = (f as File).name || `Image ${i + 1}`;
    const basePct = Math.round((i / total) * 90);
    onProgress?.(basePct, `Processing image ${i + 1} of ${total} (${name})...`);

    // Add Section Header
    allParagraphs.push(
      new Paragraph({
        text: `Page ${i + 1}: ${name.replace(/\.[^/.]+$/, '')}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 120 },
      })
    );

    // Embed Image
    const imgInfo = await extractImageForDocx(f);
    if (imgInfo) {
      try {
        allParagraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imgInfo.data,
                type: imgInfo.type,
                transformation: {
                  width: imgInfo.width,
                  height: imgInfo.height,
                },
              }),
            ],
            spacing: { after: 160 },
          })
        );
      } catch (imgErr) {
        console.warn('Image embedding error on image', i + 1, imgErr);
      }
    }

    // Run OCR
    try {
      const result = await runOcr(f, language);
      const text = (result.text || '').trim();

      if (text) {
        const blocks = text.split(/\n\s*\n/);
        for (const block of blocks) {
          const clean = block.trim();
          if (clean) {
            allParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: clean.replace(/\n/g, ' '),
                    size: 24,
                  }),
                ],
                spacing: { after: 140 },
              })
            );
          }
        }
      }
    } catch (err) {
      console.warn(`Error processing image OCR for ${i + 1}:`, err);
    }

    if (i < total - 1) {
      allParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  onProgress?.(95, 'Building combined Word document...');

  const doc = new Document({
    title: 'Converted Images Document',
    description: 'Converted from images by Miftah Tools',
    sections: [
      {
        properties: {},
        children: allParagraphs.length > 0 ? allParagraphs : [new Paragraph({ text: 'Converted Document' })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word document generated!');
  return blob;
}

/**
 * Convert plain or formatted text to a Word DOCX file.
 */
export async function textToWordDocx(text: string, title: string = 'Document'): Promise<Blob> {
  const paragraphs: Paragraph[] = [];
  const rawBlocks = text.split(/\n\s*\n/);

  let isFirst = true;
  for (const block of rawBlocks) {
    const clean = block.trim();
    if (!clean) continue;

    if (isFirst && clean.length < 80 && !clean.includes('\n')) {
      paragraphs.push(
        new Paragraph({
          text: clean,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 120 },
        })
      );
      isFirst = false;
    } else {
      isFirst = false;
      const lines = clean.split('\n');
      paragraphs.push(
        new Paragraph({
          children: lines.map((l, idx) => new TextRun({ text: l + (idx < lines.length - 1 ? '\n' : '') })),
          spacing: { after: 140 },
        })
      );
    }
  }

  const doc = new Document({
    title,
    sections: [
      {
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: text || 'Empty Document' })],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

function buildParagraph(lines: { text: string; isBold: boolean; fontSize: number }[]): Paragraph {
  const fullText = lines.map((l) => l.text).join(' ');
  const hasBold = lines.some((l) => l.isBold);
  const avgFontSize = Math.round(lines.reduce((sum, l) => sum + l.fontSize, 0) / lines.length);

  return new Paragraph({
    children: [
      new TextRun({
        text: fullText,
        bold: hasBold,
        size: avgFontSize >= 12 ? avgFontSize * 2 : 22,
      }),
    ],
    spacing: { after: 120 },
  });
}

/**
 * Parse Word DOCX file into HTML and plain text.
 */
export async function parseDocx(file: File): Promise<{ html: string; text: string; messages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

  return {
    html: result.value,
    text: rawTextResult.value,
    messages: result.messages.map((m) => m.message),
  };
}

/**
 * Convert DOCX file to a clean PDF.
 */
export async function docxToPdf(file: File): Promise<Uint8Array> {
  const { text } = await parseDocx(file);
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const lines = pdf.splitTextToSize(text || 'Empty Document', 515);

  let cursorY = 50;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + 16 > 800) {
      pdf.addPage();
      cursorY = 50;
    }
    pdf.text(lines[i], 40, cursorY);
    cursorY += 16;
  }

  return new Uint8Array(pdf.output('arraybuffer'));
}

/**
 * Parse Excel XLSX or CSV file into tabular JSON data.
 */
export async function parseSpreadsheet(file: File): Promise<{ sheetNames: string[]; data: any[][] }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  return {
    sheetNames: workbook.SheetNames,
    data: jsonData,
  };
}

/**
 * Convert Excel / CSV spreadsheet data into a styled PDF table.
 */
export async function spreadsheetToPdf(file: File): Promise<Uint8Array> {
  const { data, sheetNames } = await parseSpreadsheet(file);
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Spreadsheet Export: ${sheetNames[0] || 'Sheet 1'}`, 40, 40);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  let cursorY = 70;
  const colWidth = 100;

  data.forEach((row, rowIdx) => {
    if (cursorY > 540) {
      pdf.addPage();
      cursorY = 50;
    }

    if (rowIdx === 0) {
      pdf.setFillColor(240, 244, 248);
      pdf.rect(35, cursorY - 12, 770, 18, 'F');
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    const rowCells = (row || []).slice(0, 7);
    rowCells.forEach((cell, colIdx) => {
      const text = String(cell !== undefined && cell !== null ? cell : '').slice(0, 18);
      pdf.text(text, 40 + colIdx * colWidth, cursorY);
    });

    cursorY += 18;
  });

  return new Uint8Array(pdf.output('arraybuffer'));
}
