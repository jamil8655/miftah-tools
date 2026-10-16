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
  AlignmentType,
} from 'docx';
import { runOcr } from '@/lib/ocr/ocr-engine';
import { getPdfJsLib } from '@/lib/utils/formatters';

export interface PdfToDocxOptions {
  language?: 'auto' | 'ara' | 'urd' | 'eng' | string;
  forceRtl?: boolean | 'auto';
  preserveExactFontSize?: boolean;
  cleanArtifacts?: boolean;
  normalizeArabic?: boolean;
}

/**
 * Normalizes Unicode text, decomposes Arabic/Urdu presentation forms to base characters,
 * removes unprintable/null controls, strips unmapped Private Use Area (PUA) bullet codes,
 * and converts geometric circle/square markers into clean bullets.
 */
export function cleanAndNormalizePdfText(str: string): string {
  if (!str) return '';

  // 1. Convert Unicode Presentation Forms (Arabic/Urdu glyphs) to base connected Unicode
  // NFKC decomposes presentation forms (U+FB50-U+FDFF, U+FE70-U+FEFF) into natural Arabic
  let cleaned = str.normalize('NFKC');

  // 2. Strip non-printable ASCII control characters (nulls, breaks, escapes)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Remove raw CID font artifact patterns like "(cid:123)"
  cleaned = cleaned.replace(/\(cid:\d+\)/g, '');

  // 4. Handle Private Use Area (PUA) characters \uE000-\uF8FF, \uFFF0-\uFFFF
  // Convert common Wingdings/Symbol bullet characters to clean bullet • (\u2022)
  cleaned = cleaned.replace(/[\uF0A7\uF0B7\uF0D8\uF0E0\uF02D]/g, '•');
  // Strip unmapped PUA characters which otherwise render as empty boxes, circles or question marks in Word
  cleaned = cleaned.replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, '');

  // 5. Normalize geometric shape circles and stray boxes:
  // \u25CF (Black Circle), \u25CB (White Circle), \u25E6 (White Bullet), \u25AA, \u25AB
  cleaned = cleaned.replace(/[\u25CF\u25CB\u25E6\u25AA\u25AB\u2023\u2043]/g, '•');

  // 6. Remove replacement character \uFFFD (rendered as  or question mark circle)
  cleaned = cleaned.replace(/\uFFFD/g, '');

  // 7. Strip zero-width & invisible spaces, EXCEPT \u200C (ZWNJ which is required for Urdu/Persian)
  cleaned = cleaned.replace(/[\uFEFF\u200B\u200D\u2060]/g, '');

  return cleaned;
}

/**
 * Detects whether a string is predominantly Right-to-Left (Arabic, Urdu, Persian, Pashto, Hebrew).
 */
export function isRtlText(text: string): boolean {
  if (!text) return false;
  const rtlMatches = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g);
  const rtlChars = rtlMatches ? rtlMatches.length : 0;
  const nonSpaceLength = text.replace(/[\s\d\p{P}]/gu, '').length;
  if (nonSpaceLength === 0) return rtlChars > 0;
  return rtlChars / nonSpaceLength >= 0.25;
}

/**
 * Detects if an Arabic/Urdu string was written in reversed visual character order and fixes it.
 */
export function fixArabicVisualReversal(text: string): string {
  if (!text) return text;
  const words = text.split(/\s+/);
  let reversedSignals = 0;
  let normalSignals = 0;

  for (const w of words) {
    if (w.length >= 3) {
      if (w.startsWith('ة') || w.endsWith('ال')) reversedSignals++;
      if (
        w.startsWith('ال') ||
        w.startsWith('لل') ||
        w.startsWith('بال') ||
        w.startsWith('كال') ||
        w.startsWith('فال') ||
        w.endsWith('ة') ||
        w.endsWith('ات') ||
        w.endsWith('ين') ||
        w.endsWith('ون')
      ) {
        normalSignals++;
      }
    }
  }

  if (reversedSignals > normalSignals && reversedSignals >= 1) {
    return words
      .map((w) => {
        if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(w)) {
          return [...w].reverse().join('');
        }
        return w;
      })
      .join(' ');
  }
  return text;
}

interface RawPdfItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isRtl: boolean;
}

/**
 * Ultra High-Fidelity Client-Side PDF to Word (DOCX) Converter Engine with Deep OCR,
 * Native Right-To-Left (RTL) Arabic/Urdu Support, Artifact Cleansing, and Exact Font Size Matching.
 */
export async function pdfToDocx(
  file: File | Blob,
  onProgress?: (percent: number, status: string) => void,
  options?: PdfToDocxOptions
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
  updateProgress(18, 'Reading document structure & layout...');
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
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width || 595;
      const textContent = await page.getTextContent();
      const rawItems = (textContent.items || []) as any[];

      // Filter and clean items
      const validItems: RawPdfItem[] = [];

      for (const item of rawItems) {
        const rawStr = item.str || '';
        let cleanStr = cleanAndNormalizePdfText(rawStr);
        cleanStr = fixArabicVisualReversal(cleanStr);

        if (!cleanStr.trim() && !item.hasEOL) {
          continue;
        }

        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;
        const scaleX = item.transform ? Math.hypot(item.transform[0], item.transform[1]) : 12;
        const scaleY = item.transform ? Math.hypot(item.transform[2], item.transform[3]) : 12;
        const computedSize = Math.max(scaleX, scaleY, item.height || 12);
        const fontSize = Math.max(8, Math.min(72, Math.round(computedSize)));

        const fontName = (item.fontName || '').toLowerCase();
        const isBold =
          fontName.includes('bold') ||
          fontName.includes('black') ||
          fontName.includes('heavy') ||
          fontName.includes('semi') ||
          fontName.includes('demi');
        const isItalic = fontName.includes('italic') || fontName.includes('oblique');
        const itemRtl = isRtlText(cleanStr);

        validItems.push({
          str: cleanStr,
          x,
          y,
          width: item.width || 0,
          height: item.height || fontSize,
          fontSize,
          isBold,
          isItalic,
          isRtl: itemRtl,
        });
      }

      if (validItems.length > 0) {
        // Group items into horizontal lines based on vertical tolerance
        const lines: { y: number; items: RawPdfItem[] }[] = [];

        for (const it of validItems) {
          const existingLine = lines.find(
            (l) => Math.abs(l.y - it.y) <= Math.max(3.5, it.fontSize * 0.45)
          );
          if (existingLine) {
            existingLine.items.push(it);
            existingLine.y =
              (existingLine.y * (existingLine.items.length - 1) + it.y) /
              existingLine.items.length;
          } else {
            lines.push({ y: it.y, items: [it] });
          }
        }

        // Sort lines from top of the page down to bottom (PDF Y is 0 at bottom)
        lines.sort((a, b) => b.y - a.y);

        for (const line of lines) {
          const fullLineText = line.items.map((i) => i.str).join(' ').trim();
          if (!fullLineText) continue;

          // Determine line direction (RTL for Arabic/Urdu vs LTR for English/Hindi)
          const isLineRtl =
            options?.forceRtl === true
              ? true
              : options?.forceRtl === false
              ? false
              : isRtlText(fullLineText);

          // Horizontal sorting within the line:
          // In RTL (Arabic/Urdu), reading starts from the rightmost word (highest X) moving leftward.
          // In LTR (English), reading starts from the leftmost word (lowest X) moving rightward.
          if (isLineRtl) {
            line.items.sort((a, b) => b.x - a.x);
          } else {
            line.items.sort((a, b) => a.x - b.x);
          }

          // Merge adjacent items into coherent TextRuns with exact font sizes and styling
          const runs: { text: string; fontSize: number; isBold: boolean; isItalic: boolean; isRtl: boolean }[] = [];
          for (let i = 0; i < line.items.length; i++) {
            const it = line.items[i];
            const prev = runs[runs.length - 1];

            if (
              prev &&
              prev.fontSize === it.fontSize &&
              prev.isBold === it.isBold &&
              prev.isItalic === it.isItalic &&
              prev.isRtl === it.isRtl
            ) {
              const needsSpace = !prev.text.endsWith(' ') && !it.str.startsWith(' ');
              prev.text += (needsSpace ? ' ' : '') + it.str;
            } else {
              runs.push({
                text: it.str,
                fontSize: it.fontSize,
                isBold: it.isBold,
                isItalic: it.isItalic,
                isRtl: it.isRtl || isLineRtl,
              });
            }
          }

          const maxFontSize = Math.max(...line.items.map((i) => i.fontSize));
          const minX = Math.min(...line.items.map((i) => i.x));
          const maxX = Math.max(...line.items.map((i) => i.x + i.width));
          const lineWidth = maxX - minX;
          const lineCenter = minX + lineWidth / 2;
          const pageCenter = pageWidth / 2;
          const isCentered = !isLineRtl && Math.abs(lineCenter - pageCenter) < 40 && lineWidth < pageWidth * 0.7;

          const isHeading = maxFontSize >= 16 && fullLineText.length < 120;

          // Alignment determination
          const alignment = isLineRtl
            ? AlignmentType.RIGHT
            : isCentered
            ? AlignmentType.CENTER
            : AlignmentType.LEFT;

          const textRunObjects = runs.map(
            (r) =>
              new TextRun({
                text: r.text,
                bold: r.isBold,
                italics: r.isItalic,
                // Exact font size in half-points: 12pt -> 24, 18pt -> 36, 24pt -> 48
                size: Math.max(16, Math.min(144, r.fontSize * 2)),
                rightToLeft: isLineRtl,
                font: isLineRtl
                  ? { name: 'Traditional Arabic', cs: 'Traditional Arabic', ascii: 'Calibri' }
                  : { name: 'Calibri', ascii: 'Calibri' },
              })
          );

          docChildren.push(
            new Paragraph({
              children: textRunObjects,
              bidirectional: isLineRtl,
              alignment,
              spacing: {
                before: isHeading ? 160 : 30,
                after: isHeading ? 80 : 30,
                line: 276,
              },
              heading: isHeading
                ? maxFontSize >= 22
                  ? HeadingLevel.HEADING_1
                  : HeadingLevel.HEADING_2
                : undefined,
            })
          );
        }

        updateProgress(pageNextPct, `Finished page ${pageNum} of ${totalPages}`);
      } else {
        // 2. SCANNED / IMAGE PDF -> RUN OPTICAL CHARACTER RECOGNITION (OCR)
        updateProgress(pageBasePct + 2, `Scanned page ${pageNum} detected. Extracting text via OCR...`);

        const ocrScale = totalPages > 15 ? 1.25 : totalPages > 6 ? 1.5 : 1.85;
        const pageViewport = page.getViewport({ scale: ocrScale });
        const canvas = document.createElement('canvas');
        canvas.width = pageViewport.width;
        canvas.height = pageViewport.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport: pageViewport }).promise;
          const pageDataUrl = canvas.toDataURL('image/png');

          try {
            updateProgress(pageBasePct + 4, `Reading characters from page ${pageNum}...`);
            const ocrLang = options?.language === 'ara' || options?.language === 'urd'
              ? 'ara'
              : options?.language || 'eng';
            const ocrResult = await runOcr(pageDataUrl, ocrLang);

            if (ocrResult.text && ocrResult.text.trim()) {
              const rawParagraphs = ocrResult.text.split(/\n\s*\n/);
              for (const pText of rawParagraphs) {
                let cleanP = cleanAndNormalizePdfText(pText.trim().replace(/\n/g, ' '));
                cleanP = fixArabicVisualReversal(cleanP);
                if (cleanP) {
                  const isP_Rtl = options?.forceRtl === true || isRtlText(cleanP);
                  docChildren.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cleanP,
                          size: 24, // 12pt standard
                          rightToLeft: isP_Rtl,
                          font: isP_Rtl
                            ? { name: 'Traditional Arabic', cs: 'Traditional Arabic', ascii: 'Calibri' }
                            : { name: 'Calibri', ascii: 'Calibri' },
                        }),
                      ],
                      bidirectional: isP_Rtl,
                      alignment: isP_Rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                      spacing: { after: 120, line: 276 },
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
    description: 'Converted from PDF with high-fidelity layout by Miftah Tools',
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
    let clean = cleanAndNormalizePdfText(block.trim());
    clean = fixArabicVisualReversal(clean);
    if (!clean) continue;

    const isBlockRtl = isRtlText(clean);

    if (isFirst && clean.length < 80 && !clean.includes('\n')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: clean,
              bold: true,
              size: 32, // 16pt
              rightToLeft: isBlockRtl,
              font: isBlockRtl
                ? { name: 'Traditional Arabic', cs: 'Traditional Arabic', ascii: 'Calibri' }
                : { name: 'Calibri', ascii: 'Calibri' },
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          bidirectional: isBlockRtl,
          alignment: isBlockRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { before: 200, after: 120 },
        })
      );
      isFirst = false;
    } else {
      isFirst = false;
      const lines = clean.split('\n');
      paragraphs.push(
        new Paragraph({
          children: lines.map(
            (l, idx) =>
              new TextRun({
                text: l + (idx < lines.length - 1 ? '\n' : ''),
                size: 24, // 12pt standard
                rightToLeft: isBlockRtl,
                font: isBlockRtl
                  ? { name: 'Traditional Arabic', cs: 'Traditional Arabic', ascii: 'Calibri' }
                  : { name: 'Calibri', ascii: 'Calibri' },
              })
          ),
          bidirectional: isBlockRtl,
          alignment: isBlockRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { after: 140, line: 276 },
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
