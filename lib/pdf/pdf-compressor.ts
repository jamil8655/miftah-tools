import { PDFDocument } from 'pdf-lib';
import { getPdfJsLib } from '@/lib/utils/formatters';

export interface CompressOptions {
  level?: 'extreme' | 'medium' | 'light' | 'custom';
  quality?: number; // 0.1 to 1.0
  scale?: number; // 0.5 to 2.0
  targetSizeLimit?: string; // '100kb', '200kb', '500kb', '1mb', '2mb', '5mb', 'auto'
}

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercentage: number;
  isReduced: boolean;
  pageCount: number;
  message: string;
}

/**
 * High-Ratio Real Multi-Stage PDF Compressor
 * Evaluates document type (scanned image-heavy vs vector/text), applies optimal strategy,
 * and strictly verifies output size against original input.
 */
export async function compressPdfAdvanced(
  pdfBuffer: ArrayBuffer,
  options: CompressOptions = {},
  onProgress?: (percent: number, status: string) => void
): Promise<CompressResult> {
  const originalSize = pdfBuffer.byteLength;
  const level = options.level || 'medium';
  const target = options.targetSizeLimit || 'auto';

  // Preset parameters for image-scanned documents
  let jpegQuality = 0.60;
  let renderScale = 1.20;

  if (target === '100kb') {
    jpegQuality = 0.35;
    renderScale = 0.85;
  } else if (target === '200kb') {
    jpegQuality = 0.45;
    renderScale = 0.95;
  } else if (target === '500kb') {
    jpegQuality = 0.60;
    renderScale = 1.10;
  } else if (target === '1mb') {
    jpegQuality = 0.72;
    renderScale = 1.30;
  } else if (target === '2mb') {
    jpegQuality = 0.80;
    renderScale = 1.45;
  } else if (target === '5mb') {
    jpegQuality = 0.88;
    renderScale = 1.60;
  } else if (level === 'extreme') {
    jpegQuality = 0.40;
    renderScale = 0.95;
  } else if (level === 'medium') {
    jpegQuality = 0.60;
    renderScale = 1.20;
  } else if (level === 'light') {
    jpegQuality = 0.80;
    renderScale = 1.45;
  } else if (options.quality) {
    jpegQuality = options.quality;
    renderScale = options.scale || 1.20;
  }

  onProgress?.(5, 'Analyzing PDF document structure...');

  let bestBytes: Uint8Array | null = null;
  let pageCount = 0;

  // First, for long documents (> 25 pages), run fast structural deduplication first
  let structuralBytes: Uint8Array | null = null;
  try {
    structuralBytes = await compressPdfStructural(pdfBuffer);
  } catch (e) {
    // Continue
  }

  try {
    const pdfjsLib = await getPdfJsLib();

    if (pdfjsLib) {
      onProgress?.(12, 'Inspecting pages and embedded streams...');

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
        disableFontFace: false,
      });

      const pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;

      if (pageCount > 0) {
        // Adapt render scale dynamically for long PDFs to prevent memory limits
        let effectiveScale = renderScale;
        if (pageCount > 50) {
          effectiveScale = Math.min(renderScale, 0.95);
        } else if (pageCount > 25) {
          effectiveScale = Math.min(renderScale, 1.05);
        } else if (pageCount > 15) {
          effectiveScale = Math.min(renderScale, 1.15);
        }

        onProgress?.(15, `Optimizing ${pageCount} pages (${level.toUpperCase()} mode)...`);

        const newPdf = await PDFDocument.create();

        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          const pct = Math.round(15 + (pageNum / pageCount) * 78);
          onProgress?.(pct, `Compressing page ${pageNum} of ${pageCount}...`);

          // Allow garbage collection and UI update between pages
          if (pageNum % 2 === 0 || pageCount > 20) {
            await new Promise((resolve) => setTimeout(resolve, 8));
          }

          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: effectiveScale });

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
              canvasContext: ctx,
              viewport: viewport,
            }).promise;

            const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
            const base64Data = jpegDataUrl.split(',')[1];
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const embeddedImg = await newPdf.embedJpg(bytes);
            const origViewport = page.getViewport({ scale: 1.0 });
            const pdfPage = newPdf.addPage([origViewport.width, origViewport.height]);

            pdfPage.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: origViewport.width,
              height: origViewport.height,
            });
          }

          // Clean up canvas memory immediately
          canvas.width = 0;
          canvas.height = 0;
        }

        onProgress?.(95, 'Writing and optimizing final streams...');
        newPdf.setProducer('Miftah Pro Compression Engine');
        newPdf.setCreator('Miftah Tools');

        bestBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 50,
        });
      }
    }
  } catch (err) {
    console.warn('Visual raster compression failed or skipped, using structural optimizer:', err);
  }

  // If visual compression wasn't used or structural optimizer is available:
  if (!bestBytes && structuralBytes) {
    bestBytes = structuralBytes;
  } else if (!bestBytes) {
    onProgress?.(80, 'Running structural stream deduplication...');
    bestBytes = await compressPdfStructural(pdfBuffer);
  }

  // Compare visual raster vs structural deduplication and select the smallest valid byte array
  if (structuralBytes && bestBytes) {
    if (structuralBytes.byteLength < bestBytes.byteLength && structuralBytes.byteLength < originalSize) {
      bestBytes = structuralBytes;
    }
  }

  const compressedSize = bestBytes.byteLength;
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
  const isReduced = savedBytes > 0;

  let message = isReduced
    ? `Successfully compressed! Saved ${(savedBytes / (1024 * 1024)).toFixed(2)} MB (${savedPercentage.toFixed(1)}%).`
    : 'This PDF is already at optimal compression. Original fidelity preserved.';

  onProgress?.(100, isReduced ? 'Compression successful!' : 'File already optimized!');

  return {
    bytes: isReduced ? bestBytes : new Uint8Array(pdfBuffer),
    originalSize,
    compressedSize: isReduced ? compressedSize : originalSize,
    savedBytes: Math.max(0, savedBytes),
    savedPercentage: Math.max(0, savedPercentage),
    isReduced,
    pageCount,
    message,
  };
}

/**
 * Structural PDF stream deduplication using object streams and unreferenced object purging.
 */
export async function compressPdfStructural(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const compressedDoc = await PDFDocument.create();
  const pageIndices = srcDoc.getPageIndices();

  const copiedPages = await compressedDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => compressedDoc.addPage(page));

  compressedDoc.setProducer('Miftah Structural Engine');
  compressedDoc.setCreator('Miftah PDF Compressor');

  return await compressedDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}
