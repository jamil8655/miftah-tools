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
} from 'docx';
import { runOcr } from '@/lib/ocr/ocr-engine';
import { getPdfJsLib } from '@/lib/utils/formatters';

/**
 * High-Fidelity Client-Side PDF to Word (DOCX) Converter Engine with Deep OCR.
 * Monotonic progress guaranteed (never jumps backwards).
 */
export async function pdfToDocx(
  file: File,
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
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

    // Micro-delay between pages to allow UI repaints and garbage collection
    if (pageNum % 2 === 0 || totalPages > 10) {
      await new Promise((resolve) => setTimeout(resolve, 8));
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = (textContent.items || []) as any[];

      // Extract existing digital text
      const digitalText = items.map((i) => i.str || '').join(' ').trim();

      if (items.length > 0 && digitalText.length > 25) {
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
        // 2. SCANNED PAPER / IMAGE PDF -> RUN OPTICAL CHARACTER RECOGNITION (OCR)
        updateProgress(pageBasePct + 2, `Scanned page ${pageNum} detected. Extracting text...`);

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
                          size: 24, // 12pt standard
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
                })
              );
            }
          } catch (ocrErr) {
            console.error('OCR Error on page', pageNum, ocrErr);
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
    }
  }

  updateProgress(94, 'Assembling editable Microsoft Word document...');

  const doc = new Document({
    title: file.name.replace(/\.pdf$/i, ''),
    description: 'Converted from PDF with OCR by NEXORA Tools',
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
