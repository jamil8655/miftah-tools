import { createWorker, type Worker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb } from 'pdf-lib';

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrLine {
  text: string;
  confidence: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
  words?: OcrWord[];
}

export interface OcrResult {
  text: string;
  confidence: number;
  lines: OcrLine[];
  words?: OcrWord[];
  tableData?: string[][];
  imageWidth?: number;
  imageHeight?: number;
}

const cachedWorkers = new Map<string, Worker>();
const workerPromises = new Map<string, Promise<Worker>>();

/**
 * Get or initialize a fast, persistent OCR worker for the given language (or multi-language combo).
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
    onStatus?.(`Loading OCR language model (${langKey})...`);
    const worker = await createWorker(langKey, 1, {
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.1.1/dist/worker.min.js',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
      logger: () => {}, // suppress raw progress resets
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
    onProgress?.(95, 'Formatting extracted text and structure...');

    const rawText = ret.data.text || '';
    const lines: OcrLine[] = (ret.data.lines || []).map((l: any) => ({
      text: l.text || '',
      confidence: Math.round(l.confidence || 0),
      bbox: l.bbox ? { x0: l.bbox.x0, y0: l.bbox.y0, x1: l.bbox.x1, y1: l.bbox.y1 } : undefined,
      words: (l.words || []).map((w: any) => ({
        text: w.text || '',
        confidence: Math.round(w.confidence || 0),
        bbox: w.bbox ? { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 } : { x0: 0, y0: 0, x1: 0, y1: 0 },
      })),
    }));

    const allWords: OcrWord[] = (ret.data.words || []).map((w: any) => ({
      text: w.text || '',
      confidence: Math.round(w.confidence || 0),
      bbox: w.bbox ? { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 } : { x0: 0, y0: 0, x1: 0, y1: 0 },
    }));

    const tableData = parseOcrTextToTable(rawText);

    onProgress?.(100, 'Text recognition completed!');

    return {
      text: rawText,
      confidence: Math.round(ret.data.confidence || 0),
      lines,
      words: allWords,
      tableData,
    };
  } catch (err: any) {
    console.warn('OCR processing error:', err);
    throw new Error(err?.message || 'Unable to complete OCR text recognition on this file.');
  }
}

/**
 * Intelligent parser to convert OCR text into 2D table rows and columns.
 * Supports pipe delimiters (|), tab delimiters (\t), and multi-space columnar gaps.
 */
export function parseOcrTextToTable(text: string): string[][] {
  if (!text || !text.trim()) return [];
  const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  const pipeCount = rawLines.filter((l) => l.includes('|')).length;
  const tabCount = rawLines.filter((l) => l.includes('\t')).length;

  return rawLines.map((line) => {
    if (pipeCount > rawLines.length * 0.4) {
      return line
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));
    }
    if (tabCount > rawLines.length * 0.4) {
      return line.split('\t').map((c) => c.trim());
    }
    const cells = line.split(/\s{2,}|\t/);
    if (cells.length > 1) {
      return cells.map((c) => c.trim());
    }
    // Single sentence or line without tabular gaps
    return [line];
  });
}

/**
 * Exports parsed 2D table data to Excel (.xlsx) ArrayBuffer.
 */
export function ocrTableToExcel(tableData: string[][], sheetName: string = 'OCR Table'): Uint8Array {
  const ws = XLSX.utils.aoa_to_sheet(tableData.length > 0 ? tableData : [['Empty Table']]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(out);
}

/**
 * Exports parsed 2D table data to CSV format string.
 */
export function ocrTableToCsv(tableData: string[][]): string {
  const ws = XLSX.utils.aoa_to_sheet(tableData.length > 0 ? tableData : [['Empty Table']]);
  return XLSX.utils.sheet_to_csv(ws);
}

/**
 * Applies contrast enhancement, binarization, and rotation on a canvas for higher OCR accuracy.
 */
export function preprocessCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: {
    enhanceContrast?: boolean;
    binarize?: boolean;
    rotation?: number; // 0, 90, 180, 270
  }
): HTMLCanvasElement {
  const rotation = options.rotation || 0;
  const isRotated90or270 = rotation === 90 || rotation === 270;

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = isRotated90or270 ? sourceCanvas.height : sourceCanvas.width;
  targetCanvas.height = isRotated90or270 ? sourceCanvas.width : sourceCanvas.height;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.save();
  if (rotation !== 0) {
    ctx.translate(targetCanvas.width / 2, targetCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
  } else {
    ctx.drawImage(sourceCanvas, 0, 0);
  }
  ctx.restore();

  if (options.enhanceContrast || options.binarize) {
    const imgData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Grayscale luminescence
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      if (options.binarize) {
        // High-contrast Otsu-inspired thresholding
        const threshold = 138;
        const val = gray > threshold ? 255 : 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      } else if (options.enhanceContrast) {
        // Dynamic contrast stretch
        const contrast = 1.35;
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
        const val = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return targetCanvas;
}

/**
 * Creates a Searchable PDF document where scan image pages have an invisible,
 * selectable and searchable OCR text layer positioned directly over the words.
 */
export async function createSearchablePdf(
  pages: {
    imageBytes: Uint8Array;
    isPng: boolean;
    width: number;
    height: number;
    words?: OcrWord[];
  }[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const p of pages) {
    let img: any;
    try {
      img = p.isPng ? await doc.embedPng(p.imageBytes) : await doc.embedJpg(p.imageBytes);
    } catch {
      try {
        img = await doc.embedPng(p.imageBytes);
      } catch {
        img = await doc.embedJpg(p.imageBytes);
      }
    }

    const pdfPage = doc.addPage([p.width, p.height]);
    pdfPage.drawImage(img, { x: 0, y: 0, width: p.width, height: p.height });

    if (p.words && p.words.length > 0) {
      for (const w of p.words) {
        const cleanWord = w.text.trim();
        if (!cleanWord) continue;

        const wordX = Math.max(0, w.bbox.x0);
        const wordY = Math.max(0, p.height - w.bbox.y1);
        const wordH = Math.max(6, Math.min(72, w.bbox.y1 - w.bbox.y0));

        try {
          pdfPage.drawText(cleanWord, {
            x: wordX,
            y: wordY,
            size: wordH,
            opacity: 0.001, // Invisible selectable text layer
            color: rgb(0, 0, 0),
          });
        } catch {
          // Skip unsupported glyphs without failing the PDF build
        }
      }
    }
  }

  return await doc.save({ useObjectStreams: true });
}
