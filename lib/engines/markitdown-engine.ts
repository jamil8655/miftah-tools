'use client';

import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { runOcr } from '@/lib/ocr/ocr-engine';
import { getPdfJsLib } from '@/lib/utils/formatters';

export interface MarkItDownOptions {
  includeMetadata?: boolean;
  tableOfContents?: boolean;
  llmReady?: boolean;
  ocrLanguage?: string;
  onProgress?: (pct: number, status: string) => void;
}

export interface MarkItDownResult {
  markdown: string;
  title: string;
  fileType: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  estimatedTokens: number;
  metadata: Record<string, any>;
}

/**
 * Utility to convert raw HTML string into clean GitHub Flavored Markdown (GFM)
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove script and style tags
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n\n###### $1\n\n');

  // Convert Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    if (rows.length === 0) return '';

    let tableMd = '\n\n';
    let isFirstRow = true;

    for (const row of rows) {
      const cells = row.match(/<(th|td)[^>]*>([\s\S]*?)<\/(th|td)>/gi) || [];
      const cleanCells = cells.map((c: string) =>
        c.replace(/<[^>]*>/g, '').replace(/\|/g, '\\|').trim()
      );

      tableMd += `| ${cleanCells.join(' | ')} |\n`;

      if (isFirstRow) {
        const divider = cleanCells.map(() => '---').join(' | ');
        tableMd += `| ${divider} |\n`;
        isFirstRow = false;
      }
    }
    return tableMd + '\n';
  });

  // Convert Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

  // Convert Code Blocks & Inline Code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Convert Bold & Italic
  md = md.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/(b|strong)>/gi, '**$2**');
  md = md.replace(/<(i|em)[^>]*>([\s\S]*?)<\/(i|em)>/gi, '*$2*');

  // Convert Links
  md = md.replace(/<a[^>]+href="([^">]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Convert Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Convert Paragraphs & Line Breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // Strip all remaining HTML tags
  md = md.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  md = md.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

/**
 * 1. PDF to Structured Markdown
 */
export async function pdfToStructuredMarkdown(
  file: File | ArrayBuffer,
  options?: MarkItDownOptions
): Promise<string> {
  const pdfjsLib = await getPdfJsLib();
  if (!pdfjsLib) throw new Error('PDF Engine not available in current environment.');

  options?.onProgress?.(10, 'Initializing PDF structure...');
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let markdown = '';

  for (let i = 1; i <= numPages; i++) {
    options?.onProgress?.(
      10 + Math.round((i / numPages) * 80),
      `Extracting page ${i} of ${numPages}...`
    );

    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const items = (textContent.items || []) as any[];

    let pageText = '';
    let lastY: number | null = null;

    for (const item of items) {
      const str = item.str || '';
      if (!str.trim()) continue;

      const currentY = item.transform ? item.transform[5] : null;
      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 12) {
        pageText += '\n\n';
      } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
        pageText += ' ';
      }

      pageText += str;
      lastY = currentY;
    }

    markdown += `\n\n<!-- Page ${i} -->\n## Page ${i}\n\n`;

    if (pageText.trim().length > 10) {
      markdown += pageText.trim() + '\n';
    } else {
      // Fallback to OCR for scanned pages
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          const ocrResult = await runOcr(dataUrl, options?.ocrLanguage || 'eng');
          if (ocrResult.text && ocrResult.text.trim()) {
            markdown += `> 🔍 *[OCR Scanned Content]*\n\n${ocrResult.text.trim()}\n`;
          }
        }
        canvas.width = 0;
        canvas.height = 0;
      } catch (_) {
        markdown += `*[Non-text or graphic content on page ${i}]*\n`;
      }
    }
  }

  options?.onProgress?.(100, 'PDF Markdown generation complete!');
  return markdown.trim();
}

/**
 * 2. Word (.docx) to Structured Markdown
 */
export async function docxToStructuredMarkdown(
  file: File | ArrayBuffer,
  options?: MarkItDownOptions
): Promise<string> {
  options?.onProgress?.(20, 'Parsing Word document structure and tables...');
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;

  try {
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    options?.onProgress?.(70, 'Converting Word elements to Markdown...');
    const md = htmlToMarkdown(html);
    options?.onProgress?.(100, 'Word conversion complete!');
    return md;
  } catch (err: any) {
    // Fallback plain text conversion
    const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });
    return rawText.split('\n\n').map(p => p.trim()).filter(Boolean).join('\n\n');
  }
}

/**
 * 3. PowerPoint (.pptx) to Structured Markdown
 */
export async function pptxToStructuredMarkdown(
  file: File | ArrayBuffer,
  options?: MarkItDownOptions
): Promise<string> {
  options?.onProgress?.(20, 'Unpacking PowerPoint presentation package...');
  const zip = new JSZip();
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const loadedZip = await zip.loadAsync(buffer);

  const slideFiles = Object.keys(loadedZip.files)
    .filter(path => path.startsWith('ppt/slides/slide') && path.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/) ? a.match(/\d+/)![0] : '0');
      const numB = parseInt(b.match(/\d+/) ? b.match(/\d+/)![0] : '0');
      return numA - numB;
    });

  let markdown = '';

  for (let idx = 0; idx < slideFiles.length; idx++) {
    const slideNum = idx + 1;
    options?.onProgress?.(
      20 + Math.round((slideNum / slideFiles.length) * 75),
      `Parsing slide ${slideNum} of ${slideFiles.length}...`
    );

    const slidePath = slideFiles[idx];
    const xmlContent = await loadedZip.file(slidePath)!.async('string');

    // Extract text paragraphs
    const paragraphs: string[] = [];
    const pMatches = xmlContent.match(/<a:p>([\s\S]*?)<\/a:p>/g) || [];

    for (const p of pMatches) {
      const tMatches = p.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      const line = tMatches.map(t => t.replace(/<\/?a:t>/g, '')).join('').trim();
      if (line) paragraphs.push(line);
    }

    // Check for speaker notes
    let notesText = '';
    const notePath = `ppt/notesSlides/notesSlide${slideNum}.xml`;
    if (loadedZip.file(notePath)) {
      const noteXml = await loadedZip.file(notePath)!.async('string');
      const noteMatches = noteXml.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      notesText = noteMatches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ').trim();
    }

    markdown += `\n\n---\n\n## Slide ${slideNum}\n\n`;

    if (paragraphs.length > 0) {
      const title = paragraphs[0];
      markdown += `### ${title}\n\n`;
      for (let pIdx = 1; pIdx < paragraphs.length; pIdx++) {
        markdown += `- ${paragraphs[pIdx]}\n`;
      }
    } else {
      markdown += `*[Graphic / Visual Slide]*\n`;
    }

    if (notesText && notesText.length > 2) {
      markdown += `\n> 📝 **Speaker Notes:** ${notesText}\n`;
    }
  }

  options?.onProgress?.(100, 'PowerPoint conversion complete!');
  return markdown.trim() || '# PowerPoint Presentation\n\nNo textual content detected.';
}

/**
 * 4. Excel (.xlsx / .xls / .csv) to Structured Markdown
 */
export async function excelToStructuredMarkdown(
  file: File | ArrayBuffer,
  options?: MarkItDownOptions
): Promise<string> {
  options?.onProgress?.(20, 'Reading spreadsheet workbook...');
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const workbook = XLSX.read(buffer, { type: 'array' });

  let markdown = '';

  workbook.SheetNames.forEach((sheetName, sIdx) => {
    options?.onProgress?.(
      30 + Math.round((sIdx / workbook.SheetNames.length) * 60),
      `Converting worksheet: ${sheetName}...`
    );

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, blankrows: false });

    if (!jsonData || jsonData.length === 0) return;

    markdown += `\n\n## Sheet: ${sheetName}\n\n`;

    const headers = jsonData[0] || [];
    if (headers.length === 0) return;

    const cleanHeaders = headers.map(h => (h !== undefined && h !== null ? String(h).trim() : ''));
    markdown += `| ${cleanHeaders.join(' | ')} |\n`;
    markdown += `| ${cleanHeaders.map(() => '---').join(' | ')} |\n`;

    for (let r = 1; r < jsonData.length; r++) {
      const row = jsonData[r] || [];
      const cells = headers.map((_, colIdx) => {
        const val = row[colIdx];
        if (val === undefined || val === null) return '';
        return String(val).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
      });
      markdown += `| ${cells.join(' | ')} |\n`;
    }
  });

  options?.onProgress?.(100, 'Spreadsheet conversion complete!');
  return markdown.trim() || '# Spreadsheet\n\nEmpty workbook.';
}

/**
 * 5. CSV / TSV to Structured Markdown
 */
export function csvToStructuredMarkdown(csvContent: string): string {
  const lines = csvContent.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return '# Data Table\n\nEmpty CSV file.';

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  let md = '';

  const headers = lines[0].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
  md += `| ${headers.join(' | ')} |\n`;
  md += `| ${headers.map(() => '---').join(' | ')} |\n`;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').replace(/\|/g, '\\|').trim());
    md += `| ${row.join(' | ')} |\n`;
  }

  return md;
}

/**
 * 6. JSON to Structured Markdown
 */
export function jsonToStructuredMarkdown(jsonContent: string): string {
  try {
    const data = JSON.parse(jsonContent);
    let md = '# Structured JSON Data\n\n';

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const keys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
      md += `| ${keys.join(' | ')} |\n`;
      md += `| ${keys.map(() => '---').join(' | ')} |\n`;

      data.forEach(item => {
        const row = keys.map(k => {
          const val = item[k];
          if (val === undefined || val === null) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/\|/g, '\\|');
          return String(val).replace(/\|/g, '\\|');
        });
        md += `| ${row.join(' | ')} |\n`;
      });
      md += '\n\n';
    }

    md += '### Raw JSON Representation\n\n```json\n' + JSON.stringify(data, null, 2) + '\n```\n';
    return md;
  } catch (_) {
    return '```json\n' + jsonContent + '\n```';
  }
}

/**
 * 7. Images to Structured Markdown (EXIF & OCR)
 */
export async function imageToStructuredMarkdown(
  file: File,
  options?: MarkItDownOptions
): Promise<string> {
  options?.onProgress?.(20, 'Analyzing image metadata and dimensions...');

  let width = 0;
  let height = 0;
  try {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        width = img.naturalWidth;
        height = img.naturalHeight;
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.src = objectUrl;
    });
  } catch (_) {}

  let md = `# Image Document: ${file.name}\n\n`;
  md += `| Property | Value |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **File Name** | \`${file.name}\` |\n`;
  md += `| **MIME Type** | \`${file.type || 'image/jpeg'}\` |\n`;
  md += `| **File Size** | ${(file.size / 1024).toFixed(1)} KB |\n`;
  if (width && height) {
    md += `| **Dimensions** | ${width} x ${height} px |\n`;
  }
  md += `| **Last Modified** | ${new Date(file.lastModified).toISOString()} |\n\n`;

  options?.onProgress?.(50, 'Running Neural OCR to extract embedded text...');
  try {
    const reader = new FileReader();
    const base64: string = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const ocr = await runOcr(base64, options?.ocrLanguage || 'eng');
    if (ocr.text && ocr.text.trim()) {
      md += `### Extracted OCR Text Content\n\n${ocr.text.trim()}\n`;
    } else {
      md += `> *No embedded text was detected in this image.*\n`;
    }
  } catch (e: any) {
    md += `> *OCR extraction note: ${e.message || 'Skipped'}*\n`;
  }

  options?.onProgress?.(100, 'Image analysis complete!');
  return md;
}

/**
 * 8. Audio to Structured Markdown
 */
export async function audioToStructuredMarkdown(file: File): Promise<string> {
  let md = `# Audio File Metadata: ${file.name}\n\n`;
  md += `| Property | Value |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **File Name** | \`${file.name}\` |\n`;
  md += `| **Format** | \`${file.type || 'audio/mpeg'}\` |\n`;
  md += `| **Size** | ${(file.size / (1024 * 1024)).toFixed(2)} MB |\n`;
  md += `| **Last Modified** | ${new Date(file.lastModified).toISOString()} |\n\n`;
  md += `> 💡 *Ready for speech-to-text transcription and AI audio analysis pipelines.*\n`;
  return md;
}

/**
 * 9. ZIP Archives to Structured Markdown (Recursive Inspection)
 */
export async function zipToStructuredMarkdown(
  file: File | ArrayBuffer,
  options?: MarkItDownOptions
): Promise<string> {
  options?.onProgress?.(20, 'Scanning and inspecting ZIP archive...');
  const zip = new JSZip();
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const loadedZip = await zip.loadAsync(buffer);

  const fileEntries = Object.keys(loadedZip.files).filter(k => !loadedZip.files[k].dir);

  let md = `# Archive Package: ${file instanceof File ? file.name : 'archive.zip'}\n\n`;
  md += `**Total Files:** ${fileEntries.length}\n\n`;
  md += `### Archive File Index\n\n`;
  md += `| File Path | Type |\n`;
  md += `| :--- | :--- |\n`;

  for (const path of fileEntries) {
    const ext = path.split('.').pop() || 'file';
    md += `| \`${path}\` | \`.${ext}\` |\n`;
  }
  md += '\n---\n\n';

  // Read readable nested files
  let processed = 0;
  for (const path of fileEntries) {
    if (processed >= 10) {
      md += `\n> *... and ${fileEntries.length - processed} more archive files omitted for brevity.*\n`;
      break;
    }

    const lower = path.toLowerCase();
    if (
      lower.endsWith('.txt') ||
      lower.endsWith('.md') ||
      lower.endsWith('.json') ||
      lower.endsWith('.csv') ||
      lower.endsWith('.xml') ||
      lower.endsWith('.html') ||
      lower.endsWith('.js') ||
      lower.endsWith('.ts') ||
      lower.endsWith('.py')
    ) {
      try {
        const textContent = await loadedZip.file(path)!.async('string');
        const ext = path.split('.').pop() || '';
        md += `### File: \`${path}\`\n\n\`\`\`${ext}\n${textContent.slice(0, 5000)}\n\`\`\`\n\n`;
        processed++;
      } catch (_) {}
    }
  }

  options?.onProgress?.(100, 'Archive inspection complete!');
  return md;
}

/**
 * =========================================================================
 * UNIVERSAL MARKITDOWN DISPATCHER
 * Converts ANY supported document format into clean, structured Markdown.
 * =========================================================================
 */
export async function universalMarkItDown(
  file: File,
  options?: MarkItDownOptions
): Promise<MarkItDownResult> {
  const fileName = file.name;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const mime = file.type.toLowerCase();

  let markdown = '';
  let fileType = ext.toUpperCase();

  options?.onProgress?.(5, `Detecting format for ${fileName}...`);

  if (ext === 'pdf' || mime.includes('pdf')) {
    fileType = 'PDF Document';
    markdown = await pdfToStructuredMarkdown(file, options);
  } else if (ext === 'docx' || ext === 'doc' || mime.includes('wordprocessingml')) {
    fileType = 'Word Document (DOCX)';
    markdown = await docxToStructuredMarkdown(file, options);
  } else if (ext === 'pptx' || ext === 'ppt' || mime.includes('presentationml')) {
    fileType = 'PowerPoint Presentation (PPTX)';
    markdown = await pptxToStructuredMarkdown(file, options);
  } else if (ext === 'xlsx' || ext === 'xls' || ext === 'ods' || mime.includes('spreadsheetml')) {
    fileType = 'Excel Spreadsheet (XLSX)';
    markdown = await excelToStructuredMarkdown(file, options);
  } else if (ext === 'csv' || ext === 'tsv' || mime.includes('csv')) {
    fileType = 'Delimited Data (CSV/TSV)';
    const text = await file.text();
    markdown = csvToStructuredMarkdown(text);
  } else if (ext === 'json' || mime.includes('json')) {
    fileType = 'JSON Data';
    const text = await file.text();
    markdown = jsonToStructuredMarkdown(text);
  } else if (ext === 'html' || ext === 'htm' || mime.includes('html')) {
    fileType = 'HTML Webpage';
    const text = await file.text();
    markdown = htmlToMarkdown(text);
  } else if (ext === 'xml' || mime.includes('xml')) {
    fileType = 'XML Document';
    const text = await file.text();
    markdown = '```xml\n' + text + '\n```';
  } else if (
    ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'svg'].includes(ext) ||
    mime.startsWith('image/')
  ) {
    fileType = 'Image Document';
    markdown = await imageToStructuredMarkdown(file, options);
  } else if (
    ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext) ||
    mime.startsWith('audio/')
  ) {
    fileType = 'Audio Recording';
    markdown = await audioToStructuredMarkdown(file);
  } else if (ext === 'zip' || mime.includes('zip')) {
    fileType = 'ZIP Archive';
    markdown = await zipToStructuredMarkdown(file, options);
  } else {
    // Plain text, code, or unknown text-based format
    fileType = `Text / Code (.${ext})`;
    const text = await file.text();
    markdown = `\`\`\`${ext || 'text'}\n${text}\n\`\`\``;
  }

  const docTitle = fileName.replace(/\.[^/.]+$/, '');
  const banner = `# ${docTitle}\n\n> 📄 **Source Document:** \`${fileName}\` | **Type:** ${fileType} | **Converted via:** Microsoft MarkItDown Engine\n\n---\n\n`;

  const finalMarkdown = options?.includeMetadata !== false ? banner + markdown : markdown;

  // Compute document metrics
  const charCount = finalMarkdown.length;
  const wordCount = finalMarkdown.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = finalMarkdown.split(/\r?\n/).length;
  const estimatedTokens = Math.round(wordCount * 1.35);

  return {
    markdown: finalMarkdown,
    title: docTitle,
    fileType,
    charCount,
    wordCount,
    lineCount,
    estimatedTokens,
    metadata: {
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      lastModified: file.lastModified,
    },
  };
}

/**
 * Generate customized AI / LLM Prompts from extracted Markdown
 */
export function generateLlmPrompt(
  markdown: string,
  docTitle: string,
  task: 'summary' | 'qna' | 'extract' | 'rag' | 'translate',
  targetLang: string = 'Urdu'
): string {
  const instructions: Record<typeof task, string> = {
    summary: `Please read the following structured Markdown document ("${docTitle}") and provide a comprehensive executive summary with key takeaways and bullet points:`,
    qna: `You are an expert assistant analyzing the document "${docTitle}". Please answer any user questions based strictly on the provided structured Markdown text:`,
    extract: `Please extract all essential entities, numbers, dates, actionable items, and conclusions from the document "${docTitle}":`,
    rag: `System: You are an advanced RAG (Retrieval-Augmented Generation) document reasoning engine. Ingest the following structured context for multi-hop semantic querying:`,
    translate: `Please translate the key sections of the following document into ${targetLang}, preserving technical formatting and tables:`,
  };

  return `${instructions[task]}\n\n\`\`\`markdown\n${markdown}\n\`\`\``;
}
