import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';
import { marked } from 'marked';

/**
 * Merge multiple PDF file ArrayBuffers into a single unified PDF.
 */
export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Split a PDF into separate pages or ranges.
 */
export async function splitPdf(
  pdfBuffer: ArrayBuffer,
  mode: 'all' | 'range' | 'every',
  rangeStr?: string
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const results: { name: string; bytes: Uint8Array }[] = [];

  if (mode === 'all') {
    for (let i = 0; i < totalPages; i++) {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);
      const bytes = await newDoc.save({ useObjectStreams: true });
      results.push({ name: `page-${i + 1}.pdf`, bytes });
    }
  } else if (mode === 'range' && rangeStr) {
    const targetIndices = new Set<number>();
    const parts = rangeStr.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
            targetIndices.add(p - 1);
          }
        }
      } else {
        const p = Number(part);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          targetIndices.add(p - 1);
        }
      }
    }

    const sortedIndices = Array.from(targetIndices).sort((a, b) => a - b);
    if (sortedIndices.length > 0) {
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, sortedIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const bytes = await newDoc.save({ useObjectStreams: true });
      results.push({ name: `extracted-pages.pdf`, bytes });
    }
  }

  return results;
}

/**
 * Compress PDF document by stripping orphaned object streams, dead revisions,
 * and saving using optimized object streams.
 */
export async function compressPdf(
  pdfBuffer: ArrayBuffer,
  level: 'low' | 'medium' | 'high' = 'medium'
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const compressedDoc = await PDFDocument.create();
  const pageIndices = srcDoc.getPageIndices();

  const copiedPages = await compressedDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => compressedDoc.addPage(page));

  compressedDoc.setProducer('NEXORA Optimized Engine');
  compressedDoc.setCreator('NEXORA PDF Compressor');

  const compressedBytes = await compressedDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  return compressedBytes;
}

/**
 * Rotate all or specific pages of a PDF by a given angle (90, 180, 270).
 */
export async function rotatePdfPages(pdfBuffer: ArrayBuffer, angle: number): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  });

  return await doc.save({ useObjectStreams: true });
}

/**
 * Reorder PDF pages according to an array of 0-based page indices.
 */
export async function reorderPdfPages(pdfBuffer: ArrayBuffer, newOrder: number[]): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Reverse the order of all pages in a PDF.
 */
export async function reversePdfPages(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const total = srcDoc.getPageCount();
  const reverseOrder = Array.from({ length: total }, (_, i) => total - 1 - i);
  return await reorderPdfPages(pdfBuffer, reverseOrder);
}

/**
 * Add a diagonal or centered text watermark stamp to all pages.
 */
export async function watermarkPdf(
  pdfBuffer: ArrayBuffer,
  watermarkText: string,
  opacity: number = 0.3,
  colorHex: string = '#ff0000'
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  const r = parseInt(colorHex.slice(1, 3), 16) / 255 || 0.8;
  const g = parseInt(colorHex.slice(3, 5), 16) / 255 || 0.1;
  const b = parseInt(colorHex.slice(5, 7), 16) / 255 || 0.1;

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textSize = Math.min(width, height) / 10;

    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: textSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(45),
    });
  });

  return await doc.save({ useObjectStreams: true });
}

/**
 * Add page numbers to header or footer of all pages in a PDF.
 */
export async function addPageNumbers(
  pdfBuffer: ArrayBuffer,
  position: 'bottom-center' | 'bottom-right' | 'top-right' = 'bottom-center',
  format: 'Page X of Y' | 'X/Y' | 'X' = 'Page X of Y'
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const pageNum = idx + 1;
    const { width, height } = page.getSize();
    let text = `${pageNum}`;
    if (format === 'Page X of Y') text = `Page ${pageNum} of ${total}`;
    if (format === 'X/Y') text = `${pageNum}/${total}`;

    let x = width / 2 - 25;
    let y = 25;

    if (position === 'bottom-right') {
      x = width - 80;
      y = 25;
    } else if (position === 'top-right') {
      x = width - 80;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await doc.save({ useObjectStreams: true });
}

/**
 * Edit PDF metadata properties (Title, Author, Subject, Keywords).
 */
export async function editPdfMetadata(
  pdfBuffer: ArrayBuffer,
  meta: { title?: string; author?: string; subject?: string; keywords?: string }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  if (meta.title) doc.setTitle(meta.title);
  if (meta.author) doc.setAuthor(meta.author);
  if (meta.subject) doc.setSubject(meta.subject);
  if (meta.keywords) doc.setKeywords(meta.keywords.split(',').map((k) => k.trim()));
  doc.setProducer('NEXORA Pro Engine');
  return await doc.save({ useObjectStreams: true });
}

/**
 * Helper to ensure any image format (WebP, BMP, PNG, JPG, GIF) is converted to a valid embeddable PDF image.
 */
async function ensureEmbeddableImage(
  doc: PDFDocument,
  buffer: ArrayBuffer,
  mimeType: string
): Promise<any> {
  if (mimeType.includes('png')) {
    try {
      return await doc.embedPng(buffer);
    } catch {
      // Fallback via canvas
    }
  } else if (mimeType.includes('jpg') || mimeType.includes('jpeg')) {
    try {
      return await doc.embedJpg(buffer);
    } catch {
      // Fallback via canvas
    }
  }

  // Universal canvas fallback for WebP, BMP, TIFF, GIF, or corrupted headers
  if (typeof window !== 'undefined') {
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' });
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image format into canvas'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    canvas.width = 0;
    canvas.height = 0;
    URL.revokeObjectURL(objectUrl);

    const base64 = jpegDataUrl.split(',')[1];
    const bin = window.atob(base64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = bin.charCodeAt(i);
    }

    return await doc.embedJpg(bytes);
  }

  // Fallback try
  return await doc.embedJpg(buffer);
}

/**
 * Convert multiple image ArrayBuffers into a single styled PDF.
 */
export async function imagesToPdf(
  images: { buffer: ArrayBuffer; mimeType: string }[],
  options?: { orientation?: 'auto' | 'portrait' | 'landscape'; margin?: 'none' | 'small' | 'big' }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const marginSize = options?.margin === 'none' ? 0 : options?.margin === 'big' ? 40 : 20;

  for (const img of images) {
    const embeddedImg = await ensureEmbeddableImage(doc, img.buffer, img.mimeType);

    const { width: imgW, height: imgH } = embeddedImg;
    let pageW = imgW + marginSize * 2;
    let pageH = imgH + marginSize * 2;

    if (options?.orientation === 'portrait') {
      pageW = 595.28; // A4 standard
      pageH = 841.89;
    } else if (options?.orientation === 'landscape') {
      pageW = 841.89;
      pageH = 595.28;
    }

    const page = doc.addPage([pageW, pageH]);
    const maxDrawW = pageW - marginSize * 2;
    const maxDrawH = pageH - marginSize * 2;
    const scale = Math.min(maxDrawW / imgW, maxDrawH / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    page.drawImage(embeddedImg, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  return await doc.save({ useObjectStreams: true });
}

/**
 * Convert plain text or TXT file to a clean paginated PDF.
 */
export async function textToPdf(text: string, options?: { fontSize?: number }): Promise<Uint8Array> {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const fontSize = options?.fontSize || 12;
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', 'normal');

  const lines = pdf.splitTextToSize(text, 515); // A4 width 595 - 40 margin each side
  const pageHeight = 841;
  const lineHeight = fontSize * 1.5;
  let cursorY = 50;

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - 50) {
      pdf.addPage();
      cursorY = 50;
    }
    pdf.text(lines[i], 40, cursorY);
    cursorY += lineHeight;
  }

  const arrayBuffer = pdf.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert Markdown string to PDF.
 */
export async function markdownToPdf(markdown: string): Promise<Uint8Array> {
  return await textToPdf(markdown, { fontSize: 11 });
}
