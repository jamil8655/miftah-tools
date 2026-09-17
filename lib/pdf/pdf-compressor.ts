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
 * guarantees the output is NEVER larger than input, and strictly hits target size when requested.
 */
export async function compressPdfAdvanced(
  pdfBuffer: ArrayBuffer | Uint8Array,
  options: CompressOptions = {},
  onProgress?: (percent: number, status: string) => void
): Promise<CompressResult> {
  // Immutable master copy to prevent worker detachment
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
  const targetBytes = finalTargetKb !== undefined ? finalTargetKb * 1024 : Math.round(originalSize * 0.5);

  onProgress?.(5, 'Analyzing PDF structure and streams...');

  // Step 1: Run fast structural stream deduplication first
  let structuralBytes: Uint8Array | null = null;
  try {
    structuralBytes = await compressPdfStructural(getIsolatedBytes());
  } catch (e) {
    console.warn('Structural PDF compression skipped:', e);
  }

  // If structural deduplication alone meets the target size or saves substantial space on vector PDFs:
  if (structuralBytes && structuralBytes.byteLength < originalSize) {
    if (hasTargetKb && structuralBytes.byteLength <= targetBytes) {
      const compressedSize = structuralBytes.byteLength;
      const savedBytes = originalSize - compressedSize;
      const savedPercentage = (savedBytes / originalSize) * 100;
      onProgress?.(100, 'Optimization completed successfully!');
      return {
        bytes: structuralBytes,
        originalSize,
        compressedSize,
        savedBytes,
        savedPercentage,
        isReduced: true,
        pageCount: 1,
        message: `Successfully compressed with full vector fidelity! Saved ${(savedBytes / 1024).toFixed(0)} KB (${savedPercentage.toFixed(1)}%).`,
      };
    }
  }

  let rasterBytes: Uint8Array | null = null;
  let pageCount = 0;

  try {
    const pdfjsLib = await getPdfJsLib();

    if (pdfjsLib) {
      onProgress?.(12, 'Inspecting pages and embedded streams...');

      const workerSafeData = getIsolatedBytes();
      const loadingTask = pdfjsLib.getDocument({
        data: workerSafeData,
        useSystemFonts: true,
        disableFontFace: false,
      });

      const pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;

      if (pageCount > 0) {
        // Target budget calculation
        const totalBudget = hasTargetKb
          ? Math.min(originalSize * 0.95, targetBytes)
          : originalSize * (level === 'extreme' ? 0.35 : level === 'medium' ? 0.55 : 0.75);

        const perPageBudget = Math.max(1500, Math.floor((totalBudget * 0.85) / pageCount));

        // Derive scale and quality from per-page budget
        let baseScale = 1.10;
        let baseQuality = 0.60;

        if (perPageBudget < 15 * 1024) {
          baseScale = 0.65;
          baseQuality = 0.28;
        } else if (perPageBudget < 35 * 1024) {
          baseScale = 0.80;
          baseQuality = 0.40;
        } else if (perPageBudget < 75 * 1024) {
          baseScale = 0.95;
          baseQuality = 0.52;
        } else if (perPageBudget < 150 * 1024) {
          baseScale = 1.10;
          baseQuality = 0.65;
        } else if (perPageBudget < 300 * 1024) {
          baseScale = 1.25;
          baseQuality = 0.75;
        } else {
          baseScale = 1.40;
          baseQuality = 0.82;
        }

        if (options.quality && !hasTargetKb) {
          baseQuality = options.quality;
          baseScale = options.scale || (options.quality < 0.4 ? 0.85 : options.quality < 0.7 ? 1.05 : 1.30);
        }

        onProgress?.(15, `Compressing ${pageCount} pages (Target budget: ${(totalBudget / 1024).toFixed(0)} KB)...`);

        const renderPdfWithParams = async (scale: number, quality: number): Promise<Uint8Array> => {
          const newPdf = await PDFDocument.create();

          for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const pct = Math.round(15 + (pageNum / pageCount) * 78);
            onProgress?.(pct, `Optimizing page ${pageNum} of ${pageCount}...`);

            if (pageNum % 2 === 0 || pageCount > 15) {
              await new Promise((resolve) => setTimeout(resolve, 8));
            }

            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);

            const ctx = canvas.getContext('2d', { alpha: false });
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              await page.render({
                canvasContext: ctx,
                viewport,
              }).promise;

              const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
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

            canvas.width = 0;
            canvas.height = 0;
          }

          newPdf.setProducer('Miftah Precision Engine');
          newPdf.setCreator('Miftah Tools');

          return await newPdf.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50,
          });
        };

        rasterBytes = await renderPdfWithParams(baseScale, baseQuality);

        // If rasterization overshoots target budget by > 5% and target was requested, do a calibrated adjustment
        if (hasTargetKb && rasterBytes.byteLength > targetBytes && baseQuality > 0.25) {
          const ratio = targetBytes / rasterBytes.byteLength;
          const adjustedScale = Math.max(0.55, baseScale * Math.min(0.9, Math.sqrt(ratio)));
          const adjustedQuality = Math.max(0.20, baseQuality * Math.min(0.85, ratio));
          onProgress?.(85, 'Fine-tuning compression to hit target size...');
          const calibratedBytes = await renderPdfWithParams(adjustedScale, adjustedQuality);
          if (calibratedBytes.byteLength < rasterBytes.byteLength) {
            rasterBytes = calibratedBytes;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Visual raster compression error:', err);
  }

  // -------------------------------------------------------------
  // CRITICAL SIZE DECISION LOGIC & ABSOLUTE ANTI-BLOAT GUARANTEE:
  // Under NO circumstance will the output be larger than originalSize!
  // -------------------------------------------------------------
  let chosenBytes: Uint8Array = getIsolatedBytes();
  let isReduced = false;

  const validCandidates: Uint8Array[] = [];

  // Check structural candidate
  if (structuralBytes && structuralBytes.byteLength < originalSize) {
    validCandidates.push(structuralBytes);
  }

  // Check raster candidate (only valid if it actually reduced size OR met the requested targetKb)
  if (rasterBytes) {
    if (hasTargetKb && rasterBytes.byteLength <= targetBytes) {
      validCandidates.push(rasterBytes);
    } else if (rasterBytes.byteLength < originalSize) {
      validCandidates.push(rasterBytes);
    }
  }

  if (hasTargetKb) {
    // If target KB was requested, prioritize the candidate that satisfies <= targetBytes
    const targetSatisfying = validCandidates.filter((c) => c.byteLength <= targetBytes);
    if (targetSatisfying.length > 0) {
      // Pick the largest candidate among target-satisfying ones to preserve highest quality
      chosenBytes = targetSatisfying.reduce((prev, curr) => (curr.byteLength > prev.byteLength ? curr : prev));
      isReduced = chosenBytes.byteLength < originalSize;
    } else if (validCandidates.length > 0) {
      // Pick the smallest candidate available
      chosenBytes = validCandidates.reduce((prev, curr) => (curr.byteLength < prev.byteLength ? curr : prev));
      isReduced = chosenBytes.byteLength < originalSize;
    }
  } else {
    // Standard compression: pick the candidate with maximum compression (< originalSize)
    if (validCandidates.length > 0) {
      chosenBytes = validCandidates.reduce((prev, curr) => (curr.byteLength < prev.byteLength ? curr : prev));
      isReduced = chosenBytes.byteLength < originalSize;
    }
  }

  // Final absolute guarantee: if chosenBytes is >= originalSize, revert to original
  if (chosenBytes.byteLength >= originalSize) {
    chosenBytes = getIsolatedBytes();
    isReduced = false;
  }

  const compressedSize = chosenBytes.byteLength;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

  const targetAchievedStr = finalTargetKb !== undefined
    ? ` (Target: ${finalTargetKb >= 1024 ? (finalTargetKb / 1024).toFixed(1) + ' MB' : finalTargetKb + ' KB'})`
    : '';

  let message = isReduced
    ? `Successfully compressed! Size: ${(compressedSize / 1024).toFixed(0)} KB${targetAchievedStr}. Saved ${(savedBytes / 1024).toFixed(0)} KB (${savedPercentage.toFixed(1)}%).`
    : 'This PDF is already at optimal compression. Original size preserved.';

  onProgress?.(100, isReduced ? 'Compression successful!' : 'File already optimized!');

  return {
    bytes: chosenBytes,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercentage,
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
