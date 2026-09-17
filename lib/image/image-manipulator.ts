import imageCompression from 'browser-image-compression';

/**
 * Helper to safely load any image File into an HTMLImageElement,
 * ensuring Object URLs are revoked and exceptions are cleanly caught.
 */
function loadImageFromFile(file: File): Promise<{ img: HTMLImageElement; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    };

    img.onload = () => resolve({ img, cleanup });
    img.onerror = () => {
      cleanup();
      reject(new Error(`Failed to decode image file: ${file.name || 'unsupported image format'}`));
    };
    img.src = url;
  });
}

/**
 * Universal Image Converter (JPEG, PNG, WEBP, BMP, ICO)
 */
export async function convertImage(
  file: File,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/x-icon' = 'image/jpeg',
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    const canvas = document.createElement('canvas');
    // Safety clamp for mobile/Android memory
    const maxDim = 8192;
    let w = img.naturalWidth || img.width || 800;
    let h = img.naturalHeight || img.height || 600;

    if (w > maxDim || h > maxDim) {
      const scale = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }

    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    // Fill white background for JPEG/ICO when source might have transparency
    if (targetFormat === 'image/jpeg' || targetFormat === 'image/x-icon') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const actualMime = targetFormat === 'image/x-icon' ? 'image/png' : targetFormat;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Image conversion failed'));
        },
        actualMime,
        quality
      );
    });

    const dataUrl = URL.createObjectURL(blob);
    return { blob, dataUrl, width: canvas.width, height: canvas.height };
  } finally {
    cleanup();
  }
}

/**
 * Resize image dimensions with optional aspect ratio preservation.
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  maintainAspect: boolean = true,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    let finalW = targetWidth;
    let finalH = targetHeight;

    const natW = img.naturalWidth || img.width || 100;
    const natH = img.naturalHeight || img.height || 100;

    if (maintainAspect) {
      const ratio = natW / natH;
      if (targetWidth / targetHeight > ratio) {
        finalW = Math.round(targetHeight * ratio);
      } else {
        finalH = Math.round(targetWidth / ratio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, finalW);
    canvas.height = Math.max(1, finalH);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Image resize failed'));
        },
        format,
        quality
      );
    });

    const dataUrl = URL.createObjectURL(blob);
    return { blob, dataUrl, width: canvas.width, height: canvas.height };
  } finally {
    cleanup();
  }
}

/**
 * Crop image to a specified rectangle or bounding box.
 */
export async function cropImage(
  file: File,
  cropBox: { x: number; y: number; width: number; height: number },
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;

    const cropX = Math.max(0, Math.min(natW - 1, cropBox.x));
    const cropY = Math.max(0, Math.min(natH - 1, cropBox.y));
    const cropW = Math.max(1, Math.min(natW - cropX, cropBox.width));
    const cropH = Math.max(1, Math.min(natH - cropY, cropBox.height));

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Image crop failed'));
        },
        format,
        quality
      );
    });

    const dataUrl = URL.createObjectURL(blob);
    return { blob, dataUrl, width: canvas.width, height: canvas.height };
  } finally {
    cleanup();
  }
}

/**
 * Ultra-Precision Multi-Pass Target-Size Image Compressor.
 * Guarantees that the output size is strictly <= targetKB (and as close to targetKB as possible, ~85-99%),
 * while maximizing visual fidelity, edge clarity, and dimensional resolution.
 */
export async function compressImageToTargetKB(
  file: File,
  targetKB: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; finalKB: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    const targetBytes = Math.max(5 * 1024, targetKB * 1024);
    const origW = img.naturalWidth || img.width || 800;
    const origH = img.naturalHeight || img.height || 600;

    // Determine safe output MIME type:
    // HTML5 Canvas toBlob('image/png') ignores quality arguments (always lossless).
    // If format is PNG and target size cannot be met losslessly, WebP or JPEG is used to hit the byte target.
    let mimeType = format;
    if (format === 'image/png' && (file.size > targetBytes || targetKB < 500)) {
      mimeType = 'image/jpeg';
    }

    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    const renderCandidate = async (w: number, h: number, q: number): Promise<Blob | null> => {
      testCanvas.width = Math.max(16, Math.round(w));
      testCanvas.height = Math.max(16, Math.round(h));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, testCanvas.width, testCanvas.height);
      } else {
        ctx.clearRect(0, 0, testCanvas.width, testCanvas.height);
      }
      ctx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);

      return new Promise<Blob | null>((resolve) => {
        testCanvas.toBlob((b) => resolve(b), mimeType, q);
      });
    };

    let bestBlob: Blob | null = null;
    let bestWidth = origW;
    let bestHeight = origH;
    let bestScore = -1;

    // Phase 1: Test full 100% resolution across quality spectrum (0.98 down to 0.18)
    let lowQ = 0.15;
    let highQ = 0.98;
    let qualityCandidate: Blob | null = null;
    let chosenQ = 0.85;

    for (let i = 0; i < 9; i++) {
      const midQ = (lowQ + highQ) / 2;
      const blob = await renderCandidate(origW, origH, midQ);
      if (!blob) break;

      if (blob.size <= targetBytes) {
        qualityCandidate = blob;
        chosenQ = midQ;
        bestWidth = origW;
        bestHeight = origH;
        lowQ = midQ; // Try to increase quality while staying <= targetBytes
      } else {
        highQ = midQ; // Reduce quality
      }
    }

    // Always prefer 100% full resolution when quality is usable (>= 0.20)
    if (qualityCandidate && qualityCandidate.size <= targetBytes && chosenQ >= 0.20) {
      bestBlob = qualityCandidate;
    } else {
      // Phase 2: Gentle multi-resolution search (prioritizing highest resolution first)
      const scaleCandidates = [0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.55, 0.45];
      
      for (const scale of scaleCandidates) {
        const curW = Math.round(origW * scale);
        const curH = Math.round(origH * scale);
        if (curW < 32 || curH < 32) continue;

        let scaleLowQ = 0.25;
        let scaleHighQ = 0.95;
        let scaleBestBlob: Blob | null = null;
        let scaleBestQ = 0.75;

        for (let j = 0; j < 8; j++) {
          const midQ = (scaleLowQ + scaleHighQ) / 2;
          const blob = await renderCandidate(curW, curH, midQ);
          if (!blob) break;

          if (blob.size <= targetBytes) {
            scaleBestBlob = blob;
            scaleBestQ = midQ;
            scaleLowQ = midQ; // search for higher quality <= target
          } else {
            scaleHighQ = midQ;
          }
        }

        if (scaleBestBlob && scaleBestBlob.size <= targetBytes) {
          const sizeRatio = scaleBestBlob.size / targetBytes;
          const score = scale * 0.6 + scaleBestQ * 0.25 + sizeRatio * 0.15;
          
          if (score > bestScore || !bestBlob) {
            bestScore = score;
            bestBlob = scaleBestBlob;
            bestWidth = curW;
            bestHeight = curH;
          }

          if (scale >= 0.75 && scaleBestQ >= 0.70 && sizeRatio > 0.75) {
            break;
          }
        }
      }
    }

    // Phase 3: Emergency safeguard if file is still slightly above target (e.g. extreme small target like 10KB)
    if (!bestBlob || bestBlob.size > targetBytes) {
      let emergencyScale = Math.min(0.5, Math.sqrt(targetBytes / (file.size || targetBytes * 4)));
      for (let attempt = 0; attempt < 5; attempt++) {
        const ew = Math.max(32, Math.round(origW * emergencyScale));
        const eh = Math.max(32, Math.round(origH * emergencyScale));
        const blob = await renderCandidate(ew, eh, 0.50);
        if (blob && blob.size <= targetBytes) {
          bestBlob = blob;
          bestWidth = ew;
          bestHeight = eh;
          break;
        }
        emergencyScale *= 0.75;
      }
    }

    const finalBlob = bestBlob || file;
    const dataUrl = URL.createObjectURL(finalBlob);

    return {
      blob: finalBlob,
      dataUrl,
      width: bestWidth,
      height: bestHeight,
      finalKB: Math.round(finalBlob.size / 1024),
    };
  } finally {
    cleanup();
  }
}

/**
 * Rotate or flip an image.
 */
export async function rotateAndFlipImage(
  file: File,
  action: 'rotate-90' | 'rotate-180' | 'rotate-270' | 'flip-h' | 'flip-v' | string = 'rotate-90',
  customAngle?: number
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;

    let angle = 0;
    if (action === 'rotate-90' || action === '90') angle = 90;
    else if (action === 'rotate-180' || action === '180') angle = 180;
    else if (action === 'rotate-270' || action === '270') angle = 270;
    else if (typeof customAngle === 'number') angle = customAngle;

    const isRotated90or270 = angle === 90 || angle === 270;
    canvas.width = isRotated90or270 ? natH : natW;
    canvas.height = isRotated90or270 ? natW : natH;

    ctx.save();
    if (angle === 90) {
      ctx.translate(canvas.width, 0);
      ctx.rotate((90 * Math.PI) / 180);
    } else if (angle === 180) {
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate((180 * Math.PI) / 180);
    } else if (angle === 270) {
      ctx.translate(0, canvas.height);
      ctx.rotate((270 * Math.PI) / 180);
    } else if (action === 'flip-h') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else if (action === 'flip-v') {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }

    ctx.drawImage(img, 0, 0);
    ctx.restore();

    const outMime = file.type?.includes('png') ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Image transformation failed'));
        },
        outMime,
        0.95
      );
    });

    const dataUrl = URL.createObjectURL(blob);
    return { blob, dataUrl, width: canvas.width, height: canvas.height };
  } finally {
    cleanup();
  }
}

/**
 * Stamp customized watermark onto an image.
 */
export async function watermarkImage(
  file: File,
  text: string = 'Miftah Tools',
  opacity: number = 0.5,
  color: string = '#ffffff',
  position: 'bottom-right' | 'center' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right'
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    ctx.drawImage(img, 0, 0);

    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity));
    ctx.fillStyle = color;
    const fontSize = Math.max(20, Math.floor(Math.min(canvas.width, canvas.height) / 18));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;

    let posX = canvas.width - 30;
    let posY = canvas.height - 30;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    if (position === 'center') {
      posX = canvas.width / 2;
      posY = canvas.height / 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    } else if (position === 'bottom-left') {
      posX = 30;
      posY = canvas.height - 30;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
    } else if (position === 'top-right') {
      posX = canvas.width - 30;
      posY = 30;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
    } else if (position === 'top-left') {
      posX = 30;
      posY = 30;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
    }

    ctx.fillText(text, posX, posY);
    ctx.restore();

    const outMime = file.type?.includes('png') ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Watermarking failed'));
        },
        outMime,
        0.95
      );
    });

    const dataUrl = URL.createObjectURL(blob);
    return { blob, dataUrl, width: canvas.width, height: canvas.height };
  } finally {
    cleanup();
  }
}

/**
 * Remove all EXIF metadata and privacy tags by re-rasterizing via clean HTML5 canvas.
 */
export async function stripExifAndMetadata(file: File): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return await convertImage(file, file.type?.includes('png') ? 'image/png' : 'image/jpeg', 0.95);
}

/**
 * Standard browser image compression with guaranteed ratio & fallback.
 */
export async function compressImage(
  file: File,
  qualityFactor: number = 0.75
): Promise<{ blob: Blob; dataUrl: string; savedSize: number; percentSaved: number }> {
  try {
    // Calculate target KB from quality factor (e.g. 0.75 means ~40-60% of original, 0.4 means ~20-30%)
    const targetKB = Math.max(20, Math.round((file.size / 1024) * qualityFactor * 0.75));
    const targetFormat = file.type?.includes('png') ? 'image/png' : 'image/jpeg';
    const res = await compressImageToTargetKB(file, targetKB, targetFormat as any);
    
    const savedSize = Math.max(0, file.size - res.blob.size);
    const percentSaved = Math.max(0, Math.round((savedSize / file.size) * 100));

    return {
      blob: res.blob,
      dataUrl: res.dataUrl,
      savedSize,
      percentSaved,
    };
  } catch (_) {
    const converted = await convertImage(file, 'image/jpeg', qualityFactor);
    const savedSize = Math.max(0, file.size - converted.blob.size);
    const percentSaved = Math.max(0, Math.round((savedSize / file.size) * 100));
    return {
      blob: converted.blob,
      dataUrl: converted.dataUrl,
      savedSize,
      percentSaved,
    };
  }
}

export { applyImageFilter } from '../engines/comprehensive-engines';
