import { createWorker, Worker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  lines: { text: string; confidence: number }[];
}

const cachedWorkers = new Map<string, Worker>();
const workerPromises = new Map<string, Promise<Worker>>();

/**
 * Get or initialize a fast, persistent OCR worker for the given language.
 */
export async function getOcrWorker(language: string = 'eng', onStatus?: (status: string) => void): Promise<Worker> {
  const langKey = language || 'eng';
  if (cachedWorkers.has(langKey)) {
    return cachedWorkers.get(langKey)!;
  }
  if (workerPromises.has(langKey)) {
    return await workerPromises.get(langKey)!;
  }

  const promise = (async () => {
    onStatus?.('Loading OCR AI model into browser...');
    const worker = await createWorker(langKey, 1, {
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.1.1/dist/worker.min.js',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
      logger: () => {}, // suppress raw progress resetting
    });
    cachedWorkers.set(langKey, worker);
    return worker;
  })();

  workerPromises.set(langKey, promise);
  try {
    const worker = await promise;
    return worker;
  } catch (err) {
    workerPromises.delete(langKey);
    throw err;
  }
}

/**
 * Execute OCR text recognition on an image canvas, data URL, File, or Blob with smooth progress.
 */
export async function runOcr(
  imageSource: string | HTMLCanvasElement | File | Blob,
  language: string = 'eng',
  onProgress?: (progress: number, status: string) => void
): Promise<OcrResult> {
  onProgress?.(10, 'Initializing OCR character recognition engine...');
  try {
    const worker = await getOcrWorker(language, (s) => onProgress?.(25, s));

    onProgress?.(50, 'Analyzing image layout and extracting characters...');
    const ret = await worker.recognize(imageSource);
    onProgress?.(100, 'Text recognition completed!');

    return {
      text: ret.data.text || '',
      confidence: Math.round(ret.data.confidence || 0),
      lines: (ret.data.lines || []).map((l) => ({
        text: l.text,
        confidence: Math.round(l.confidence || 0),
      })),
    };
  } catch (err: any) {
    console.warn('OCR processing error:', err);
    throw new Error(err?.message || 'Unable to complete OCR text recognition on this file.');
  }
}

