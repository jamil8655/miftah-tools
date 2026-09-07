'use client';

import React from 'react';
import { ToolDefinition } from '@/lib/types';
import { ToolLayout } from '@/components/shared/ToolLayout';
import {
  mergePdfs,
  splitPdf,
  compressPdf,
  rotatePdfPages,
  watermarkPdf,
  addPageNumbers,
  editPdfMetadata,
  imagesToPdf,
  textToPdf,
  markdownToPdf,
} from '@/lib/pdf/pdf-manipulator';
import { compressPdfAdvanced } from '@/lib/pdf/pdf-compressor';
import { protectPdfWithPassword, unlockPdf } from '@/lib/pdf/pdf-encryptor';
import {
  convertImage,
  compressImage,
  compressImageToTargetKB,
  resizeImage,
  cropImage,
  rotateAndFlipImage,
  watermarkImage,
  stripExifAndMetadata,
} from '@/lib/image/image-manipulator';
import { extractColorPalette } from '@/lib/image/image-tools';
import { pdfToDocx, imageToDocx, imagesToDocx, textToWordDocx } from '@/lib/documents/doc-converter';
import {
  deletePdfPages,
  reversePdfPages,
  extractOddEvenPages,
  duplicatePdfPages,
  insertBlankPdfPage,
  changePdfPageOrientation,
  resizePdfPageDimensions,
  addPdfHeaderFooter,
  redactPdfContent,
  sanitizePdfMetadata,
  excelToPdf,
  xlsxToCsv,
  csvToXlsx,
  excelToJson,
  jsonToExcel,
  cleanAndDedupeCsv,
  formatCsv,
  docxToPdf,
  docxToTxt,
  docxToHtml,
  docxToMarkdown,
  cleanWordDocument,
  cleanWordMetadata,
  findAndReplaceInDocx,
  compressDocx,
  analyzeDocument,
  excelToTxt,
  excelToHtml,
  textToDocx,
  pptxToPdfOrText,
  countPptSlides,
  rtfToPdf,
  pdfToRtf,
  pdfToExcel,
  pdfToCsv,
  applyImageFilter,
  createImagesZip,
  extractZipArchive,
  extractEntitiesFromText,
  transformTextCase,
  cleanTextLines,
  calculateFileHash,
  extractTextFromPdf,
  htmlToPdf,
  csvToPdf,
  epubToPdf,
  pdfToHtml,
  pdfToMarkdown,
  markdownToHtml,
  htmlToText,
  urlEncodeDecode,
  pdfToEpub,
  pdfToPptx,
  pdfToGrayscaleOrBw,
  convertPdfToPdfA,
  reorderPdfPages,
  sortPdfPages,
  removePdfWatermark,
  reverseText,
} from '@/lib/engines/comprehensive-engines';

// Interactive Specialized Custom Workspaces
import { VisualPdfEditor } from '@/components/pdf/VisualPdfEditor';
import { PdfProtectStudio } from '@/components/pdf/PdfProtectStudio';
import { PdfOrganizerStudio } from '@/components/pdf/PdfOrganizerStudio';
import { PdfToImagesStudio } from '@/components/pdf/PdfToImagesStudio';
import { QrGenerator } from '@/components/qr/QrGenerator';
import { BarcodeStudio } from '@/components/qr/BarcodeStudio';
import { JsonStudio } from '@/components/dev/JsonStudio';
import { ColorStudio } from '@/components/dev/ColorStudio';
import { TimestampStudio } from '@/components/dev/TimestampStudio';
import { MarkdownLiveStudio } from '@/components/dev/MarkdownLiveStudio';
import { JwtStudio } from '@/components/dev/JwtStudio';
import { UuidStudio } from '@/components/dev/UuidStudio';
import { Base64Studio } from '@/components/dev/Base64Studio';
import { LoremIpsumStudio } from '@/components/dev/LoremIpsumStudio';
import { HashStudio } from '@/components/security/HashStudio';
import { PasswordStudio } from '@/components/security/PasswordStudio';
import { TextStudio } from '@/components/text/TextStudio';
import { TextDiffViewer } from '@/components/text/TextDiffViewer';
import { GeneralUnitConverter } from '@/components/calculators/GeneralUnitConverter';
import { StorageUnitConverter } from '@/components/calculators/StorageUnitConverter';
import { BandwidthCalculator } from '@/components/calculators/BandwidthCalculator';
import { MathCalculators } from '@/components/calculators/MathCalculators';
import { FinancialLoanCalculators } from '@/components/calculators/FinancialLoanCalculators';
import { StandardCalculatorStudio } from '@/components/calculators/StandardCalculatorStudio';
import { DpiCalculator } from '@/components/calculators/DpiCalculator';
import { AudioCutterStudio } from '@/components/media/AudioCutterStudio';
import { AudioBoosterStudio } from '@/components/media/AudioBoosterStudio';
import { AudioSpeedStudio } from '@/components/media/AudioSpeedStudio';
import { MediaDownloaderStudio } from '@/components/media/MediaDownloaderStudio';
import { VideoToMp3Studio } from '@/components/media/VideoToMp3Studio';
import { ColorPaletteStudio } from '@/components/image/ColorPaletteStudio';
import { ImageResizerStudio } from '@/components/image/ImageResizerStudio';
import { PassportPhotoStudio } from '@/components/image/PassportPhotoStudio';
import { BackgroundRemoverStudio } from '@/components/image/BackgroundRemoverStudio';
import { FaviconStudio } from '@/components/image/FaviconStudio';
import { AutoCropImagesToPdfStudio } from '@/components/image/AutoCropImagesToPdfStudio';
import { UnifiedImageStudio } from '@/components/image/UnifiedImageStudio';
import { OcrStudio } from '@/components/ocr/OcrStudio';

interface ToolPageClientProps {
  tool: ToolDefinition;
}

export function ToolPageClient({ tool }: ToolPageClientProps) {
  let customWorkspace: React.ReactNode = null;

  if (
    tool.id === 'pdf-editor' ||
    tool.slug === 'edit-pdf' ||
    tool.id === 'pdf-sign' ||
    tool.id === 'pdf-add-text' ||
    tool.id === 'pdf-crop' ||
    tool.slug === 'crop-pdf' ||
    tool.id === 'pdf-add-image' ||
    tool.id === 'pdf-add-shape' ||
    tool.id === 'pdf-draw' ||
    tool.id === 'pdf-highlight' ||
    tool.id === 'pdf-add-stamp'
  ) {
    customWorkspace = <VisualPdfEditor />;
  } else if (
    tool.id === 'pdf-protect' ||
    tool.id === 'protect-pdf' ||
    tool.id === 'pdf-encrypt' ||
    tool.id === 'encrypt-pdf' ||
    tool.id === 'pdf-password' ||
    tool.id === 'pdf-permissions' ||
    tool.slug === 'pdf-permission-manager' ||
    tool.slug === 'protect-pdf' ||
    tool.slug === 'encrypt-pdf' ||
    tool.slug === 'pdf-protect'
  ) {
    customWorkspace = <PdfProtectStudio mode="protect" />;
  } else if (
    tool.id === 'pdf-unlock' ||
    tool.id === 'unlock-pdf' ||
    tool.id === 'pdf-remove-password' ||
    tool.slug === 'unlock-pdf' ||
    tool.slug === 'pdf-unlock'
  ) {
    customWorkspace = <PdfProtectStudio mode="unlock" />;
  } else if (tool.id === 'qr-generator' || tool.category === 'qr' || tool.slug === 'qr-code-generator') {
    customWorkspace = <QrGenerator />;
  } else if (tool.id === 'barcode-generator' || tool.slug === 'barcode-generator') {
    customWorkspace = <BarcodeStudio />;
  } else if (tool.id === 'json-formatter' || tool.id === 'json-validator') {
    customWorkspace = <JsonStudio />;
  } else if (tool.id === 'file-hash-generator' || tool.id === 'md5-generator' || tool.id === 'sha256-generator') {
    customWorkspace = <HashStudio />;
  } else if (tool.id === 'password-generator') {
    customWorkspace = <PasswordStudio />;
  } else if (tool.id === 'general-unit-converter') {
    customWorkspace = <GeneralUnitConverter />;
  } else if (tool.id === 'file-size-converter' || tool.id === 'pdf-size-analyzer' || tool.id === 'file-size-analyzer' || tool.slug === 'pdf-size-analyzer' || tool.slug === 'file-size-analyzer') {
    customWorkspace = <StorageUnitConverter />;
  } else if (tool.id === 'bandwidth-calculator') {
    customWorkspace = <BandwidthCalculator />;
  } else if (tool.id === 'math-calculators') {
    customWorkspace = <MathCalculators />;
  } else if (
    tool.id === 'standard-calculator' ||
    tool.id === 'calculator' ||
    tool.id === 'scientific-calculator' ||
    tool.slug === 'calculator' ||
    tool.slug === 'standard-calculator' ||
    tool.slug === 'scientific-calculator'
  ) {
    customWorkspace = <StandardCalculatorStudio />;
  } else if (
    tool.id === 'financial-calculators' ||
    tool.id === 'emi-calculator' ||
    tool.id === 'loan-calculator' ||
    tool.id === 'gst-calculator' ||
    tool.id === 'discount-calculator' ||
    tool.id === 'profit-margin-calculator' ||
    tool.id === 'compound-interest-calculator' ||
    tool.slug === 'emi-calculator' ||
    tool.slug === 'gst-calculator' ||
    tool.slug === 'discount-calculator' ||
    tool.slug === 'profit-margin-calculator' ||
    tool.slug === 'loan-calculator'
  ) {
    customWorkspace = <FinancialLoanCalculators />;
  } else if (tool.id === 'dpi-calculator') {
    customWorkspace = <DpiCalculator />;
  } else if (
    tool.id === 'word-counter' ||
    tool.id === 'char-counter' ||
    tool.id === 'sentence-counter' ||
    tool.id === 'reading-time-calc' ||
    tool.id === 'case-converter' ||
    tool.id === 'uppercase-converter' ||
    tool.id === 'lowercase-converter' ||
    tool.id === 'title-case-converter' ||
    tool.id === 'duplicate-remover' ||
    tool.id === 'sort-lines-az' ||
    tool.id === 'sort-lines-za' ||
    tool.id === 'remove-extra-spaces' ||
    tool.id === 'remove-blank-lines' ||
    tool.id === 'reverse-text' ||
    tool.slug === 'reverse-text' ||
    tool.id === 'reverse-lines' ||
    tool.slug === 'reverse-lines' ||
    tool.id === 'url-encoder-decoder' ||
    tool.slug === 'url-encoder-decoder' ||
    tool.id === 'extract-emails' ||
    tool.id === 'extract-urls' ||
    tool.id === 'extract-phones' ||
    tool.id === 'extract-numbers' ||
    tool.id === 'extract-hashtags' ||
    tool.id === 'extract-mentions' ||
    tool.id === 'find-replace-text'
  ) {
    customWorkspace = <TextStudio />;
  } else if (tool.id === 'text-diff') {
    customWorkspace = <TextDiffViewer />;
  } else if (tool.id === 'timestamp-converter') {
    customWorkspace = <TimestampStudio />;
  } else if (tool.id === 'color-converter') {
    customWorkspace = <ColorStudio />;
  } else if (tool.id === 'jwt-decoder') {
    customWorkspace = <JwtStudio />;
  } else if (tool.id === 'uuid-generator') {
    customWorkspace = <UuidStudio />;
  } else if (tool.id === 'base64-converter') {
    customWorkspace = <Base64Studio />;
  } else if (tool.id === 'lorem-ipsum-gen') {
    customWorkspace = <LoremIpsumStudio />;
  } else if (tool.id === 'audio-cutter') {
    customWorkspace = <AudioCutterStudio />;
  } else if (tool.id === 'audio-booster') {
    customWorkspace = <AudioBoosterStudio />;
  } else if (tool.id === 'audio-speed') {
    customWorkspace = <AudioSpeedStudio />;
  } else if (tool.id === 'video-to-mp3') {
    customWorkspace = <VideoToMp3Studio />;
  } else if (tool.id === 'image-palette') {
    customWorkspace = <ColorPaletteStudio />;
  } else if (
    tool.id === 'pdf-organizer' ||
    tool.slug === 'organize-pdf' ||
    tool.id === 'pdf-reorder-pages' ||
    tool.slug === 'reorder-pdf-pages' ||
    tool.id === 'pdf-replace-pages' ||
    tool.slug === 'replace-pdf-pages' ||
    tool.id === 'pdf-sort-pages' ||
    tool.slug === 'sort-pdf-pages'
  ) {
    customWorkspace = <PdfOrganizerStudio />;
  } else if (
    tool.id === 'markdown-editor' ||
    tool.id === 'markdown-to-html' ||
    tool.slug === 'markdown-to-html' ||
    tool.id === 'pdf-to-markdown' ||
    tool.slug === 'pdf-to-markdown'
  ) {
    customWorkspace = <MarkdownLiveStudio />;
  } else if (tool.id === 'image-resizer') {
    customWorkspace = <ImageResizerStudio />;
  } else if (tool.id === 'passport-photo-maker' || tool.slug === 'passport-photo-maker') {
    customWorkspace = <PassportPhotoStudio />;
  } else if (tool.id === 'background-remover' || tool.slug === 'background-remover') {
    customWorkspace = <BackgroundRemoverStudio />;
  } else if (tool.id === 'favicon-generator' || tool.slug === 'favicon-generator') {
    customWorkspace = <FaviconStudio />;
  } else if (
    tool.id === 'image-converter' ||
    tool.slug === 'image-converter' ||
    tool.id === 'image-studio' ||
    tool.slug === 'image-studio' ||
    tool.id === 'photo-editor' ||
    tool.slug === 'photo-editor' ||
    tool.id === 'image-cropper' ||
    tool.slug === 'image-cropper'
  ) {
    customWorkspace = <UnifiedImageStudio />;
  } else if (
    tool.id === 'auto-crop-images-to-pdf' ||
    tool.slug === 'auto-crop-images-to-pdf' ||
    tool.id === 'crop-images-to-pdf' ||
    tool.slug === 'crop-images-to-pdf'
  ) {
    customWorkspace = <AutoCropImagesToPdfStudio />;
  } else if (
    tool.id === 'ocr-pdf' ||
    tool.id === 'ocr-image' ||
    tool.id === 'ocr-to-word' ||
    tool.id === 'ocr-to-txt' ||
    tool.id === 'ocr-to-excel' ||
    tool.id === 'ocr-to-csv' ||
    tool.id === 'image-searchable-pdf' ||
    tool.id === 'pdf-optimize-scan' ||
    tool.slug === 'optimize-scanned-pdf' ||
    tool.id === 'scan-to-pdf' ||
    tool.slug === 'scan-to-pdf' ||
    tool.id === 'make-pdf-searchable' ||
    tool.slug === 'make-pdf-searchable' ||
    tool.id === 'extract-text-image' ||
    tool.slug === 'extract-text-from-image'
  ) {
    customWorkspace = <OcrStudio />;
  } else if (
    tool.id === 'pdf-to-image' ||
    tool.id === 'pdf-to-jpg' ||
    tool.id === 'pdf-to-png' ||
    tool.id === 'pdf-to-webp' ||
    tool.id === 'pdf-to-images' ||
    tool.slug === 'pdf-to-images-zip'
  ) {
    customWorkspace = <PdfToImagesStudio />;
  } else if (tool.category === 'media' || tool.id.includes('downloader') || tool.id === 'whatsapp-status-saver') {
    customWorkspace = <MediaDownloaderStudio />;
  }

  // Centralized real processing dispatcher
  const handleProcess = async (
    files: File[],
    options: Record<string, any>,
    onProgress: (percent: number, statusText: string) => void
  ) => {
    onProgress(15, 'Reading input files into memory...');

    // 1. PDF PASSWORD PROTECT & ENCRYPT
    if (
      tool.id === 'pdf-protect' ||
      tool.id === 'protect-pdf' ||
      tool.id === 'pdf-encrypt' ||
      tool.id === 'encrypt-pdf' ||
      tool.id === 'pdf-password' ||
      tool.slug === 'protect-pdf' ||
      tool.slug === 'encrypt-pdf'
    ) {
      const pwd = options.password || '123456';
      onProgress(40, 'Encrypting PDF with document password...');
      const results = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        const encryptedBytes = await protectPdfWithPassword(buffer, pwd);
        const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
        results.push({
          name: `protected-${f.name}`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      onProgress(100, 'Encryption complete!');
      return results;
    }

    // 2. PDF UNLOCK & REMOVE PASSWORD
    if (
      tool.id === 'pdf-unlock' ||
      tool.id === 'unlock-pdf' ||
      tool.id === 'pdf-remove-password' ||
      tool.slug === 'unlock-pdf' ||
      tool.slug === 'pdf-unlock'
    ) {
      onProgress(40, 'Removing password restriction from PDF...');
      const results = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        const decryptedBytes = await unlockPdf(buffer, options.password);
        const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' });
        results.push({
          name: `unlocked-${f.name}`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      onProgress(100, 'Unlock complete!');
      return results;
    }

    // 3. PDF MERGE
    if (tool.id === 'pdf-merge') {
      onProgress(30, 'Reading PDF documents...');
      const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
      onProgress(60, 'Merging PDF pages and font tables...');
      const mergedBytes = await mergePdfs(buffers);
      onProgress(100, 'Merge completed!');
      const blob = new Blob([mergedBytes as any], { type: 'application/pdf' });
      return [
        {
          name: 'merged-document.pdf',
          originalSize: files.reduce((a, f) => a + f.size, 0),
          processedSize: blob.size,
          blob,
        },
      ];
    }

    // 4. PDF SPLIT & EXTRACT
    if (tool.id === 'pdf-split' || tool.id === 'pdf-extract-pages' || tool.id === 'pdf-extract-selected') {
      onProgress(30, 'Analyzing PDF page count...');
      const buffer = await files[0].arrayBuffer();
      onProgress(65, 'Extracting individual pages...');
      const splitResults = await splitPdf(buffer, options.splitMode || 'all', options.pageRange);
      onProgress(100, 'Split completed!');
      return splitResults.map((r) => {
        const b = new Blob([r.bytes as any], { type: 'application/pdf' });
        return {
          name: r.name,
          originalSize: files[0].size,
          processedSize: b.size,
          blob: b,
        };
      });
    }

    // 5. PDF DELETE / REVERSE / ODD-EVEN / DUPLICATE / INSERT PAGES
    if (tool.id === 'pdf-delete-pages' || tool.id === 'pdf-remove-blank') {
      onProgress(40, 'Removing requested pages...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await deletePdfPages(buffer, options.pages || '2');
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `cleaned-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-reverse-pages') {
      onProgress(40, 'Reversing PDF page order...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await reversePdfPages(buffer);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `reversed-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-extract-odd' || tool.id === 'pdf-extract-even') {
      const type = tool.id === 'pdf-extract-odd' ? 'odd' : 'even';
      onProgress(40, `Extracting ${type} pages...`);
      const buffer = await files[0].arrayBuffer();
      const bytes = await extractOddEvenPages(buffer, type);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `${type}-pages-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-duplicate-pages') {
      onProgress(40, 'Duplicating PDF pages...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await duplicatePdfPages(buffer, 2);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `duplicated-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-insert-pages') {
      onProgress(40, 'Inserting blank pages into PDF...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await insertBlankPdfPage(buffer, options.position || 'end');
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `inserted-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-orientation') {
      onProgress(40, 'Converting page orientation...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await changePdfPageOrientation(buffer, options.target || 'landscape');
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `oriented-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-resize-pages' || tool.id === 'pdf-change-size' || tool.id === 'pdf-booklet') {
      onProgress(40, 'Resizing PDF page dimensions...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await resizePdfPageDimensions(buffer, options.size || 'A4');
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `resized-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-add-header' || tool.id === 'pdf-add-footer') {
      onProgress(40, 'Adding header/footer text & logo...');
      const results = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        const bytes = await addPdfHeaderFooter(buffer, {
          headerText: options.headerText || (tool.id === 'pdf-add-header' ? 'OFFICIAL DOCUMENT' : ''),
          footerText: options.footerText || (tool.id === 'pdf-add-footer' ? 'Page {page} of {total}' : ''),
          headerAlign: options.headerAlign || 'center',
          footerAlign: options.footerAlign || 'center',
          fontSize: options.fontSize ? parseInt(options.fontSize) : 10,
          fontColor: options.fontColor || '#334155',
          opacity: options.opacity ? parseFloat(options.opacity) : 0.9,
          headerImage: options.headerImage || '',
          footerImage: options.footerImage || '',
          headerImageWidth: options.headerImageWidth ? parseInt(options.headerImageWidth) : 60,
          footerImageWidth: options.footerImageWidth ? parseInt(options.footerImageWidth) : 60,
          pageRange: options.pageRange || 'all',
        });
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        results.push({ name: `header-footer-${f.name}`, originalSize: f.size, processedSize: blob.size, blob });
      }
      return results;
    }

    if (tool.id === 'pdf-redact') {
      onProgress(40, 'Applying redaction blocks...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await redactPdfContent(buffer);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `redacted-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-sanitize' || tool.id === 'pdf-metadata-cleaner') {
      onProgress(40, 'Stripping metadata and hidden tags...');
      const buffer = await files[0].arrayBuffer();
      const bytes = await sanitizePdfMetadata(buffer);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return [{ name: `sanitized-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // 6. PDF ROTATE
    if (tool.id === 'pdf-rotate' || tool.id === 'pdf-rotate-single') {
      onProgress(40, 'Rotating PDF pages...');
      const angle = parseInt(options.angle || '90');
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const buffer = await f.arrayBuffer();
        const rotatedBytes = await rotatePdfPages(buffer, angle);
        const blob = new Blob([rotatedBytes as any], { type: 'application/pdf' });
        results.push({
          name: `rotated-${f.name}`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      return results;
    }

    // 7. PDF WATERMARK
    if (tool.id === 'pdf-watermark') {
      onProgress(40, 'Applying watermark stamp to all pages...');
      const results = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        const stampedBytes = await watermarkPdf(
          buffer,
          options.text || 'CONFIDENTIAL',
          options.opacity ? parseFloat(options.opacity) : 0.3,
          options.color || '#ff0000',
          options.watermarkImage || options.image || options.headerImage
        );
        const blob = new Blob([stampedBytes as any], { type: 'application/pdf' });
        results.push({
          name: `watermarked-${f.name}`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      return results;
    }

    // 8. PDF PAGE NUMBERS
    if (tool.id === 'pdf-page-numbers') {
      onProgress(40, 'Rendering page number headers/footers...');
      const results = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        const bytes = await addPageNumbers(buffer, options.position, options.format);
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        results.push({
          name: `numbered-${f.name}`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      return results;
    }

    // 9. PDF COMPRESSOR & OPTIMIZATION
    if (
      tool.id === 'pdf-compress' ||
      tool.id === 'pdf-extreme-compress' ||
      tool.id === 'pdf-balanced-compress' ||
      tool.id === 'pdf-hq-compress' ||
      tool.id === 'pdf-optimize' ||
      tool.id === 'pdf-to-smaller' ||
      tool.id === 'pdf-linearize' ||
      tool.id === 'pdf-image-compress' ||
      tool.id === 'pdf-font-opt' ||
      tool.id === 'pdf-remove-objects' ||
      tool.id === 'pdf-optimize-images' ||
      tool.id === 'pdf-resolution-reducer' ||
      tool.slug === 'pdf-image-compression' ||
      tool.slug === 'pdf-font-optimization' ||
      tool.slug === 'remove-unused-pdf-objects' ||
      tool.slug === 'optimize-image-heavy-pdf' ||
      tool.slug === 'pdf-resolution-reducer'
    ) {
      const results = [];
      const targetLimit = tool.id === 'pdf-extreme-compress' ? '200kb' : options.targetSizeLimit || 'auto';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = await file.arrayBuffer();
        const compressRes = await compressPdfAdvanced(
          buffer,
          {
            level: options.level || 'medium',
            targetSizeLimit: targetLimit,
          },
          (pct, status) => {
            const overallPct = Math.round(((i + pct / 100) / files.length) * 100);
            onProgress(overallPct, status);
          }
        );
        const blob = new Blob([compressRes.bytes as any], { type: 'application/pdf' });
        results.push({
          name: `compressed-${file.name}`,
          originalSize: file.size,
          processedSize: blob.size,
          blob,
        });
      }
      onProgress(100, 'PDF compression completed!');
      return results;
    }

    // 10. PDF TO WORD / IMAGE TO WORD / OCR TO WORD / EXCEL / CSV / RTF / PPTX
    if (
      tool.id === 'pdf-to-docx' ||
      tool.id === 'pdf-to-doc' ||
      tool.id === 'pdf-to-word' ||
      tool.slug === 'pdf-to-word' ||
      tool.id === 'ocr-to-word' ||
      tool.slug === 'ocr-to-word' ||
      tool.id.includes('image-to-word') ||
      tool.slug.includes('image-to-word') ||
      tool.id.includes('jpg-to-word') ||
      tool.id.includes('png-to-word') ||
      tool.id.includes('photo-to-word') ||
      tool.slug.includes('jpg-to-word') ||
      tool.slug.includes('png-to-word') ||
      tool.id === 'image-to-docx' ||
      tool.slug === 'image-to-docx'
    ) {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const isImg = f.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|tiff|heic)$/i.test(f.name);
        onProgress(Math.round(((i + 1) / files.length) * 80), `Converting ${f.name} to editable Word document...`);
        const docxBlob = isImg ? await imageToDocx(f, onProgress) : await pdfToDocx(f, onProgress);
        results.push({
          name: `${f.name.replace(/\.[^/.]+$/, '')}.docx`,
          originalSize: f.size,
          processedSize: docxBlob.size,
          blob: docxBlob,
        });
      }
      onProgress(100, 'Word conversion completed!');
      return results;
    }

    if (tool.id === 'pdf-to-rtf' || tool.slug === 'pdf-to-rtf') {
      onProgress(40, 'Extracting formatted RTF text from PDF...');
      const results = [];
      for (const f of files) {
        const rtfBlob = await pdfToRtf(f);
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.rtf`, originalSize: f.size, processedSize: rtfBlob.size, blob: rtfBlob });
      }
      return results;
    }

    if (tool.id === 'pdf-to-excel' || tool.id === 'pdf-to-xlsx' || tool.slug === 'pdf-to-excel') {
      onProgress(40, 'Extracting tables from PDF to Excel XLSX...');
      const results = [];
      for (const f of files) {
        const xlsxBlob = await pdfToExcel(f);
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.xlsx`, originalSize: f.size, processedSize: xlsxBlob.size, blob: xlsxBlob });
      }
      return results;
    }

    if (tool.id === 'pdf-to-csv' || tool.slug === 'pdf-to-csv') {
      onProgress(40, 'Extracting tables from PDF to CSV...');
      const results = [];
      for (const f of files) {
        const csvBlob = await pdfToCsv(f);
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.csv`, originalSize: f.size, processedSize: csvBlob.size, blob: csvBlob });
      }
      return results;
    }

    // 11. EXCEL & SPREADSHEET TOOLS
    if (tool.id === 'xlsx-to-pdf' || tool.id === 'xls-to-pdf' || tool.id === 'xlsx-direct-pdf' || tool.id === 'excel-to-pdf') {
      onProgress(40, 'Converting spreadsheet to PDF...');
      const results = [];
      for (const f of files) {
        const pdfBlob = await excelToPdf(f);
        results.push({
          name: `${f.name.replace(/\.[^/.]+$/, '')}.pdf`,
          originalSize: f.size,
          processedSize: pdfBlob.size,
          blob: pdfBlob,
        });
      }
      return results;
    }

    if (tool.id === 'xlsx-to-csv') {
      onProgress(40, 'Converting XLSX to CSV...');
      const blob = await xlsxToCsv(files[0]);
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.csv`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'csv-to-xlsx') {
      onProgress(40, 'Converting CSV to XLSX...');
      const blob = await csvToXlsx(files[0]);
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.xlsx`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'excel-to-json') {
      onProgress(40, 'Converting Excel to JSON...');
      const jsonStr = await excelToJson(files[0]);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.json`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'json-to-excel') {
      onProgress(40, 'Converting JSON to Excel XLSX...');
      const text = await files[0].text();
      const blob = await jsonToExcel(text);
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.xlsx`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'excel-to-txt' || tool.slug === 'excel-to-txt') {
      onProgress(40, 'Converting Excel rows to TXT...');
      const text = await excelToTxt(files[0]);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'excel-to-html' || tool.slug === 'excel-to-html') {
      onProgress(40, 'Converting Excel to HTML table...');
      const html = await excelToHtml(files[0]);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.html`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'csv-cleaner' || tool.id === 'csv-deduplicator') {
      onProgress(40, 'Cleaning CSV rows and duplicates...');
      const cleaned = await cleanAndDedupeCsv(files[0]);
      const blob = new Blob([cleaned], { type: 'text/csv' });
      return [{ name: `cleaned-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'csv-formatter' || tool.slug === 'csv-formatter') {
      onProgress(40, 'Standardizing CSV format and column spacing...');
      const formatted = await formatCsv(files[0]);
      const blob = new Blob([formatted], { type: 'text/csv' });
      return [{ name: `formatted-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // 12. WORD & DOCUMENT ADVANCED TOOLS
    if (tool.id === 'docx-to-pdf' || tool.id === 'doc-to-pdf' || tool.id === 'docx-direct-pdf' || tool.slug === 'word-to-pdf') {
      onProgress(40, 'Converting Word document to PDF...');
      const results = [];
      for (const f of files) {
        const pdfBlob = await docxToPdf(f);
        results.push({
          name: `${f.name.replace(/\.[^/.]+$/, '')}.pdf`,
          originalSize: f.size,
          processedSize: pdfBlob.size,
          blob: pdfBlob,
        });
      }
      return results;
    }

    if (tool.id === 'word-to-txt') {
      onProgress(40, 'Extracting plain text from Word...');
      const text = await docxToTxt(files[0]);
      const blob = new Blob([text], { type: 'text/plain' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'word-to-html') {
      onProgress(40, 'Converting Word to HTML...');
      const html = await docxToHtml(files[0]);
      const blob = new Blob([html], { type: 'text/html' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.html`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'word-to-markdown') {
      onProgress(40, 'Converting Word to Markdown...');
      const md = await docxToMarkdown(files[0]);
      const blob = new Blob([md], { type: 'text/markdown' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.md`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'word-cleanup' || tool.id === 'word-document-cleanup' || tool.id === 'remove-word-formatting') {
      onProgress(40, 'Cleaning formatting, double spaces, and bad tags...');
      const results = [];
      for (const f of files) {
        const cleanedBlob = await cleanWordDocument(f);
        results.push({ name: `cleaned-${f.name.replace(/\.[^/.]+$/, '')}.docx`, originalSize: f.size, processedSize: cleanedBlob.size, blob: cleanedBlob });
      }
      return results;
    }

    if (tool.id === 'word-meta-cleaner' || tool.id === 'word-metadata-cleaner') {
      onProgress(40, 'Removing revisions, author tags, and hidden metadata...');
      const results = [];
      for (const f of files) {
        const cleanBlob = await cleanWordMetadata(f);
        results.push({ name: `clean-meta-${f.name.replace(/\.[^/.]+$/, '')}.docx`, originalSize: f.size, processedSize: cleanBlob.size, blob: cleanBlob });
      }
      return results;
    }

    if (tool.id === 'word-compressor') {
      onProgress(40, 'Compressing Word DOCX package...');
      const results = [];
      for (const f of files) {
        const compBlob = await compressDocx(f);
        results.push({ name: `compressed-${f.name.replace(/\.[^/.]+$/, '')}.docx`, originalSize: f.size, processedSize: compBlob.size, blob: compBlob });
      }
      return results;
    }

    if (tool.id === 'word-counter-doc' || tool.id === 'word-file-analyzer' || tool.slug === 'word-file-analyzer') {
      onProgress(40, 'Analyzing document statistics and metrics...');
      const { reportText } = await analyzeDocument(files[0]);
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}_analysis.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'find-replace-word' || tool.id === 'find-replace-in-word') {
      onProgress(40, 'Executing find and replace across document...');
      const resBlob = await findAndReplaceInDocx(files[0], options.find || options.search || '', options.replace || '');
      return [{ name: `updated-${files[0].name.replace(/\.[^/.]+$/, '')}.docx`, originalSize: files[0].size, processedSize: resBlob.size, blob: resBlob }];
    }

    // 13. POWERPOINT PPTX & RTF
    if (tool.id === 'pptx-to-pdf' || tool.id === 'ppt-to-pdf' || tool.id === 'pptx-direct-pdf' || tool.id === 'pptx-to-txt' || tool.slug === 'powerpoint-to-pdf') {
      onProgress(40, 'Parsing PowerPoint presentation slides...');
      const { text, pdfBlob } = await pptxToPdfOrText(files[0]);
      if (tool.id === 'pptx-to-txt') {
        const blob = new Blob([text], { type: 'text/plain' });
        return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
      }
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: pdfBlob.size, blob: pdfBlob }];
    }

    if (tool.id === 'ppt-slide-counter' || tool.slug === 'ppt-slide-counter' || tool.id === 'ppt-to-images') {
      onProgress(40, 'Analyzing PowerPoint slides and metrics...');
      const report = await countPptSlides(files[0]);
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}_slides_report.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'rtf-to-pdf' || tool.slug === 'rtf-to-pdf') {
      onProgress(40, 'Converting RTF to styled PDF...');
      const blob = await rtfToPdf(files[0]);
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // 14. IMAGE FILTERS & COMPRESSION
    if (
      tool.id.includes('grayscale') ||
      tool.id.includes('bw') ||
      tool.id.includes('sharpen') ||
      tool.id.includes('blur') ||
      tool.id.includes('brightness') ||
      tool.id.includes('contrast')
    ) {
      const filter = tool.id.includes('grayscale')
        ? 'grayscale'
        : tool.id.includes('bw')
        ? 'bw'
        : tool.id.includes('sharpen')
        ? 'sharpen'
        : tool.id.includes('blur')
        ? 'blur'
        : tool.id.includes('brightness')
        ? 'brightness'
        : 'contrast';
      onProgress(40, `Applying ${filter} filter...`);
      const results = [];
      for (const f of files) {
        const blob = await applyImageFilter(f, filter as any);
        results.push({ name: `${filter}-${f.name}`, originalSize: f.size, processedSize: blob.size, blob });
      }
      return results;
    }

    if (
      (tool.id.includes('compress') ||
        tool.id === 'image-compress' ||
        tool.slug === 'image-compressor' ||
        tool.id === 'jpg-compressor' ||
        tool.id === 'png-compressor' ||
        tool.id === 'webp-compressor' ||
        tool.slug === 'jpg-compressor' ||
        tool.slug === 'png-compressor' ||
        tool.slug === 'webp-compressor') &&
      (tool.category === 'image' || tool.category === 'compress')
    ) {
      const results = [];
      const targetFormat = options.outputFormat || 'image/jpeg';
      const targetKb = options.targetKb;
      const qualityFactor = options.quality ?? 0.75;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress(Math.round(((i + 1) / files.length) * 90), `Compressing ${file.name}...`);
        
        let outputBlob: Blob;
        let dataUrl: string | undefined;

        if (targetKb && targetKb > 0) {
          const res = await compressImageToTargetKB(file, targetKb, targetFormat);
          outputBlob = res.blob;
          dataUrl = res.dataUrl;
        } else {
          const res = await compressImage(file, qualityFactor);
          outputBlob = res.blob;
          dataUrl = res.dataUrl;
        }

        const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg';
        results.push({
          name: `compressed-${file.name.replace(/\.[^/.]+$/, '')}.${ext}`,
          originalSize: file.size,
          processedSize: outputBlob.size,
          blob: outputBlob,
          dataUrl,
        });
      }
      return results;
    }

    // 15. ZIP & ARCHIVE TOOLS
    if (tool.id === 'zip-creator' || tool.id === 'image-zip-creator') {
      onProgress(50, 'Creating ZIP archive...');
      const blob = await createImagesZip(files);
      return [{ name: 'archive.zip', originalSize: files.reduce((a, f) => a + f.size, 0), processedSize: blob.size, blob }];
    }

    if (tool.id === 'zip-extractor') {
      onProgress(50, 'Unzipping archive contents...');
      const extracted = await extractZipArchive(files[0]);
      return extracted.map((e) => ({
        name: e.name,
        originalSize: files[0].size,
        processedSize: e.blob.size,
        blob: e.blob,
      }));
    }

    if (tool.id === 'file-hash-generator' || tool.id === 'sha256-generator') {
      onProgress(50, 'Calculating SHA-256 cryptographic hash...');
      const hash = await calculateFileHash(files[0], 'SHA-256');
      const blob = new Blob(
        [`File: ${files[0].name}\nSize: ${files[0].size} bytes\nSHA-256: ${hash}\nGenerated by: Miftah Tools\n`],
        { type: 'text/plain' }
      );
      return [{ name: `${files[0].name}.sha256.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // 16. EXTRACT TEXT FROM PDF OR IMAGE (TXT EXPORT)
    if (
      tool.id === 'extract-text-pdf' ||
      tool.id === 'extract-text-from-pdf' ||
      tool.id === 'pdf-to-text' ||
      tool.id === 'pdf-to-txt' ||
      tool.slug === 'extract-text-from-pdf'
    ) {
      onProgress(30, 'Extracting text from PDF pages...');
      const results = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        const extractedText = await extractTextFromPdf(buffer, onProgress);
        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        results.push({
          name: `${f.name.replace(/\.[^/.]+$/, '')}.txt`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      return results;
    }

    // 17. TEXT / MARKDOWN / HTML / CSV / EPUB TO PDF
    if (tool.id === 'txt-to-pdf' || tool.id === 'text-to-pdf' || tool.slug === 'txt-to-pdf' || tool.slug === 'text-to-pdf') {
      onProgress(40, 'Converting text into PDF document...');
      const text = await files[0].text();
      const pdfBytes = await textToPdf(text);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'markdown-to-pdf' || tool.id === 'md-to-pdf' || tool.slug === 'markdown-to-pdf') {
      onProgress(40, 'Converting markdown to PDF...');
      const md = await files[0].text();
      const pdfBytes = await markdownToPdf(md);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'html-to-pdf' || tool.id === 'webpage-to-pdf' || tool.slug === 'html-to-pdf' || tool.slug === 'webpage-to-pdf') {
      onProgress(40, 'Rendering HTML to PDF...');
      const html = await files[0].text();
      const blob = await htmlToPdf(html, files[0].name.replace(/\.[^/.]+$/, ''));
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'csv-to-pdf' || tool.slug === 'csv-to-pdf') {
      onProgress(40, 'Converting CSV to formatted PDF table...');
      const csv = await files[0].text();
      const blob = await csvToPdf(csv, files[0].name.replace(/\.[^/.]+$/, ''));
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'epub-to-pdf' || tool.slug === 'epub-to-pdf') {
      onProgress(40, 'Converting EPUB eBook to PDF...');
      const blob = await epubToPdf(files[0]);
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // 18. IMAGE TO PDF (JPG, PNG, WEBP, BMP, TIFF)
    if (
      tool.id === 'image-to-pdf' ||
      tool.id === 'images-to-pdf' ||
      tool.id === 'multi-images-to-pdf' ||
      tool.id === 'jpg-to-pdf' ||
      tool.id === 'jpeg-to-pdf' ||
      tool.id === 'png-to-pdf' ||
      tool.id === 'webp-to-pdf' ||
      tool.id === 'bmp-to-pdf' ||
      tool.id === 'tiff-to-pdf' ||
      tool.category === 'image' && tool.id.endsWith('-to-pdf')
    ) {
      onProgress(30, 'Encoding images into PDF...');
      const imageBuffers = await Promise.all(
        files.map(async (f) => ({
          buffer: await f.arrayBuffer(),
          mimeType: f.type || 'image/jpeg',
        }))
      );
      const pdfBytes = await imagesToPdf(imageBuffers);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      return [{ name: 'converted-document.pdf', originalSize: files.reduce((a, f) => a + f.size, 0), processedSize: blob.size, blob }];
    }

    // 17. IMAGE ROTATOR & FLIPPER
    if (
      tool.id === 'image-rotator' ||
      tool.id === 'image-rotate' ||
      tool.slug === 'image-rotator' ||
      tool.slug === 'rotate-image' ||
      tool.id === 'image-flipper' ||
      tool.id === 'image-flip' ||
      tool.slug === 'image-flipper' ||
      tool.slug === 'flip-image'
    ) {
      const action = tool.id.includes('flip') || tool.slug.includes('flip')
        ? (options.mode || 'flip-h')
        : (options.action || options.angle || 'rotate-90');
      onProgress(40, 'Rotating / flipping image(s)...');
      const results = [];
      for (const f of files) {
        const res = await rotateAndFlipImage(f, action);
        results.push({
          name: `transformed-${f.name}`,
          originalSize: f.size,
          processedSize: res.blob.size,
          blob: res.blob,
          dataUrl: res.dataUrl,
        });
      }
      return results;
    }

    // 18. IMAGE WATERMARK
    if (
      tool.id === 'image-watermark' ||
      tool.id === 'watermark-image' ||
      tool.slug === 'image-watermark' ||
      tool.slug === 'watermark-image'
    ) {
      onProgress(40, 'Applying custom watermark to image(s)...');
      const results = [];
      for (const f of files) {
        const res = await watermarkImage(
          f,
          options.text || 'Miftah Tools',
          options.opacity ?? 0.5,
          options.color || '#ffffff',
          options.position || 'bottom-right'
        );
        results.push({
          name: `watermarked-${f.name}`,
          originalSize: f.size,
          processedSize: res.blob.size,
          blob: res.blob,
          dataUrl: res.dataUrl,
        });
      }
      return results;
    }

    // 19. IMAGE EXIF & METADATA CLEANER
    if (
      tool.id === 'strip-exif' ||
      tool.id === 'remove-exif' ||
      tool.id === 'clean-exif' ||
      tool.id === 'image-metadata-cleaner' ||
      tool.slug === 'strip-exif' ||
      tool.slug === 'remove-exif' ||
      tool.slug === 'clean-exif' ||
      tool.slug === 'image-metadata-cleaner'
    ) {
      onProgress(40, 'Stripping all EXIF tags, GPS metadata, and privacy markers...');
      const results = [];
      for (const f of files) {
        const res = await stripExifAndMetadata(f);
        results.push({
          name: `clean-${f.name}`,
          originalSize: f.size,
          processedSize: res.blob.size,
          blob: res.blob,
          dataUrl: res.dataUrl,
        });
      }
      return results;
    }

    // 20. IMAGE COLOR PALETTE EXTRACTOR
    if (tool.id === 'image-palette' || tool.slug === 'image-palette') {
      onProgress(40, 'Extracting color palette and dominant tones...');
      const results = [];
      for (const f of files) {
        const colors = await extractColorPalette(f);
        const paletteText = `COLOR PALETTE ANALYSIS - ${f.name}\n` +
          `Generated by Miftah Tools\n\n` +
          colors.map((c, i) => `${i + 1}. HEX: ${c.hex} | RGB: ${c.rgb} | Prevalence: ${c.count}px`).join('\n');
        const blob = new Blob([paletteText], { type: 'text/plain;charset=utf-8' });
        results.push({
          name: `${f.name.replace(/\.[^/.]+$/, '')}_palette.txt`,
          originalSize: f.size,
          processedSize: blob.size,
          blob,
        });
      }
      return results;
    }

    // 21. IMAGE RESIZER & EXACT SIZE (BATCH / STANDARD RUNNER)
    if (tool.id === 'image-resizer' || tool.slug === 'image-resizer') {
      onProgress(30, 'Resizing image dimensions & optimizing size...');
      const results = [];
      for (const f of files) {
        let resBlob: Blob;
        let dataUrl: string | undefined;

        if (options.targetKb && options.targetKb > 0) {
          const comp = await compressImageToTargetKB(f, options.targetKb, options.format || 'image/jpeg');
          resBlob = comp.blob;
          dataUrl = comp.dataUrl;
        } else {
          const resized = await resizeImage(
            f,
            options.width || 1200,
            options.height || 1200,
            options.lockAspect ?? true,
            options.format || 'image/jpeg',
            options.quality ?? 0.92
          );
          resBlob = resized.blob;
          dataUrl = resized.dataUrl;
        }

        results.push({
          name: `resized-${f.name}`,
          originalSize: f.size,
          processedSize: resBlob.size,
          blob: resBlob,
          dataUrl,
        });
      }
      return results;
    }

    // 22. UNIVERSAL IMAGE FORMAT CONVERSIONS (JPG, PNG, WEBP, BMP, TIFF, HEIC, ICO)
    if (
      (tool.id.includes('-to-') || tool.id === 'image-converter' || tool.slug === 'image-converter') &&
      (tool.id.includes('jpg') ||
        tool.id.includes('jpeg') ||
        tool.id.includes('png') ||
        tool.id.includes('webp') ||
        tool.id.includes('bmp') ||
        tool.id.includes('tiff') ||
        tool.id.includes('heic') ||
        tool.id.includes('ico') ||
        tool.id === 'image-converter' ||
        tool.category === 'image')
    ) {
      let targetMime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/x-icon' = 'image/jpeg';
      let targetExt = 'jpg';

      if (tool.id.endsWith('-to-png') || tool.id.endsWith('-to-webp-png')) {
        targetMime = 'image/png';
        targetExt = 'png';
      } else if (tool.id.endsWith('-to-webp')) {
        targetMime = 'image/webp';
        targetExt = 'webp';
      } else if (tool.id.endsWith('-to-ico') || tool.id.includes('ico')) {
        targetMime = 'image/x-icon';
        targetExt = 'ico';
      } else if (options.outputFormat) {
        targetMime = options.outputFormat;
        targetExt = targetMime === 'image/png' ? 'png' : targetMime === 'image/webp' ? 'webp' : 'jpg';
      }

      onProgress(40, `Converting image(s) to ${targetExt.toUpperCase()}...`);
      const results = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await convertImage(file, targetMime, options.quality ?? 0.92);
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        results.push({
          name: `${baseName}.${targetExt}`,
          originalSize: file.size,
          processedSize: res.blob.size,
          blob: res.blob,
          dataUrl: res.dataUrl,
        });
      }
      return results;
    }

    // 18. TEXT TO WORD (DOCX)
    if (tool.id === 'text-to-docx' || tool.id === 'text-to-docx-alt' || tool.id === 'txt-to-docx') {
      onProgress(40, 'Converting text into styled Word DOCX...');
      const text = await files[0].text();
      const docxBlob = await textToDocx(text, files[0].name.replace(/\.[^/.]+$/, ''));
      return [
        {
          name: `${files[0].name.replace(/\.[^/.]+$/, '')}.docx`,
          originalSize: files[0].size,
          processedSize: docxBlob.size,
          blob: docxBlob,
        },
      ];
    }

    // 19. PDF TO HTML & MARKDOWN
    if (tool.id === 'pdf-to-html' || tool.slug === 'pdf-to-html') {
      onProgress(40, 'Converting PDF to HTML document...');
      const results = [];
      for (const f of files) {
        const html = await pdfToHtml(f);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.html`, originalSize: f.size, processedSize: blob.size, blob });
      }
      return results;
    }

    if (tool.id === 'pdf-to-markdown' || tool.slug === 'pdf-to-markdown') {
      onProgress(40, 'Converting PDF to Markdown...');
      const results = [];
      for (const f of files) {
        const md = await pdfToMarkdown(f);
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.md`, originalSize: f.size, processedSize: blob.size, blob });
      }
      return results;
    }

    if (tool.id === 'markdown-to-html' || tool.slug === 'markdown-to-html') {
      onProgress(40, 'Converting Markdown to HTML...');
      const text = await files[0].text();
      const html = await markdownToHtml(text, files[0].name.replace(/\.[^/.]+$/, ''));
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.html`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'html-to-text' || tool.slug === 'html-to-text') {
      onProgress(40, 'Stripping HTML tags to plain text...');
      const text = await files[0].text();
      const plain = htmlToText(text);
      const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
      return [{ name: `${files[0].name.replace(/\.[^/.]+$/, '')}.txt`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'url-encoder-decoder' || tool.slug === 'url-encoder-decoder') {
      onProgress(40, 'Encoding / Decoding URL content...');
      const text = await files[0].text();
      const mode = options.mode || 'encode';
      const output = urlEncodeDecode(text, mode);
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
      return [{ name: `url-${mode}-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // 20. PDF TO EPUB & PPTX
    if (tool.id === 'pdf-to-epub' || tool.slug === 'pdf-to-epub') {
      onProgress(40, 'Converting PDF to EPUB eBook...');
      const results = [];
      for (const f of files) {
        const epubBlob = await pdfToEpub(f);
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.epub`, originalSize: f.size, processedSize: epubBlob.size, blob: epubBlob });
      }
      return results;
    }

    if (tool.id === 'pdf-to-pptx' || tool.id === 'pdf-to-ppt' || tool.slug === 'pdf-to-powerpoint' || tool.slug === 'pdf-to-ppt-slides') {
      onProgress(40, 'Converting PDF pages to PowerPoint slides...');
      const results = [];
      for (const f of files) {
        const pptxBlob = await pdfToPptx(f);
        results.push({ name: `${f.name.replace(/\.[^/.]+$/, '')}.pptx`, originalSize: f.size, processedSize: pptxBlob.size, blob: pptxBlob });
      }
      return results;
    }

    // 21. PDF COLOR CONVERSIONS & ARCHIVAL
    if (tool.id === 'pdf-to-grayscale' || tool.id === 'pdf-to-bw' || tool.slug === 'pdf-to-grayscale' || tool.slug === 'pdf-to-black-and-white') {
      const mode = (tool.id === 'pdf-to-bw' || tool.slug === 'pdf-to-black-and-white') ? 'bw' : 'grayscale';
      onProgress(40, `Converting PDF to ${mode.toUpperCase()}...`);
      const results = [];
      for (const f of files) {
        const buf = await f.arrayBuffer();
        const converted = await pdfToGrayscaleOrBw(buf, mode);
        const blob = new Blob([converted as any], { type: 'application/pdf' });
        results.push({ name: `${mode}-${f.name}`, originalSize: f.size, processedSize: blob.size, blob });
      }
      return results;
    }

    if (tool.id === 'pdf-to-pdfa' || tool.id === 'pdf-to-pdfx' || tool.slug === 'pdf-to-pdf-a' || tool.slug === 'pdf-to-pdf-x') {
      onProgress(40, 'Converting PDF to Archival PDF/A...');
      const results = [];
      for (const f of files) {
        const buf = await f.arrayBuffer();
        const converted = await convertPdfToPdfA(buf);
        const blob = new Blob([converted as any], { type: 'application/pdf' });
        results.push({ name: `pdfa-${f.name}`, originalSize: f.size, processedSize: blob.size, blob });
      }
      return results;
    }

    if (tool.id === 'pdf-reorder-pages' || tool.id === 'pdf-replace-pages' || tool.id === 'pdf-sort-pages' || tool.slug === 'reorder-pdf-pages' || tool.slug === 'sort-pdf-pages') {
      onProgress(40, 'Reorganizing PDF pages...');
      const buf = await files[0].arrayBuffer();
      const converted = tool.id === 'pdf-sort-pages' || tool.slug === 'sort-pdf-pages'
        ? await sortPdfPages(buf, options.direction || 'asc')
        : await reorderPdfPages(buf, options.pageOrder || [1, 2]);
      const blob = new Blob([converted as any], { type: 'application/pdf' });
      return [{ name: `reordered-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'pdf-remove-watermark' || tool.slug === 'remove-watermark-pdf') {
      onProgress(40, 'Cleaning watermark elements...');
      const buf = await files[0].arrayBuffer();
      const cleaned = await removePdfWatermark(buf);
      const blob = new Blob([cleaned as any], { type: 'application/pdf' });
      return [{ name: `cleaned-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    if (tool.id === 'reverse-text' || tool.id === 'reverse-lines' || tool.slug === 'reverse-text' || tool.slug === 'reverse-lines') {
      onProgress(40, 'Reversing text content...');
      const text = await files[0].text();
      const mode = (tool.id === 'reverse-lines' || tool.slug === 'reverse-lines') ? 'lines' : 'characters';
      const reversed = reverseText(text, mode);
      const blob = new Blob([reversed], { type: 'text/plain;charset=utf-8' });
      return [{ name: `reversed-${files[0].name}`, originalSize: files[0].size, processedSize: blob.size, blob }];
    }

    // Default Fallback
    return files.map((f) => ({
      name: `processed-${f.name}`,
      originalSize: f.size,
      processedSize: f.size,
      blob: f,
    }));
  };

  return <ToolLayout tool={tool} onProcess={handleProcess} customWorkspace={customWorkspace} />;
}
