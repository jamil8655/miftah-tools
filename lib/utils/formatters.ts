export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats byte values displaying BOTH KB and MB simultaneously
 * e.g., "2.45 MB (2,508 KB)" or "350 KB (0.34 MB)"
 */
export function formatBytesDual(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB (0 MB)';
  const kb = bytes / 1024;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB (${Math.round(kb).toLocaleString()} KB)`;
  }
  return `${Math.round(kb).toLocaleString()} KB (${mb.toFixed(2)} MB)`;
}

export function formatTimeSeconds(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins} min ${secs} sec`;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hrs} hr ${mins} min`;
}

export function calculatePercentageSaved(originalSize: number, newSize: number): number {
  if (!originalSize || originalSize <= 0) return 0;
  const diff = originalSize - newSize;
  if (diff <= 0) return 0;
  return Math.round((diff / originalSize) * 100);
}

let pdfjsPromise: Promise<any> | null = null;

/**
 * Universal PDF.js engine loader with multi-CDN and dynamic bundle fallback.
 */
export async function getPdfJsLib(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = (async () => {
    const CDNS = [
      {
        main: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
      },
      {
        main: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
        worker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
      },
      {
        main: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
        worker: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
      },
    ];

    for (const cdn of CDNS) {
      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = cdn.main;
          script.async = true;
          const timeout = setTimeout(() => {
            script.remove();
            reject(new Error('CDN timeout'));
          }, 7000);

          script.onload = () => {
            clearTimeout(timeout);
            const lib = (window as any).pdfjsLib;
            if (lib) {
              lib.GlobalWorkerOptions.workerSrc = cdn.worker;
              resolve();
            } else {
              reject(new Error('pdfjsLib not defined on window'));
            }
          };
          script.onerror = () => {
            clearTimeout(timeout);
            script.remove();
            reject(new Error('CDN load failed'));
          };
          document.head.appendChild(script);
        });

        if ((window as any).pdfjsLib) {
          return (window as any).pdfjsLib;
        }
      } catch (err) {
        console.warn(`PDF.js CDN failed (${cdn.main}), trying fallback...`, err);
      }
    }

    // Dynamic bundle import fallback
    try {
      const pdfjs = await import('pdfjs-dist');
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
        (window as any).pdfjsLib = pdfjs;
        return pdfjs;
      }
    } catch (importErr) {
      console.error('All PDF.js sources failed:', importErr);
    }

    throw new Error('Could not initialize PDF rendering engine. Please check your internet connection.');
  })();

  return pdfjsPromise;
}
