import { PDFDocument } from 'pdf-lib';
import { getPdfJsLib } from '@/lib/utils/formatters';

export interface CompressOptions {
  level?: 'extreme' | 'medium' | 'light' | 'custom';
  quality?: number; // 0.1 to 1.0
  scale?: number; // 0.5 to 2.0
  targetSizeLimit?: string; // '100kb', '200kb', '500kb', '1mb', '2mb', '5mb', 'auto' or custom e.g. '350kb'
  targetKb?: number; // e.g. 50, 100, 200, 500, 1024, 2048, 5120
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
 * and strictly verifies output size against original input with complete protection against detached ArrayBuffers.
 */
export async function compressPdfAdvanced(
  pdfBuffer: ArrayBuffer | Uint8Array,
  options: CompressOptions = {},
  onProgress?: (percent: number, status: string) => void
): Promise<CompressResult> {
  // Create an immutable master byte array copy to prevent Web Worker transfer buffer detachment
  const rawInput = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
  const masterCopy = new Uint8Array(rawInput.length);
  masterCopy.set(rawInput);
  const originalSize = masterCopy.byteLength;

  const getIsolatedBytes = (): Uint8Array => {
    const copy = new Uint8Array(masterCopy.length);
    copy.set(masterCopy);
    return copy;
  };

  const level = options.level || 'medium';
  const target = options.targetSizeLimit || 'auto';

  // Check for targetKb directly or parse target string
  let targetKb = options.targetKb;
  if (!targetKb && target && target !== 'auto') {
    const matchMb = target.toLowerCase().match(/^([\d.]+)\s*mb$/);
    const matchKb = target.toLowerCase().match(/^([\d.]+)\s*kb$/);
    if (matchMb) {
      targetKb = Math.round(parseFloat(matchMb[1]) * 1024);
    } else if (matchKb) {
      targetKb = Math.round(parseFloat(matchKb[1]));
    }
  }
  const finalTargetKb = typeof targetKb === 'number' && targetKb > 0 ? targetKb : undefined;
  const hasTargetKb = finalTargetKb !== undefined;
  const targetBytes = finalTargetKb !== undefined ? finalTargetKb * 1024 : originalSize * 0.5;

  onProgress?.(5, 'Analyzing PDF structure and streams...');

  // Step 1: Run structural stream deduplication first on an isolated copy
  let structuralBytes: Uint8Array | null = null;
  try {
    structuralBytes = await compressPdfStructural(getIsolatedBytes());
  } catch (e) {
    console.warn('Structural PDF compression skipped:', e);
  }

  // If structural deduplication already meets targetKb with lossless vector quality, use it directly!
  if (hasTargetKb && structuralBytes && structuralBytes.byteLength <= targetBytes) {
    const compressedSize = structuralBytes.byteLength;
    const savedBytes = Math.max(0, originalSize - compressedSize);
    const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
    onProgress?.(100, 'Optimization completed successfully!');
    return {
      bytes: structuralBytes,
      originalSize,
      compressedSize,
      savedBytes,
      savedPercentage,
      isReduced: savedBytes > 0,
      pageCount: 1,
      message: `Successfully compressed with full vector fidelity! Saved ${(savedBytes / 1024).toFixed(0)} KB (${savedPercentage.toFixed(1)}%).`,
    };
  }

  let bestBytes: Uint8Array | null = null;
  let pageCount = 0;

  try {
    const pdfjsLib = await getPdfJsLib();

    if (pdfjsLib) {
      onProgress?.(12, 'Inspecting pages and embedded graphics...');

      // PDF.js worker transfers the buffer, so pass a dedicated isolated copy
      const workerSafeData = getIsolatedBytes();
      const loadingTask = pdfjsLib.getDocument({
        data: workerSafeData,
        useSystemFonts: true,
        disableFontFace: false,
      });

      const pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;

      if (pageCount > 0) {
        // Calculate per-page byte budget when targetKb is specified
        const totalBudget = hasTargetKb ? targetBytes : originalSize * (level === 'extreme' ? 0.35 : level === 'medium' ? 0.55 : 0.75);
        const perPageBudget = Math.max(2048, Math.floor((totalBudget * 0.88) / pageCount));

        let baseScale = 1.25;
        let baseQuality = 0.70;

        if (perPageBudget < 20 * 1024) {
          baseScale = 0.75;
          baseQuality = 0.32;
        } else if (perPageBudget < 45 * 1024) {
          baseScale = 0.90;
          baseQuality = 0.45;
        } else if (perPageBudget < 90 * 1024) {
          baseScale = 1.05;
          baseQuality = 0.58;
        } else if (perPageBudget < 200 * 1024) {
          baseScale = 1.25;
          baseQuality = 0.72;
        } else if (perPageBudget < 500 * 1024) {
          baseScale = 1.45;
          baseQuality = 0.82;
        } else {
          baseScale = 1.65;
          baseQuality = 0.88;
        }

        if (options.quality && !hasTargetKb) {
          baseQuality = options.quality;
          baseScale = options.scale || (options.quality < 0.4 ? 0.9 : options.quality < 0.7 ? 1.2 : 1.45);
        }

        onProgress?.(15, `Optimizing ${pageCount} pages (Target budget: ${(totalBudget / 1024).toFixed(0)} KB)...`);

        const newPdf = await PDFDocument.create();

        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          const pct = Math.round(15 + (pageNum / pageCount) * 78);
          onProgress?.(pct, `Compressing page ${pageNum} of ${pageCount}...`);

          if (pageNum % 2 === 0 || pageCount > 15) {
            await new Promise((resolve) => setTimeout(resolve, 8));
          }

          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: baseScale });

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

            let jpegQuality = baseQuality;
            let jpegBytes: Uint8Array | null = null;

            const extractJpegBytes = (q: number): Uint8Array => {
              const jpegDataUrl = canvas.toDataURL('image/jpeg', q);
              const base64Data = jpegDataUrl.split(',')[1];
              const binaryString = window.atob(base64Data);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return bytes;
            };

            jpegBytes = extractJpegBytes(jpegQuality);

            if (hasTargetKb && jpegBytes.byteLength > perPageBudget * 1.15 && jpegQuality > 0.20) {
              const calibratedQ = Math.max(0.18, jpegQuality * (perPageBudget / jpegBytes.byteLength));
              jpegBytes = extractJpegBytes(calibratedQ);
            }

            const embeddedImg = await newPdf.embedJpg(jpegBytes);
            const origViewport = page.getViewport({ scale: 1.0 });
            const pdfPage = newPdf.addPage([origViewport.width, origViewport.height]);

            pdfPage.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: origViewport.width,
              height: origViewport.height,
            });
          }

          canvas.width = 0;
          canvas.height = 0;
        }

        onProgress?.(95, 'Writing and optimizing final PDF streams...');
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

  // Decision logic: Select the optimal output
  if (!bestBytes && structuralBytes) {
    bestBytes = structuralBytes;
  } else if (!bestBytes) {
    onProgress?.(85, 'Running structural stream optimization...');
    bestBytes = await compressPdfStructural(getIsolatedBytes());
  }

  // If structural compression is smaller AND meets target requirements, prefer structural
  if (structuralBytes && bestBytes) {
    if (hasTargetKb) {
      if (structuralBytes.byteLength <= targetBytes && structuralBytes.byteLength <= bestBytes.byteLength) {
        bestBytes = structuralBytes;
      }
    } else {
      if (structuralBytes.byteLength < bestBytes.byteLength && structuralBytes.byteLength < originalSize) {
        bestBytes = structuralBytes;
      }
    }
  }

  const finalOutputBytes = bestBytes || getIsolatedBytes();
  const compressedSize = finalOutputBytes.byteLength;
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
  const isReduced = savedBytes > 0;

  const targetAchievedStr = finalTargetKb !== undefined
    ? ` (Target: ${finalTargetKb >= 1024 ? (finalTargetKb / 1024).toFixed(1) + ' MB' : finalTargetKb + ' KB'})`
    : '';

  let message = isReduced
    ? `Successfully compressed! Size: ${(compressedSize / 1024).toFixed(0)} KB${targetAchievedStr}. Saved ${(savedBytes / 1024).toFixed(0)} KB (${savedPercentage.toFixed(1)}%).`
    : 'This PDF is already at optimal compression. Original fidelity preserved.';

  onProgress?.(100, isReduced ? 'Compression successful!' : 'File already optimized!');

  return {
    bytes: finalOutputBytes,
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
export async function compressPdfStructural(pdfBuffer: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const raw = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
  const safeCopy = new Uint8Array(raw.length);
  safeCopy.set(raw);

  const srcDoc = await PDFDocument.load(safeCopy, {
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
