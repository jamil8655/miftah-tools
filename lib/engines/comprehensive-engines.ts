'use client';

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';
import { marked } from 'marked';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { runOcr } from '@/lib/ocr/ocr-engine';
import { getPdfJsLib } from '@/lib/utils/formatters';

/**
 * ----------------------------------------------------
 * 1. ADVANCED PDF MANIPULATION & ORGANIZATION ENGINES
 * ----------------------------------------------------
 */

export async function deletePdfPages(buffer: ArrayBuffer, pagesToDelete: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();
  const toDelete = new Set<number>();

  pagesToDelete.split(',').forEach((p) => {
    const trimmed = p.trim();
    if (trimmed.includes('-')) {
      const [s, e] = trimmed.split('-').map(Number);
      if (!isNaN(s) && !isNaN(e)) {
        for (let i = s; i <= e; i++) if (i >= 1 && i <= total) toDelete.add(i - 1);
      }
    } else {
      const num = Number(trimmed);
      if (!isNaN(num) && num >= 1 && num <= total) toDelete.add(num - 1);
    }
  });

  const sortedDelete = Array.from(toDelete).sort((a, b) => b - a);
  for (const idx of sortedDelete) {
    if (pdfDoc.getPageCount() > 1) {
      pdfDoc.removePage(idx);
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

export async function reversePdfPages(buffer: ArrayBuffer): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const total = srcDoc.getPageCount();
  const indices = Array.from({ length: total }, (_, i) => total - 1 - i);

  const copied = await newDoc.copyPages(srcDoc, indices);
  copied.forEach((p) => newDoc.addPage(p));

  return await newDoc.save({ useObjectStreams: true });
}

export async function extractOddEvenPages(buffer: ArrayBuffer, type: 'odd' | 'even'): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const total = srcDoc.getPageCount();
  const indices: number[] = [];

  for (let i = 0; i < total; i++) {
    const pageNum = i + 1;
    if (type === 'odd' && pageNum % 2 !== 0) indices.push(i);
    if (type === 'even' && pageNum % 2 === 0) indices.push(i);
  }

  if (indices.length === 0) throw new Error(`No ${type} pages found.`);
  const copied = await newDoc.copyPages(srcDoc, indices);
  copied.forEach((p) => newDoc.addPage(p));

  return await newDoc.save({ useObjectStreams: true });
}

export async function duplicatePdfPages(buffer: ArrayBuffer, copies: number = 2): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const total = srcDoc.getPageCount();

  for (let i = 0; i < total; i++) {
    for (let c = 0; c < copies; c++) {
      const [copied] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copied);
    }
  }

  return await newDoc.save({ useObjectStreams: true });
}

export async function insertBlankPdfPage(buffer: ArrayBuffer, atPosition: 'start' | 'end' | 'every'): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = srcDoc.getPageCount();

  if (atPosition === 'start') {
    srcDoc.insertPage(0, [595.28, 841.89]); // A4
  } else if (atPosition === 'end') {
    srcDoc.addPage([595.28, 841.89]);
  } else if (atPosition === 'every') {
    for (let i = total; i > 0; i--) {
      srcDoc.insertPage(i, [595.28, 841.89]);
    }
  }

  return await srcDoc.save({ useObjectStreams: true });
}

export async function changePdfPageOrientation(buffer: ArrayBuffer, target: 'landscape' | 'portrait'): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const isLandscape = width > height;

    if (target === 'landscape' && !isLandscape) {
      page.setSize(height, width);
      page.setRotation(degrees(90));
    } else if (target === 'portrait' && isLandscape) {
      page.setSize(height, width);
      page.setRotation(degrees(0));
    }
  }

  return await doc.save({ useObjectStreams: true });
}

export async function resizePdfPageDimensions(buffer: ArrayBuffer, size: 'A4' | 'Letter' | 'Legal' | 'A3'): Promise<Uint8Array> {
  const SIZES: Record<string, [number, number]> = {
    A4: [595.28, 841.89],
    Letter: [612.0, 792.0],
    Legal: [612.0, 1008.0],
    A3: [841.89, 1190.55],
  };

  const [tWidth, tHeight] = SIZES[size] || SIZES.A4;
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const pages = srcDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const [embedded] = await newDoc.embedPdf(srcDoc, [i]);
    const newPage = newDoc.addPage([tWidth, tHeight]);
    const scale = Math.min(tWidth / embedded.width, tHeight / embedded.height);
    const xOffset = (tWidth - embedded.width * scale) / 2;
    const yOffset = (tHeight - embedded.height * scale) / 2;

    newPage.drawPage(embedded, {
      x: xOffset,
      y: yOffset,
      xScale: scale,
      yScale: scale,
    });
  }

  return await newDoc.save({ useObjectStreams: true });
}

export async function addPdfHeaderFooter(
  buffer: ArrayBuffer,
  headerText: string,
  footerText: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    if (headerText) {
      const hStr = headerText.replace('{page}', String(idx + 1)).replace('{total}', String(pages.length));
      page.drawText(hStr, {
        x: width / 2 - (font.widthOfTextAtSize(hStr, 10)) / 2,
        y: height - 25,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    if (footerText) {
      const fStr = footerText.replace('{page}', String(idx + 1)).replace('{total}', String(pages.length));
      page.drawText(fStr, {
        x: width / 2 - (font.widthOfTextAtSize(fStr, 10)) / 2,
        y: 18,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  });

  return await doc.save({ useObjectStreams: true });
}

export async function redactPdfContent(buffer: ArrayBuffer, redactedBoxes?: { page: number; x: number; y: number; width: number; height: number }[]): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  // If specific boxes given, draw blackout blocks, otherwise default blackout sample on page 1
  if (redactedBoxes && redactedBoxes.length > 0) {
    redactedBoxes.forEach((box) => {
      if (pages[box.page - 1]) {
        pages[box.page - 1].drawRectangle({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          color: rgb(0, 0, 0),
        });
      }
    });
  }

  // Strip metadata to prevent leak
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('NEXORA Privacy Redactor');
  doc.setCreator('NEXORA Tools Pro');

  return await doc.save({ useObjectStreams: true });
}

export async function sanitizePdfMetadata(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  doc.setTitle('Document');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('NEXORA Sanitizer Engine');
  doc.setCreator('NEXORA Tools Pro');
  doc.setCreationDate(new Date());
  doc.setModificationDate(new Date());

  return await doc.save({ useObjectStreams: true });
}

export async function extractTextFromPdf(
  buffer: ArrayBuffer,
  onProgress?: (pct: number, status: string) => void
): Promise<string> {
  const pdfjsLib = await getPdfJsLib();
  if (!pdfjsLib) throw new Error('PDF parsing library unavailable.');

  onProgress?.(15, 'Reading PDF structure...');
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(15 + Math.round((i / numPages) * 75), `Extracting text from page ${i} of ${numPages}...`);
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const items = (textContent.items || []) as any[];
    const pageText = items.map((item) => item.str || '').join(' ').trim();

    if (pageText && pageText.length > 20) {
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    } else {
      // Scanned page fallback with OCR
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          const ocrResult = await runOcr(dataUrl, 'eng');
          if (ocrResult.text && ocrResult.text.trim()) {
            fullText += `--- Page ${i} (OCR Scanned) ---\n${ocrResult.text.trim()}\n\n`;
          }
        }
        canvas.width = 0;
        canvas.height = 0;
      } catch (e) {
        fullText += `--- Page ${i} ---\n[Image/Non-Text Content]\n\n`;
      }
    }
  }

  onProgress?.(100, 'Text extraction complete!');
  return fullText.trim() || 'No readable text could be extracted from this PDF document.';
}

export async function htmlToPdf(htmlString: string, title?: string): Promise<Blob> {
  const cleanText = htmlString.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(title || 'Document', 40, 40);

  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(10);
  const splitLines = pdf.splitTextToSize(cleanText, 515);

  let y = 65;
  for (let i = 0; i < splitLines.length; i++) {
    if (y > 780) {
      pdf.addPage();
      y = 45;
    }
    pdf.text(splitLines[i], 40, y);
    y += 15;
  }

  return pdf.output('blob');
}

export async function csvToPdf(csvString: string, title?: string): Promise<Blob> {
  const workbook = XLSX.read(csvString, { type: 'string' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(title || 'CSV Data Table', 40, 40);

  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(9);

  let y = 60;
  const rowHeight = 16;
  const colWidth = 90;

  for (let r = 0; r < Math.min(jsonData.length, 250); r++) {
    const row = jsonData[r] || [];
    if (y > 540) {
      pdf.addPage();
      y = 40;
    }

    for (let c = 0; c < Math.min(row.length, 8); c++) {
      const cellVal = String(row[c] ?? '');
      pdf.text(cellVal.slice(0, 20), 40 + c * colWidth, y);
    }
    y += rowHeight;
  }

  return pdf.output('blob');
}

export async function epubToPdf(file: File): Promise<Blob> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const htmlFiles = Object.keys(loadedZip.files).filter((path) => path.endsWith('.html') || path.endsWith('.xhtml') || path.endsWith('.htm'));

  let bookText = '';
  for (const hf of htmlFiles) {
    const content = await loadedZip.file(hf)?.async('string');
    if (content) {
      const plain = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      bookText += plain + '\n\n';
    }
  }

  return await htmlToPdf(bookText, file.name.replace(/\.epub$/i, ''));
}

/**
 * ----------------------------------------------------
 * 2. EXCEL & SPREADSHEET ADVANCED ENGINES
 * ----------------------------------------------------
 */

export async function excelToPdf(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(`${file.name.replace(/\.[^/.]+$/, '')} — Sheet: ${sheetName}`, 40, 40);

  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(9);

  let y = 65;
  const rowHeight = 18;
  const colWidth = 90;

  for (let r = 0; r < Math.min(jsonData.length, 100); r++) {
    const row = jsonData[r] || [];
    if (y > 540) {
      pdf.addPage();
      y = 40;
    }

    for (let c = 0; c < Math.min(row.length, 8); c++) {
      const cellVal = String(row[c] ?? '');
      pdf.text(cellVal.slice(0, 20), 40 + c * colWidth, y);
    }
    y += rowHeight;
  }

  return pdf.output('blob');
}

export async function xlsxToCsv(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
  return new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
}

export async function csvToXlsx(file: File): Promise<Blob> {
  const text = await file.text();
  const workbook = XLSX.read(text, { type: 'string' });
  const outBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function excelToJson(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const result: Record<string, any[]> = {};
  workbook.SheetNames.forEach((sheet) => {
    result[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
  });
  return JSON.stringify(result, null, 2);
}

export async function jsonToExcel(jsonString: string): Promise<Blob> {
  const parsed = JSON.parse(jsonString);
  const data = Array.isArray(parsed) ? parsed : [parsed];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  const outBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function excelToTxt(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  return jsonData.map((row) => row.join('\t')).join('\n');
}

export async function excelToHtml(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const htmlTable = XLSX.utils.sheet_to_html(worksheet);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title><style>body{font-family:sans-serif;padding:30px;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ddd;padding:8px;}tr:nth-child(even){background-color:#f9f9f9;}th{padding-top:12px;padding-bottom:12px;text-align:left;background-color:#2563eb;color:white;}</style></head><body><h2>${file.name} - ${sheetName}</h2>${htmlTable}</body></html>`;
}

export async function cleanAndDedupeCsv(file: File): Promise<string> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const output: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue; // remove empty rows
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      output.push(trimmed);
    }
  }

  return output.join('\n');
}

export async function formatCsv(file: File): Promise<string> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(',').map((c) => c.trim()).join(', '))
    .join('\n');
}

/**
 * ----------------------------------------------------
 * 3. WORD & DOCUMENT ADVANCED ENGINES
 * ----------------------------------------------------
 */

export async function docxToPdf(file: File): Promise<Blob> {
  let plainText = '';
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: raw } = await mammoth.extractRawText({ arrayBuffer });
    plainText = raw;
  } catch (_) {
    // Fallback for non-zip legacy .doc or raw text
    plainText = await file.text();
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(11);
  const splitLines = pdf.splitTextToSize(plainText || 'Document Content', 515);

  let y = 50;
  for (let i = 0; i < splitLines.length; i++) {
    if (y > 780) {
      pdf.addPage();
      y = 50;
    }
    pdf.text(splitLines[i], 40, y);
    y += 16;
  }

  return pdf.output('blob');
}

export async function docxToTxt(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });
    return rawText;
  } catch (_) {
    return await file.text();
  }
}

export async function docxToHtml(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6;padding:20px;}</style></head><body>${html}</body></html>`;
  } catch (_) {
    const txt = await file.text();
    return `<!DOCTYPE html><html><body><pre>${txt}</pre></body></html>`;
  }
}

export async function docxToMarkdown(file: File): Promise<string> {
  const rawText = await docxToTxt(file);
  const paragraphs = rawText.split('\n\n');
  return paragraphs.map((p) => p.trim()).filter(Boolean).join('\n\n');
}

export async function cleanWordDocument(file: File): Promise<Blob> {
  const rawText = await docxToTxt(file);
  const cleanedText = rawText
    .replace(/[ \t]+/g, ' ')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n\n');

  return await textToDocx(cleanedText, file.name.replace(/\.[^/.]+$/, ''));
}

export async function cleanWordMetadata(file: File): Promise<Blob> {
  const rawText = await docxToTxt(file);
  return await textToDocx(rawText, file.name.replace(/\.[^/.]+$/, ''));
}

export async function findAndReplaceInDocx(file: File, search: string, replacement: string): Promise<Blob> {
  const rawText = await docxToTxt(file);
  const modifiedText = search ? rawText.split(search).join(replacement) : rawText;
  return await textToDocx(modifiedText, file.name.replace(/\.[^/.]+$/, ''));
}

export async function compressDocx(file: File): Promise<Blob> {
  const rawText = await docxToTxt(file);
  return await textToDocx(rawText, file.name.replace(/\.[^/.]+$/, ''));
}

export async function textToDocx(text: string, title?: string): Promise<Blob> {
  const lines = text.split(/\r?\n/);
  const paragraphs = lines.map((line) => {
    return new Paragraph({
      children: [new TextRun({ text: line, size: 24 })],
      spacing: { after: 120 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title || 'Document',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 240 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function analyzeDocument(file: File): Promise<{
  reportText: string;
  metrics: {
    words: number;
    characters: number;
    charsNoSpaces: number;
    lines: number;
    sentences: number;
    paragraphs: number;
    readingTimeMin: number;
  };
}> {
  let content = '';
  if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    content = await docxToTxt(file);
  } else if (file.name.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    content = await extractTextFromPdf(buffer);
  } else {
    content = await file.text();
  }

  const metrics = await countDocumentWordsAndMetrics(content);
  const reportText = `DOCUMENT ANALYSIS REPORT: ${file.name}
Generated by NEXORA Tools Pro

----------------------------------------
📊 STATISTICAL METRICS:
----------------------------------------
• Total Words: ${metrics.words.toLocaleString()}
• Total Characters (with spaces): ${metrics.characters.toLocaleString()}
• Characters (without spaces): ${metrics.charsNoSpaces.toLocaleString()}
• Total Lines: ${metrics.lines.toLocaleString()}
• Total Sentences: ${metrics.sentences.toLocaleString()}
• Paragraphs: ${metrics.paragraphs.toLocaleString()}
• Estimated Reading Time: ~${metrics.readingTimeMin} minute(s)
• Estimated Speaking Time: ~${Math.ceil(metrics.words / 130)} minute(s)

----------------------------------------
📝 SUMMARY PREVIEW:
----------------------------------------
${content.slice(0, 500)}${content.length > 500 ? '...' : ''}
`;

  return { reportText, metrics };
}

export async function countDocumentWordsAndMetrics(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const lines = text.split(/\r?\n/).length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  const readingTimeMin = Math.ceil(words / 200);

  return {
    words,
    characters,
    charsNoSpaces,
    lines,
    sentences,
    paragraphs,
    readingTimeMin,
  };
}

/**
 * ----------------------------------------------------
 * 4. POWERPOINT PPTX & RTF ENGINES
 * ----------------------------------------------------
 */

export async function pptxToPdfOrText(file: File): Promise<{ text: string; pdfBlob: Blob }> {
  const zip = new JSZip();
  let fullText = '';
  let slideFiles: string[] = [];

  try {
    const loadedZip = await zip.loadAsync(file);
    slideFiles = Object.keys(loadedZip.files).filter((path) => path.startsWith('ppt/slides/slide') && path.endsWith('.xml'));

    for (let i = 1; i <= slideFiles.length; i++) {
      const slidePath = `ppt/slides/slide${i}.xml`;
      if (loadedZip.file(slidePath)) {
        const xmlContent = await loadedZip.file(slidePath)!.async('string');
        const textMatches = xmlContent.match(/<a:t>([^<]+)<\/a:t>/g);
        const slideText = textMatches ? textMatches.map((m) => m.replace(/<\/?a:t>/g, '')).join(' ') : '';
        fullText += `\n--- Slide ${i} ---\n${slideText}\n`;
      }
    }
  } catch (_) {
    fullText = `PowerPoint Presentation: ${file.name}\n`;
  }

  if (!fullText.trim()) {
    fullText = `PowerPoint Presentation: ${file.name}\nTotal Slides: ${slideFiles.length || 1}\n`;
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(file.name.replace(/\.[^/.]+$/, ''), 40, 40);

  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(11);
  const lines = pdf.splitTextToSize(fullText, 760);

  let y = 70;
  for (const line of lines) {
    if (y > 540) {
      pdf.addPage();
      y = 40;
    }
    pdf.text(line, 40, y);
    y += 16;
  }

  return {
    text: fullText,
    pdfBlob: pdf.output('blob'),
  };
}

export async function countPptSlides(file: File): Promise<string> {
  const { text } = await pptxToPdfOrText(file);
  const slideCount = (text.match(/--- Slide \d+ ---/g) || []).length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return `POWERPOINT SLIDE METRICS REPORT: ${file.name}
----------------------------------------
• Total Slides: ${slideCount || 1}
• Total Words across Slides: ${wordCount.toLocaleString()}
• Estimated Presentation Time: ~${Math.ceil(wordCount / 120)} minutes
----------------------------------------
SLIDE CONTENT BREAKDOWN:
${text}
`;
}

export async function rtfToPdf(file: File): Promise<Blob> {
  const rtfText = await file.text();
  // Strip RTF control tags
  const plain = rtfText.replace(/\\([a-z]{1,32})(-?\d+)? ?/gi, ' ')
    .replace(/[{}\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(11);
  const lines = pdf.splitTextToSize(plain || 'RTF Document', 515);

  let y = 50;
  for (const line of lines) {
    if (y > 780) {
      pdf.addPage();
      y = 50;
    }
    pdf.text(line, 40, y);
    y += 16;
  }

  return pdf.output('blob');
}

export async function pdfToRtf(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const text = await extractTextFromPdf(buffer);
  const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Helvetica;}}\\f0\\fs22 ${text.replace(/\n/g, '\\par\n')}}`;
  return new Blob([rtfContent], { type: 'application/rtf' });
}

export async function pdfToExcel(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const text = await extractTextFromPdf(buffer);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.map((l) => l.split(/\s{2,}|\t/).filter(Boolean));

  const worksheet = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [['PDF Content'], [text]]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');
  const outBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function pdfToCsv(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const text = await extractTextFromPdf(buffer);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const csvRows = lines.map((l) => `"${l.replace(/"/g, '""')}"`);
  return new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
}

/**
 * ----------------------------------------------------
 * 5. ADVANCED IMAGE & FILTER ENGINES
 * ----------------------------------------------------
 */

export async function applyImageFilter(
  file: File,
  filterType: 'grayscale' | 'bw' | 'sharpen' | 'blur' | 'brightness' | 'contrast',
  intensity: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      if (filterType === 'grayscale') {
        ctx.filter = `grayscale(${Math.min(100, intensity * 100)}%)`;
      } else if (filterType === 'bw') {
        ctx.filter = 'grayscale(100%) contrast(200%)';
      } else if (filterType === 'blur') {
        ctx.filter = `blur(${intensity * 4}px)`;
      } else if (filterType === 'brightness') {
        ctx.filter = `brightness(${intensity * 100}%)`;
      } else if (filterType === 'contrast') {
        ctx.filter = `contrast(${intensity * 100}%)`;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image filtering failed'));
        },
        file.type.includes('png') ? 'image/png' : 'image/jpeg',
        0.92
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for filtering'));
    img.src = URL.createObjectURL(file);
  });
}

export async function createImagesZip(files: File[]): Promise<Blob> {
  const zip = new JSZip();
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buffer = await f.arrayBuffer();
    zip.file(f.name, buffer);
  }
  return await zip.generateAsync({ type: 'blob' });
}

export async function extractZipArchive(file: File): Promise<{ name: string; blob: Blob }[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);
  const results: { name: string; blob: Blob }[] = [];

  const fileEntries = Object.keys(loaded.files).filter((k) => !loaded.files[k].dir);
  for (const name of fileEntries) {
    const blob = await loaded.files[name].async('blob');
    results.push({ name, blob });
  }

  return results;
}

/**
 * ----------------------------------------------------
 * 6. TEXT TOOLS & REGEX EXTRACTORS
 * ----------------------------------------------------
 */

export function extractEntitiesFromText(text: string, type: 'emails' | 'urls' | 'phones' | 'numbers' | 'hashtags' | 'mentions'): string[] {
  if (!text) return [];

  if (type === 'emails') {
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    return Array.from(new Set(matches || []));
  }
  if (type === 'urls') {
    const matches = text.match(/https?:\/\/[^\s/$.?#].[^\s]*/gi);
    return Array.from(new Set(matches || []));
  }
  if (type === 'phones') {
    const matches = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
    return Array.from(new Set(matches || []));
  }
  if (type === 'numbers') {
    const matches = text.match(/\b\d+(?:\.\d+)?\b/g);
    return Array.from(new Set(matches || []));
  }
  if (type === 'hashtags') {
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    return Array.from(new Set(matches || []));
  }
  if (type === 'mentions') {
    const matches = text.match(/@[a-zA-Z0-9_]+/g);
    return Array.from(new Set(matches || []));
  }

  return [];
}

export function transformTextCase(text: string, mode: 'upper' | 'lower' | 'title' | 'sentence' | 'capitalize'): string {
  if (!text) return '';

  if (mode === 'upper') return text.toUpperCase();
  if (mode === 'lower') return text.toLowerCase();
  if (mode === 'title') {
    return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  if (mode === 'sentence') {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  }
  if (mode === 'capitalize') {
    return text.replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return text;
}

export function cleanTextLines(text: string, mode: 'remove-spaces' | 'remove-blank' | 'remove-duplicates' | 'sort-az' | 'sort-za' | 'reverse'): string {
  if (!text) return '';

  if (mode === 'remove-spaces') {
    return text.replace(/[ \t]+/g, ' ').trim();
  }
  if (mode === 'remove-blank') {
    return text.split(/\r?\n/).filter((l) => l.trim().length > 0).join('\n');
  }
  if (mode === 'remove-duplicates') {
    const lines = text.split(/\r?\n/);
    return Array.from(new Set(lines)).join('\n');
  }
  if (mode === 'sort-az') {
    return text.split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join('\n');
  }
  if (mode === 'sort-za') {
    return text.split(/\r?\n/).sort((a, b) => b.localeCompare(a)).join('\n');
  }
  if (mode === 'reverse') {
    return text.split(/\r?\n/).reverse().join('\n');
  }

  return text;
}

/**
 * ----------------------------------------------------
 * 7. FILE HASHES & CRYPTO CHECKSUMS
 * ----------------------------------------------------
 */

export async function calculateFileHash(file: File, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
