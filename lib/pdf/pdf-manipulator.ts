import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
  PDFName,
  PDFArray,
  PDFDict,
  PDFRawStream,
  decodePDFRawStream,
} from 'pdf-lib';
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
  mode: 'all' | 'range' | 'every' | 'odd-even' = 'all',
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
  } else if (mode === 'odd-even') {
    // Extract Odd Pages
    const oddIndices: number[] = [];
    const evenIndices: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if ((i + 1) % 2 !== 0) oddIndices.push(i);
      else evenIndices.push(i);
    }

    if (oddIndices.length > 0) {
      const oddDoc = await PDFDocument.create();
      const oddPages = await oddDoc.copyPages(srcDoc, oddIndices);
      oddPages.forEach((p) => oddDoc.addPage(p));
      const oddBytes = await oddDoc.save({ useObjectStreams: true });
      results.push({ name: 'odd-pages.pdf', bytes: oddBytes });
    }

    if (evenIndices.length > 0) {
      const evenDoc = await PDFDocument.create();
      const evenPages = await evenDoc.copyPages(srcDoc, evenIndices);
      evenPages.forEach((p) => evenDoc.addPage(p));
      const evenBytes = await evenDoc.save({ useObjectStreams: true });
      results.push({ name: 'even-pages.pdf', bytes: evenBytes });
    }
  } else if (mode === 'every') {
    const chunkSize = rangeStr ? parseInt(rangeStr, 10) || 2 : 2;
    for (let i = 0; i < totalPages; i += chunkSize) {
      const chunkIndices: number[] = [];
      for (let j = i; j < Math.min(totalPages, i + chunkSize); j++) {
        chunkIndices.push(j);
      }
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, chunkIndices);
      copied.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save({ useObjectStreams: true });
      results.push({ name: `split-part-${Math.floor(i / chunkSize) + 1}.pdf`, bytes });
    }
  } else if (mode === 'range') {
    const targetIndices = new Set<number>();
    const effectiveRange = rangeStr && rangeStr.trim() ? rangeStr.trim() : `1-${totalPages}`;
    const parts = effectiveRange.split(',').map((p) => p.trim());

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
    } else {
      // Fallback: copy whole doc
      const newDoc = await PDFDocument.create();
      const allPages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      allPages.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save({ useObjectStreams: true });
      results.push({ name: `extracted-pages.pdf`, bytes });
    }
  }

  return results.length > 0 ? results : [{ name: 'extracted.pdf', bytes: new Uint8Array(pdfBuffer) }];
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

  compressedDoc.setProducer('Miftah Optimized Engine');
  compressedDoc.setCreator('Miftah PDF Compressor');

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

export type WatermarkPosition =
  | 'center-diagonal'
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tile'
  | 'custom';

export interface WatermarkOptions {
  watermarkText?: string;
  opacity?: number;
  colorHex?: string;
  watermarkImage?: string;
  position?: WatermarkPosition;
  customX?: number; // 0-100 percentage
  customY?: number; // 0-100 percentage
  rotation?: number; // degrees
  fontSize?: number; // pt size
  pageRange?: 'all' | 'first' | 'except-first';
}

export interface RemoveWatermarkOptions {
  targetKeyword?: string;
  mode?: 'smart' | 'scanned';
}

/**
 * Add a highly customizable watermark (text or image) to PDF pages.
 * Supports 9-point grid placement, classic diagonal, full-page tiling, and custom coordinates.
 */
export async function watermarkPdf(
  pdfBuffer: ArrayBuffer,
  watermarkTextOrOptions: string | WatermarkOptions = 'CONFIDENTIAL',
  legacyOpacity?: number,
  legacyColorHex?: string,
  legacyWatermarkImage?: string,
  extraOptions?: Partial<WatermarkOptions>
): Promise<Uint8Array> {
  const opts: WatermarkOptions =
    typeof watermarkTextOrOptions === 'object' && watermarkTextOrOptions !== null
      ? watermarkTextOrOptions
      : {
          watermarkText: watermarkTextOrOptions || 'CONFIDENTIAL',
          opacity: legacyOpacity,
          colorHex: legacyColorHex,
          watermarkImage: legacyWatermarkImage,
          ...extraOptions,
        };

  const watermarkText = opts.watermarkText ?? 'CONFIDENTIAL';
  const opacity = opts.opacity !== undefined ? Number(opts.opacity) : 0.3;
  const colorHex = opts.colorHex || '#ff0000';
  const position: WatermarkPosition = (opts.position as WatermarkPosition) || 'center-diagonal';
  const customX = opts.customX ?? 50;
  const customY = opts.customY ?? 50;
  const pageRange = opts.pageRange || 'all';

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  const r = parseInt(colorHex.slice(1, 3), 16) / 255 || 0.8;
  const g = parseInt(colorHex.slice(3, 5), 16) / 255 || 0.1;
  const b = parseInt(colorHex.slice(5, 7), 16) / 255 || 0.1;

  let embeddedImg: any = null;
  if (opts.watermarkImage) {
    try {
      const base64Data = opts.watermarkImage.includes(',')
        ? opts.watermarkImage.split(',')[1]
        : opts.watermarkImage;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      if (opts.watermarkImage.includes('png') || opts.watermarkImage.startsWith('data:image/png')) {
        embeddedImg = await doc.embedPng(bytes);
      } else {
        embeddedImg = await doc.embedJpg(bytes);
      }
    } catch (e) {
      console.warn('Failed to embed watermark image:', e);
    }
  }

  pages.forEach((page, idx) => {
    // Page range filter
    if (pageRange === 'first' && idx !== 0) return;
    if (pageRange === 'except-first' && idx === 0) return;

    const { width, height } = page.getSize();
    const margin = 36; // 0.5 inch margin

    if (position === 'tile') {
      // ▦ Full Page Tiled / Repeating Watermark
      const tileCols = 3;
      const tileRows = 4;
      const tileAngle = opts.rotation !== undefined ? opts.rotation : 35;
      const tileRad = (tileAngle * Math.PI) / 180;
      const tCos = Math.cos(tileRad);
      const tSin = Math.sin(tileRad);

      if (embeddedImg) {
        const itemW = width * 0.18;
        const aspect = embeddedImg.height / embeddedImg.width;
        const itemH = itemW * aspect;

        for (let c = 0; c < tileCols; c++) {
          for (let rIdx = 0; rIdx < tileRows; rIdx++) {
            const cx = (width / tileCols) * (c + 0.5);
            const cy = (height / tileRows) * (rIdx + 0.5);
            page.drawImage(embeddedImg, {
              x: cx - itemW / 2,
              y: cy - itemH / 2,
              width: itemW,
              height: itemH,
              opacity: Math.max(0.05, opacity * 0.7),
              rotate: degrees(tileAngle),
            });
          }
        }
      } else if (watermarkText) {
        const tileSize = opts.fontSize || Math.min(width, height) / 22;
        const itemW = font.widthOfTextAtSize(watermarkText, tileSize);
        const itemH = font.heightAtSize(tileSize);
        const tOffsetX = (itemW / 2) * tCos - (itemH / 2) * tSin;
        const tOffsetY = (itemW / 2) * tSin + (itemH / 2) * tCos;

        for (let c = 0; c < tileCols; c++) {
          for (let rIdx = 0; rIdx < tileRows; rIdx++) {
            const cx = (width / tileCols) * (c + 0.5);
            const cy = (height / tileRows) * (rIdx + 0.5);
            page.drawText(watermarkText, {
              x: cx - tOffsetX,
              y: cy - tOffsetY,
              size: tileSize,
              font,
              color: rgb(r, g, b),
              opacity: Math.max(0.05, opacity * 0.7),
              rotate: degrees(tileAngle),
            });
          }
        }
      }
      return;
    }

    // Determine target rotation & dimensions for single placement
    let targetRotation = opts.rotation !== undefined ? opts.rotation : 0;
    if (position === 'center-diagonal') {
      targetRotation = opts.rotation !== undefined ? opts.rotation : 45;
    }

    let itemW = 0;
    let itemH = 0;
    let calculatedSize = 0;

    if (embeddedImg) {
      const maxW = width * (opts.fontSize ? opts.fontSize / 100 : 0.4);
      const aspect = embeddedImg.height / embeddedImg.width;
      itemW = maxW;
      itemH = maxW * aspect;
    } else if (watermarkText) {
      calculatedSize =
        opts.fontSize ||
        (position === 'center-diagonal' ? Math.min(width, height) / 10 : Math.min(width, height) / 14);
      itemW = font.widthOfTextAtSize(watermarkText, calculatedSize);
      itemH = font.heightAtSize(calculatedSize);
    }

    let targetCenterX = width / 2;
    let targetCenterY = height / 2;

    switch (position) {
      case 'center':
      case 'center-diagonal':
        targetCenterX = width / 2;
        targetCenterY = height / 2;
        break;
      case 'top-left':
        targetCenterX = margin + itemW / 2;
        targetCenterY = height - margin - itemH / 2;
        break;
      case 'top-center':
        targetCenterX = width / 2;
        targetCenterY = height - margin - itemH / 2;
        break;
      case 'top-right':
        targetCenterX = width - margin - itemW / 2;
        targetCenterY = height - margin - itemH / 2;
        break;
      case 'middle-left':
        targetCenterX = margin + itemW / 2;
        targetCenterY = height / 2;
        break;
      case 'middle-right':
        targetCenterX = width - margin - itemW / 2;
        targetCenterY = height / 2;
        break;
      case 'bottom-left':
        targetCenterX = margin + itemW / 2;
        targetCenterY = margin + itemH / 2;
        break;
      case 'bottom-center':
        targetCenterX = width / 2;
        targetCenterY = margin + itemH / 2;
        break;
      case 'bottom-right':
        targetCenterX = width - margin - itemW / 2;
        targetCenterY = margin + itemH / 2;
        break;
      case 'custom':
        targetCenterX = width * (Math.max(0, Math.min(100, customX)) / 100);
        targetCenterY = height * (Math.max(0, Math.min(100, customY)) / 100);
        break;
    }

    const rad = (targetRotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const offsetX = (itemW / 2) * cos - (itemH / 2) * sin;
    const offsetY = (itemW / 2) * sin + (itemH / 2) * cos;
    const drawX = targetCenterX - offsetX;
    const drawY = targetCenterY - offsetY;

    if (embeddedImg) {
      page.drawImage(embeddedImg, {
        x: drawX,
        y: drawY,
        width: itemW,
        height: itemH,
        opacity,
        rotate: degrees(targetRotation),
      });
    } else if (watermarkText) {
      page.drawText(watermarkText, {
        x: drawX,
        y: drawY,
        size: calculatedSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(targetRotation),
      });
    }
  });

  return await doc.save({ useObjectStreams: true });
}

/**
 * Remove watermarks from all pages of a PDF document.
 * Deeply purges:
 * 1. Annotation watermarks and stamps (/Annots, /Watermark, /Stamp)
 * 2. Optional Content Groups / Layer watermarks (/OCProperties)
 * 3. Marked Content Artifact blocks (/Artifact, /Watermark)
 * 4. Overlay content streams and text/image watermark blocks
 */
export async function removePdfWatermark(
  pdfBuffer: ArrayBuffer,
  options?: RemoveWatermarkOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  const userKeywords = (options?.targetKeyword || '')
    .split(/[,;\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

  const defaultKeywords = [
    'watermark',
    'confidential',
    'sample',
    'draft',
    'do not copy',
    'preview',
    'evaluation',
    'demo',
    'restricted',
    'provisional',
    'internal use only',
    'copyright',
  ];

  const allKeywords = Array.from(new Set([...defaultKeywords, ...userKeywords]));

  // Clean document catalog metadata & layers
  try {
    doc.setSubject('');
    doc.setKeywords([]);
    const catalog = doc.catalog;
    if (catalog.get(PDFName.of('OCProperties'))) {
      catalog.delete(PDFName.of('OCProperties'));
    }
  } catch (e) {
    // ignore
  }

  pages.forEach((page) => {
    // 1. Purge Watermark and Stamp Annotations
    try {
      const annots = page.node.Annots();
      if (annots && annots.size() > 0) {
        const cleanedAnnots: any[] = [];
        for (let i = 0; i < annots.size(); i++) {
          const item = annots.get(i);
          const annot = doc.context.lookup(item);
          if (annot instanceof PDFDict) {
            const subtype = annot.get(PDFName.of('Subtype'))?.toString() || '';
            const contents = annot.get(PDFName.of('Contents'))?.toString() || '';
            const nm = annot.get(PDFName.of('NM'))?.toString() || '';
            const t = annot.get(PDFName.of('T'))?.toString() || '';
            const combined = `${subtype} ${contents} ${nm} ${t}`.toLowerCase();

            const isWatermark =
              subtype === '/Watermark' ||
              subtype === '/Stamp' ||
              allKeywords.some((kw) => combined.includes(kw));

            if (!isWatermark) {
              cleanedAnnots.push(item);
            }
          } else {
            cleanedAnnots.push(item);
          }
        }
        page.node.set(PDFName.of('Annots'), doc.context.obj(cleanedAnnots));
      }
    } catch (e) {
      // ignore
    }

    // 2. Remove PieceInfo / Artifact dictionary entries
    try {
      page.node.delete(PDFName.of('PieceInfo'));
    } catch (e) {
      // ignore
    }

    // 3. Clean Content Streams
    try {
      const rawContents = page.node.get(PDFName.of('Contents'));
      if (!rawContents) return;

      const derefContents = doc.context.lookup(rawContents);
      const streamRefs: any[] = [];

      if (derefContents instanceof PDFArray) {
        for (let i = 0; i < derefContents.size(); i++) {
          streamRefs.push(derefContents.get(i));
        }
      } else if (derefContents instanceof PDFRawStream) {
        streamRefs.push(rawContents);
      }

      const keptStreams: any[] = [];

      for (const ref of streamRefs) {
        const streamObj = doc.context.lookup(ref);
        if (!(streamObj instanceof PDFRawStream)) {
          keptStreams.push(ref);
          continue;
        }

        let streamText = '';
        try {
          const decoded = decodePDFRawStream(streamObj).decode();
          streamText = Buffer.from(decoded).toString('latin1');
        } catch {
          keptStreams.push(ref);
          continue;
        }

        // A. Remove Marked Content Artifact blocks: /Artifact ... BDC ... EMC
        let cleaned = streamText.replace(
          /\/(?:Artifact|Watermark|Stamp)[\s\S]*?(?:BDC|BMC)[\s\S]*?EMC\s*/gi,
          ''
        );

        // B. Filter graphics/text blocks
        const blocks = cleaned.split(/(?=(?:^|\n)\s*q\b)/g);
        const retainedBlocks: string[] = [];

        for (const block of blocks) {
          const lower = block.toLowerCase();

          let matchKeyword = false;
          for (const kw of allKeywords) {
            if (lower.includes(kw)) {
              matchKeyword = true;
              break;
            }
            const hex = Buffer.from(kw).toString('hex').toLowerCase();
            if (lower.includes(hex)) {
              matchKeyword = true;
              break;
            }
          }

          if (matchKeyword) {
            continue; // drop watermark block
          }

          // Check if it's a rotated translucent text or graphic watermark:
          // e.g. ExtGState opacity (/GS... gs) combined with rotated matrix (Tm)
          const hasGs = /\/GS\S*\s+gs/i.test(block);
          const tmMatch =
            /([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s+Tm/i.exec(
              block
            );
          if (hasGs && tmMatch) {
            const a = Math.abs(parseFloat(tmMatch[1]));
            const bVal = Math.abs(parseFloat(tmMatch[2]));
            if (a > 0.08 && a < 0.98 && bVal > 0.08 && bVal < 0.98) {
              continue; // drop rotated translucent stamp block
            }
          }

          retainedBlocks.push(block);
        }

        const finalStreamStr = retainedBlocks.join('\n').trim();

        // If the stream is effectively empty after watermark removal, drop it
        if (!finalStreamStr || finalStreamStr === 'q\nQ' || finalStreamStr === 'q Q') {
          continue;
        }

        if (finalStreamStr !== streamText.trim()) {
          const newFlateStream = doc.context.flateStream(finalStreamStr);
          const newRef = doc.context.register(newFlateStream);
          keptStreams.push(newRef);
        } else {
          keptStreams.push(ref);
        }
      }

      if (keptStreams.length > 0) {
        page.node.set(PDFName.of('Contents'), doc.context.obj(keptStreams));
      }
    } catch (e) {
      console.warn('Could not clean content stream for page:', e);
    }
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
  doc.setProducer('Miftah Pro Engine');
  return await doc.save({ useObjectStreams: true });
}

/**
 * Helper to ensure any image format (WebP, BMP, PNG, JPG, GIF) is converted to a valid embeddable PDF image.
 * Preserves high resolution and avoids quality degradation.
 */
async function ensureEmbeddableImage(
  doc: PDFDocument,
  buffer: ArrayBuffer,
  mimeType: string
): Promise<any> {
  const cleanMime = (mimeType || '').toLowerCase();

  if (cleanMime.includes('png')) {
    try {
      return await doc.embedPng(buffer);
    } catch {
      // Fallback via high-definition canvas
    }
  } else if (cleanMime.includes('jpg') || cleanMime.includes('jpeg')) {
    try {
      return await doc.embedJpg(buffer);
    } catch {
      // Fallback via high-definition canvas
    }
  }

  // Universal high-definition canvas fallback for WebP, BMP, TIFF, GIF, HEIC or non-standard color spaces
  if (typeof window !== 'undefined') {
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' });
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image into canvas'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 1200;
    canvas.height = img.naturalHeight || img.height || 1600;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // High definition 98% JPEG quality for ultra-crisp output
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.98);
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

  // Final fallback attempt
  return await doc.embedJpg(buffer);
}

/**
 * Convert multiple image ArrayBuffers into a single styled, high-definition PDF.
 */
export async function imagesToPdf(
  images: { buffer: ArrayBuffer; mimeType: string }[],
  options?: {
    orientation?: 'auto' | 'portrait' | 'landscape';
    margin?: 'none' | 'small' | 'big';
    pageSize?: 'a4' | 'fit' | 'letter';
  }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const marginSize = options?.margin === 'none' ? 0 : options?.margin === 'big' ? 36 : 18;

  for (const img of images) {
    const embeddedImg = await ensureEmbeddableImage(doc, img.buffer, img.mimeType);

    const { width: imgW, height: imgH } = embeddedImg;
    const isLandscape = imgW > imgH;

    let pageW = 595.28; // Standard A4 width in pt
    let pageH = 841.89; // Standard A4 height in pt

    if (options?.pageSize === 'fit') {
      pageW = imgW + marginSize * 2;
      pageH = imgH + marginSize * 2;
    } else if (options?.orientation === 'landscape' || (options?.orientation !== 'portrait' && isLandscape)) {
      pageW = 841.89;
      pageH = 595.28;
    } else {
      pageW = 595.28;
      pageH = 841.89;
    }

    const page = doc.addPage([pageW, pageH]);
    const maxDrawW = Math.max(10, pageW - marginSize * 2);
    const maxDrawH = Math.max(10, pageH - marginSize * 2);

    const scale = Math.min(maxDrawW / imgW, maxDrawH / imgH);
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
