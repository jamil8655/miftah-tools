import JSZip from 'jszip';
import { getPdfJsLib } from '@/lib/utils/formatters';

/**
 * Render all pages of a PDF as high-resolution PNG/JPG image files.
 */
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  dpi: number = 150,
  onProgress?: (percent: number, status: string) => void
): Promise<{ name: string; blob: Blob; dataUrl: string }[]> {
  onProgress?.(10, 'Initializing PDF rendering engine...');
  const pdfjsLib = await getPdfJsLib();
  if (!pdfjsLib) throw new Error('PDF rendering library is unavailable.');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let scale = dpi / 72; // Standard PDF DPI is 72
  if (numPages > 50) {
    scale = Math.min(scale, 1.25);
  } else if (numPages > 25) {
    scale = Math.min(scale, 1.5);
  }

  const results: { name: string; blob: Blob; dataUrl: string }[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pct = Math.floor(10 + ((pageNum - 1) / numPages) * 85);
    onProgress?.(pct, `Rendering high-res page ${pageNum} of ${numPages}...`);

    if (pageNum % 2 === 0 || numPages > 15) {
      await new Promise((resolve) => setTimeout(resolve, 8));
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.92);
      });

      // Clear canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;

      const objectUrl = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      results.push({
        name: `${baseName}_page_${pageNum}.${format === 'jpeg' ? 'jpg' : 'png'}`,
        blob,
        dataUrl: objectUrl,
      });
    } catch (pageErr) {
      console.warn(`Error rendering page ${pageNum} to image:`, pageErr);
    }
  }

  onProgress?.(100, 'All PDF pages rendered to images!');
  return results;
}

/**
 * Generate a full multi-size Favicon package (16x16, 32x32, 48x48, 180x180, 192x192, 512x512) from an image.
 */
export async function generateFaviconPackage(
  imageFile: File,
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Loading source image...');
  const img = new Image();
  const dataUrl = URL.createObjectURL(imageFile);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      URL.revokeObjectURL(dataUrl);
      reject(new Error('Failed to load image for favicon generation'));
    };
    img.src = dataUrl;
  });

  try {
    const zip = new JSZip();
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-48x48.png', size: 48 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    for (let i = 0; i < sizes.length; i++) {
      const { name, size } = sizes[i];
      onProgress?.(30 + Math.floor((i / sizes.length) * 50), `Generating ${name}...`);

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        zip.file(name, blob);
      }
    }

    // Generate HTML snippet for web integration
    const htmlSnippet = `<!-- NEXORA Favicon Package Integration -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;
    zip.file('favicon_html_tags.html', htmlSnippet);

    onProgress?.(95, 'Zipping favicon package...');
    return await zip.generateAsync({ type: 'blob' });
  } finally {
    URL.revokeObjectURL(dataUrl);
  }
}

/**
 * Extract dominant colors and hex palette from an uploaded image.
 */
export async function extractColorPalette(imageFile: File): Promise<{ hex: string; rgb: string; count: number }[]> {
  const img = new Image();
  const dataUrl = URL.createObjectURL(imageFile);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      URL.revokeObjectURL(dataUrl);
      reject(new Error('Failed to load image for color extraction'));
    };
    img.src = dataUrl;
  });

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(img, 0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 100, 100).data;

    const colorMap: Record<string, number> = {};
    for (let i = 0; i < imageData.length; i += 16) {
      const r = Math.round(imageData[i] / 24) * 24;
      const g = Math.round(imageData[i + 1] / 24) * 24;
      const b = Math.round(imageData[i + 2] / 24) * 24;
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      colorMap[hex] = (colorMap[hex] || 0) + 1;
    }

    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hex, count]) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { hex, rgb: `rgb(${r}, ${g}, ${b})`, count };
      });
  } finally {
    URL.revokeObjectURL(dataUrl);
  }
}

