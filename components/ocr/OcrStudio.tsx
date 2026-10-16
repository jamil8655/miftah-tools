'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  runOcr,
  OcrResult,
  parseOcrTextToTable,
  ocrTableToExcel,
  ocrTableToCsv,
  preprocessCanvas,
  createSearchablePdf,
} from '@/lib/ocr/ocr-engine';
import { textToWordDocx } from '@/lib/documents/doc-converter';
import { getPdfJsLib, formatBytes } from '@/lib/utils/formatters';
import { ProgressBar } from '@/components/shared/ProgressBar';
import {
  ScanText,
  Copy,
  Check,
  Download,
  Languages,
  Sparkles,
  FileText,
  Share2,
  Table as TableIcon,
  Search,
  Camera,
  RotateCw,
  Sliders,
  Plus,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { addHistoryItem } from '@/lib/storage/file-store';
import { useI18n } from '@/lib/i18n/i18n-context';

export type OcrMode =
  | 'text'
  | 'word'
  | 'excel'
  | 'csv'
  | 'searchable-pdf'
  | 'optimize-scan'
  | 'scan-to-pdf';

interface OcrStudioProps {
  toolId?: string;
  initialMode?: OcrMode;
}

interface PageScanItem {
  pageNum: number;
  dataUrl: string;
  width: number;
  height: number;
  ocrResult?: OcrResult;
}

const OCR_LANGUAGES = [
  { code: 'eng', label: 'English (Latin)', script: 'ltr' },
  { code: 'eng+hin', label: 'English + हिन्दी (Bilingual)', script: 'ltr' },
  { code: 'eng+urd', label: 'English + اردو (Bilingual)', script: 'rtl' },
  { code: 'eng+ara', label: 'English + العربية (Bilingual)', script: 'rtl' },
  { code: 'hin', label: 'हिन्दी (Hindi)', script: 'ltr' },
  { code: 'urd', label: 'اردو (Urdu)', script: 'rtl' },
  { code: 'ara', label: 'العربية (Arabic)', script: 'rtl' },
  { code: 'spa', label: 'Español (Spanish)', script: 'ltr' },
  { code: 'fra', label: 'Français (French)', script: 'ltr' },
  { code: 'deu', label: 'Deutsch (German)', script: 'ltr' },
];

export function OcrStudio({ toolId, initialMode }: OcrStudioProps) {
  const { language: appLang, isRTL } = useI18n();

  // Determine active mode based on toolId or initialMode
  const getEffectiveMode = (): OcrMode => {
    if (initialMode) return initialMode;
    if (toolId === 'ocr-to-excel') return 'excel';
    if (toolId === 'ocr-to-csv') return 'csv';
    if (toolId === 'ocr-to-word') return 'word';
    if (toolId === 'ocr-to-txt') return 'text';
    if (toolId === 'make-pdf-searchable' || toolId === 'image-searchable-pdf') return 'searchable-pdf';
    if (toolId === 'pdf-optimize-scan' || toolId === 'optimize-scanned-pdf') return 'optimize-scan';
    if (toolId === 'scan-to-pdf') return 'scan-to-pdf';
    return 'text';
  };

  const [activeMode, setActiveMode] = useState<OcrMode>(getEffectiveMode());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageScanItem[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');

  // Preprocessing Options
  const [rotation, setRotation] = useState<number>(0);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);
  const [binarize, setBinarize] = useState<boolean>(false);

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Overall combined result
  const [combinedText, setCombinedText] = useState<string>('');
  const [combinedTable, setCombinedTable] = useState<string[][]>([]);
  const [avgConfidence, setAvgConfidence] = useState<number>(0);
  const [searchablePdfBlob, setSearchablePdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync mode if toolId changes
  useEffect(() => {
    setActiveMode(getEffectiveMode());
  }, [toolId, initialMode]);

  // Load files and render preview canvases
  const loadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setSelectedFiles(files);
    setPages([]);
    setCombinedText('');
    setCombinedTable([]);
    setSearchablePdfBlob(null);
    setErrorMsg(null);
    setIsProcessing(true);
    setProgress(10);
    setStatusText('Loading document pages for analysis...');

    try {
      const isPdf = files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf');
      const loadedPages: PageScanItem[] = [];

      if (isPdf) {
        const pdfjsLib = await getPdfJsLib();
        if (!pdfjsLib) throw new Error('PDF library is unavailable.');

        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const total = pdf.numPages;

        for (let i = 1; i <= total; i++) {
          setProgress(10 + Math.round((i / total) * 30));
          setStatusText(`Rendering page ${i} of ${total}...`);

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            loadedPages.push({
              pageNum: i,
              dataUrl: canvas.toDataURL('image/jpeg', 0.88),
              width: viewport.width,
              height: viewport.height,
            });
            canvas.width = 0;
            canvas.height = 0;
          }
        }
      } else {
        // Process image files
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          setProgress(10 + Math.round(((i + 1) / files.length) * 30));
          setStatusText(`Reading image ${i + 1} of ${files.length}...`);

          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(f);
          });

          // Measure image dimensions
          const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth || 800, h: img.naturalHeight || 1100 });
            img.onerror = () => resolve({ w: 800, h: 1100 });
            img.src = dataUrl;
          });

          loadedPages.push({
            pageNum: i + 1,
            dataUrl,
            width: dimensions.w,
            height: dimensions.h,
          });
        }
      }

      setPages(loadedPages);
      setActivePageIndex(0);
      setIsProcessing(false);
      setProgress(0);
      setStatusText('');
      triggerHaptic('selection');
    } catch (err: any) {
      console.error('File load error:', err);
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Failed to parse file.');
    }
  };

  // Run OCR on all loaded pages
  const handleStartOcr = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusText(`Initializing OCR neural engine (${ocrLanguage})...`);
    setErrorMsg(null);
    triggerHaptic('medium');

    try {
      let allText = '';
      let totalConfidence = 0;
      const updatedPages: PageScanItem[] = [];
      const searchablePagesData: {
        imageBytes: Uint8Array;
        isPng: boolean;
        width: number;
        height: number;
        words?: any[];
      }[] = [];

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const pageBasePct = 10 + Math.round((i / pages.length) * 80);
        setProgress(pageBasePct);
        setStatusText(`Running OCR on page ${i + 1} of ${pages.length}...`);

        // Load image onto a canvas for pre-processing (rotation, contrast, binarization)
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = p.dataUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || p.width;
        canvas.height = img.naturalHeight || p.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }

        // Apply pre-processing (contrast/binarize/rotate)
        const processedCanvas = preprocessCanvas(canvas, {
          rotation,
          enhanceContrast,
          binarize: activeMode === 'optimize-scan' ? true : binarize,
        });

        const ocrRes = await runOcr(processedCanvas, ocrLanguage, (pct, status) => {
          const stepPct = pageBasePct + Math.round((pct / 100) * (80 / pages.length));
          setProgress(Math.min(92, stepPct));
          setStatusText(`Page ${i + 1}: ${status}`);
        });

        totalConfidence += ocrRes.confidence;
        if (ocrRes.text && ocrRes.text.trim()) {
          allText += (allText ? '\n\n' : '') + ocrRes.text.trim();
        }

        // Collect bytes for Searchable PDF
        const finalBlob = await new Promise<Blob | null>((res) =>
          processedCanvas.toBlob(res, 'image/jpeg', 0.9)
        );
        if (finalBlob) {
          const arr = await finalBlob.arrayBuffer();
          searchablePagesData.push({
            imageBytes: new Uint8Array(arr),
            isPng: false,
            width: processedCanvas.width,
            height: processedCanvas.height,
            words: ocrRes.words,
          });
        }

        updatedPages.push({
          ...p,
          ocrResult: ocrRes,
        });

        canvas.width = 0;
        canvas.height = 0;
        processedCanvas.width = 0;
        processedCanvas.height = 0;
      }

      setPages(updatedPages);
      setCombinedText(allText);
      const parsedTable = parseOcrTextToTable(allText);
      setCombinedTable(parsedTable);
      const finalAvgConf = Math.round(totalConfidence / pages.length);
      setAvgConfidence(finalAvgConf);

      // Generate Searchable PDF if relevant
      if (searchablePagesData.length > 0) {
        setStatusText('Building Searchable PDF document...');
        const pdfBytes = await createSearchablePdf(searchablePagesData);
        setSearchablePdfBlob(new Blob([pdfBytes as any], { type: 'application/pdf' }));
      }

      setIsProcessing(false);
      setProgress(100);
      setStatusText('OCR completed successfully!');
      triggerHaptic('success');

      if (selectedFiles.length > 0) {
        addHistoryItem({
          toolId: toolId || 'ocr-text-recognition',
          toolName: 'OCR Text & Document Scanner',
          fileName: selectedFiles[0].name,
          originalSize: selectedFiles[0].size,
          outputSize: allText.length,
          success: true,
        });
      }
    } catch (err: any) {
      console.error('OCR run failed:', err);
      setIsProcessing(false);
      setErrorMsg(err?.message || 'OCR Recognition encountered an issue. Please try a clearer scan.');
      triggerHaptic('error');
    }
  };

  // Export handlers
  const handleCopy = () => {
    if (!combinedText) return;
    navigator.clipboard.writeText(combinedText);
    setCopied(true);
    triggerHaptic('selection');
    setTimeout(() => setCopied(false), 2000);
  };

  const getBaseFileName = () => {
    return selectedFiles[0]?.name ? selectedFiles[0].name.replace(/\.[^/.]+$/, '') : 'ocr-extracted';
  };

  const handleDownloadTxt = () => {
    if (!combinedText) return;
    const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
    downloadSingleFile(blob, `${getBaseFileName()}.txt`);
    triggerHaptic('selection');
  };

  const handleDownloadDocx = async () => {
    if (!combinedText) return;
    const blob = await textToWordDocx(combinedText, getBaseFileName());
    downloadSingleFile(blob, `${getBaseFileName()}.docx`);
    triggerHaptic('selection');
  };

  const handleDownloadExcel = () => {
    if (combinedTable.length === 0) return;
    const excelBytes = ocrTableToExcel(combinedTable, 'OCR Scanned Data');
    const blob = new Blob([excelBytes as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadSingleFile(blob, `${getBaseFileName()}.xlsx`);
    triggerHaptic('selection');
  };

  const handleDownloadCsv = () => {
    if (combinedTable.length === 0) return;
    const csvStr = ocrTableToCsv(combinedTable);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8' });
    downloadSingleFile(blob, `${getBaseFileName()}.csv`);
    triggerHaptic('selection');
  };

  const handleDownloadSearchablePdf = () => {
    if (!searchablePdfBlob) return;
    downloadSingleFile(searchablePdfBlob, `${getBaseFileName()}-searchable.pdf`);
    triggerHaptic('selection');
  };

  const handleShare = async () => {
    if (searchablePdfBlob && activeMode === 'searchable-pdf') {
      await shareDownloadedFile({
        name: `${getBaseFileName()}-searchable.pdf`,
        blob: searchablePdfBlob,
      });
    } else {
      const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
      await shareDownloadedFile({
        name: `${getBaseFileName()}.txt`,
        blob,
      });
    }
  };

  // Table cell editing
  const handleTableCellChange = (rowIdx: number, colIdx: number, val: string) => {
    const updated = combinedTable.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? val : cell)) : row
    );
    setCombinedTable(updated);
  };

  const handleAddTableRow = () => {
    const colCount = combinedTable[0]?.length || 3;
    const newRow = new Array(colCount).fill('');
    setCombinedTable([...combinedTable, newRow]);
  };

  const handleDeleteTableRow = (rowIdx: number) => {
    setCombinedTable(combinedTable.filter((_, idx) => idx !== rowIdx));
  };

  const isRtlLang = ocrLanguage === 'urd' || ocrLanguage === 'ara' || ocrLanguage.includes('urd') || ocrLanguage.includes('ara');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full max-w-5xl mx-auto space-y-6 py-2 animate-in fade-in duration-300">
      {/* Title & Mode Switcher Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-brand-500/5 to-cyan-500/10 border border-brand-500/20 rounded-3xl p-6 sm:p-7 backdrop-blur-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Multi-Engine OCR AI Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              OCR Document & Image Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Extract editable text, convert scanned receipts to Excel & CSV, create Searchable PDFs, and digitize documents in Urdu, Arabic, Hindi & English.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Neural OCR</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 no-scrollbar">
          {[
            { id: 'text', label: 'OCR to Text', icon: ScanText },
            { id: 'word', label: 'OCR to Word (.docx)', icon: FileText },
            { id: 'excel', label: 'OCR to Excel (.xlsx)', icon: FileSpreadsheet },
            { id: 'csv', label: 'OCR to CSV', icon: FileCode },
            { id: 'searchable-pdf', label: 'Searchable PDF', icon: Search },
            { id: 'optimize-scan', label: 'Clean & Enhance Scan', icon: Sparkles },
            { id: 'scan-to-pdf', label: 'Camera / Scan to PDF', icon: Camera },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setActiveMode(m.id as OcrMode);
                  triggerHaptic('selection');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload Zone */}
      {pages.length === 0 ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                loadFiles(Array.from(e.dataTransfer.files));
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-brand-400/50 hover:border-brand-500 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 bg-white/60 dark:bg-slate-900/60 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 shadow-sm hover:shadow-md"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) loadFiles(Array.from(e.target.files));
              }}
            />
            {/* Hidden native camera capture input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) loadFiles(Array.from(e.target.files));
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <ScanText className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Drop Scanned PDF or Image Photos Here
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  Supports Multi-Page PDFs, JPG, PNG, WebP, BMP, and Camera Scans • Automatic Table & Text Extraction
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Choose Documents</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all"
                >
                  <Camera className="w-4 h-4 text-brand-500" />
                  <span>Camera Scan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Document Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {selectedFiles[0]?.name || 'Document'}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{formatBytes(selectedFiles[0]?.size || 0)}</span>
                  <span>•</span>
                  <span>{pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setPages([]);
                  setCombinedText('');
                  setCombinedTable([]);
                  setSearchablePdfBlob(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Change Document
              </button>
            </div>
          </div>

          {/* OCR Configuration & Pre-processing Toolbar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-brand-500" />
                <span>OCR Recognition & Image Optimization Settings</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Bilingual & Multi-Script Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-brand-500" />
                  <span>Document Language:</span>
                </label>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {OCR_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rotation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-brand-500" />
                  <span>Rotate Orientation:</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = (rotation + 90) % 360;
                    setRotation(next);
                    triggerHaptic('selection');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between"
                >
                  <span>Rotate 90° Clockwise</span>
                  <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 text-[11px]">
                    {rotation}°
                  </span>
                </button>
              </div>

              {/* Contrast Enhancement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Contrast & Lighting:</span>
                </label>
                <label className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Auto-Clean Shadows
                  </span>
                  <input
                    type="checkbox"
                    checked={enhanceContrast}
                    onChange={(e) => setEnhanceContrast(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>
              </div>

              {/* Binarization (Crisp B&W) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand-500" />
                  <span>Binarize Text:</span>
                </label>
                <label className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Crisp Black & White
                  </span>
                  <input
                    type="checkbox"
                    checked={binarize}
                    onChange={(e) => setBinarize(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Page Preview Thumbnails Bar */}
          {pages.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Document Pages ({pages.length})
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {pages.map((p, idx) => (
                  <button
                    key={p.pageNum}
                    type="button"
                    onClick={() => setActivePageIndex(idx)}
                    className={`shrink-0 flex flex-col items-center p-2 rounded-xl border transition-all ${
                      activePageIndex === idx
                        ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <img
                      src={p.dataUrl}
                      alt={`Page ${p.pageNum}`}
                      className="w-16 h-20 object-contain rounded bg-white shadow-xs"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                    <span className="mt-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Page {p.pageNum}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          {!combinedText && !isProcessing && (
            <button
              type="button"
              onClick={handleStartOcr}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 hover:from-brand-500 text-white font-black text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transform active:scale-[0.99] transition-all"
            >
              <ScanText className="w-5 h-5" />
              <span>
                {activeMode === 'excel'
                  ? 'Extract Scanned Table to Excel (.xlsx)'
                  : activeMode === 'csv'
                  ? 'Extract Scanned Table to CSV'
                  : activeMode === 'searchable-pdf'
                  ? 'Generate Searchable PDF (Selectable Text)'
                  : activeMode === 'word'
                  ? 'Extract Scanned Document to Word (.docx)'
                  : 'Run OCR Text Recognition'}
              </span>
            </button>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="p-6 rounded-3xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-brand-900 dark:text-brand-200">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-brand-500 animate-spin" />
                  <span>{statusText || 'Extracting text with OCR...'}</span>
                </div>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-brand-200 dark:bg-brand-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* OCR Results Dashboard */}
          {combinedText && !isProcessing && (
            <div className="space-y-6">
              {/* Stats & Quality Banner */}
              <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                    {avgConfidence}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      OCR Recognition Successful
                    </h4>
                    <p className="text-xs text-slate-500">
                      Confidence: {avgConfidence}% • {combinedText.length} characters • {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                    </p>
                  </div>
                </div>

                {/* Primary Export Buttons Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  {/* Word Export */}
                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Word (.DOCX)</span>
                  </button>

                  {/* Excel Export */}
                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel (.XLSX)</span>
                  </button>

                  {/* CSV Export */}
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>CSV</span>
                  </button>

                  {/* Searchable PDF Export */}
                  {searchablePdfBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadSearchablePdf}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
                    >
                      <Search className="w-4 h-4" />
                      <span>Searchable PDF</span>
                    </button>
                  )}

                  {/* TXT Export */}
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>TXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    title="Share File"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabular Spreadsheet Grid for Excel & CSV Modes */}
              {(activeMode === 'excel' || activeMode === 'csv' || combinedTable.length > 1) && (
                <div className="space-y-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <TableIcon className="w-4 h-4 text-emerald-500" />
                      <span>Structured Table Grid ({combinedTable.length} Rows)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddTableRow}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Row</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-96 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody>
                        {combinedTable.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={rIdx === 0 ? 'bg-slate-100 dark:bg-slate-800/80 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800'}
                          >
                            <td className="p-2 w-8 text-center text-[10px] text-slate-400 font-mono">
                              {rIdx + 1}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-1.5 border-l border-slate-200 dark:border-slate-800">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleTableCellChange(rIdx, cIdx, e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 rounded"
                                />
                              </td>
                            ))}
                            <td className="p-1.5 w-8 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteTableRow(rIdx)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Editable Text Area */}
              <div className="space-y-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span>Extracted Text Content</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {combinedText.split(/\s+/).filter(Boolean).length} Words
                  </span>
                </div>

                <textarea
                  rows={12}
                  dir={isRtlLang ? 'rtl' : 'ltr'}
                  value={combinedText}
                  onChange={(e) => {
                    const newTxt = e.target.value;
                    setCombinedText(newTxt);
                    setCombinedTable(parseOcrTextToTable(newTxt));
                  }}
                  className={`w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-sans text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    isRtlLang ? 'text-right' : 'text-left'
                  }`}
                />
              </div>

              {/* Bottom Re-scan Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCombinedText('');
                    setCombinedTable([]);
                    setSearchablePdfBlob(null);
                    handleStartOcr();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-scan with Current Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setPages([]);
                    setCombinedText('');
                    setCombinedTable([]);
                    setSearchablePdfBlob(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm"
                >
                  Scan Another Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
