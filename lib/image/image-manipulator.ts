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
 * Compress an image to hit an exact Target File Size in KB (e.g. 20KB, 50KB, 100KB, 500KB).
 */
export async function compressImageToTargetKB(
  file: File,
  targetKB: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; finalKB: number }> {
  const { img, cleanup } = await loadImageFromFile(file);

  try {
    const targetBytes = targetKB * 1024;
    let currentWidth = img.naturalWidth || img.width || 800;
    let currentHeight = img.naturalHeight || img.height || 600;

    // Proportionally scale down ultra-high resolution inputs
    const maxDim = targetKB <= 100 ? 1200 : targetKB <= 500 ? 1920 : 3840;
    if (Math.max(currentWidth, currentHeight) > maxDim) {
      const ratio = currentWidth / currentHeight;
      if (currentWidth > currentHeight) {
        currentWidth = maxDim;
        currentHeight = Math.round(maxDim / ratio);
      } else {
        currentHeight = maxDim;
        currentWidth = Math.round(maxDim * ratio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Binary search for optimal quality
    let low = 0.05;
    let high = 0.95;
    let bestBlob: Blob | null = null;
    let bestQuality = 0.8;

    for (let step = 0; step < 7; step++) {
      const mid = (low + high) / 2;
      const candidateBlob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), format, mid);
      });

      if (!candidateBlob) break;

      if (candidateBlob.size <= targetBytes) {
        bestBlob = candidateBlob;
        bestQuality = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    // Downscale resolution further if lowest quality factor still exceeds target size
    if (!bestBlob || bestBlob.size > targetBytes) {
      const scaleFactor = Math.sqrt(targetBytes / (bestBlob?.size || file.size || targetBytes * 2));
      const scaledW = Math.max(80, Math.floor(currentWidth * Math.min(0.85, scaleFactor)));
      const scaledH = Math.max(80, Math.floor(currentHeight * Math.min(0.85, scaleFactor)));

      canvas.width = scaledW;
      canvas.height = scaledH;
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      bestBlob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), format, 0.7);
      });
    }

    const finalResultBlob = bestBlob || file;
    const dataUrl = URL.createObjectURL(finalResultBlob);

    return {
      blob: finalResultBlob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      finalKB: Math.round(finalResultBlob.size / 1024),
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
  text: string = 'NEXORA TOOLS',
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
 * Standard browser image compression.
 */
export async function compressImage(
  file: File,
  qualityFactor: number = 0.75
): Promise<{ blob: Blob; dataUrl: string; savedSize: number; percentSaved: number }> {
  try {
    const options = {
      maxSizeMB: Math.max(0.1, (file.size / (1024 * 1024)) * qualityFactor),
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      initialQuality: qualityFactor,
    };
    const compressedBlob = await imageCompression(file, options);
    const dataUrl = URL.createObjectURL(compressedBlob);
    const savedSize = Math.max(0, file.size - compressedBlob.size);
    const percentSaved = Math.max(0, Math.round((savedSize / file.size) * 100));

    return {
      blob: compressedBlob,
      dataUrl,
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
