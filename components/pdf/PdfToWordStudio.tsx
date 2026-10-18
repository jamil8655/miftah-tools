'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Share2,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Settings2,
  AlignRight,
  AlignLeft,
  Languages,
  Check,
  Eye,
  AlertCircle,
  ShieldCheck,
  Type,
} from 'lucide-react';
import { pdfToDocx, PdfToDocxOptions } from '@/lib/documents/doc-converter';
import { downloadSingleFile, shareDownloadedFile } from '@/lib/utils/download';
import { getPdfJsLib, formatBytes } from '@/lib/utils/formatters';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';

export function PdfToWordStudio() {
  const { language } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageThumbnails, setPageThumbnails] = useState<{ pageNum: number; dataUrl: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [detectedRtl, setDetectedRtl] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings
  const [directionMode, setDirectionMode] = useState<'auto' | 'rtl' | 'ltr'>('auto');
  const [cleanArtifacts, setCleanArtifacts] = useState<boolean>(true);
  const [preserveExactSizes, setPreserveExactSizes] = useState<boolean>(true);
  const [normalizeArabic, setNormalizeArabic] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrduOrArabic = language === 'ur' || language === 'ar';

  // Load and render PDF page thumbnails
  const loadPdf = async (selectedFile: File) => {
    setFile(selectedFile);
    setConvertedBlob(null);
    setErrorMsg(null);
    setPageThumbnails([]);
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStatus('Reading PDF document structure...');

    try {
      const pdfjsLib = await getPdfJsLib();
      if (!pdfjsLib) throw new Error('PDF library unavailable.');

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setTotalPages(pdf.numPages);

      // Render previews for first up to 6 pages
      const previewCount = Math.min(6, pdf.numPages);
      const thumbs: { pageNum: number; dataUrl: string }[] = [];
      let rtlCount = 0;
      let ltrCount = 0;

      for (let i = 1; i <= previewCount; i++) {
        setProgressPercent(5 + Math.round((i / previewCount) * 20));
        setProgressStatus(`Rendering preview page ${i} of ${previewCount}...`);

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textStr = (textContent.items || []).map((it: any) => it.str || '').join(' ');
        const rtlChars = (textStr.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
        if (rtlChars > 15) {
          rtlCount++;
        } else if (textStr.trim().length > 30) {
          ltrCount++;
        }

        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL('image/jpeg', 0.8) });
          canvas.width = 0;
          canvas.height = 0;
        }
      }

      setPageThumbnails(thumbs);
      setDetectedRtl(rtlCount >= ltrCount && rtlCount > 0);
      setIsProcessing(false);
      setProgressPercent(0);
      setProgressStatus('');
      triggerHaptic('selection');
    } catch (err: any) {
      console.error('Error reading PDF:', err);
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Failed to parse PDF document.');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        loadPdf(f);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Starting high-fidelity Word conversion...');
    triggerHaptic('medium');

    const options: PdfToDocxOptions = {
      forceRtl: directionMode === 'rtl' ? true : directionMode === 'ltr' ? false : 'auto',
      cleanArtifacts,
      preserveExactFontSize: preserveExactSizes,
      normalizeArabic,
      language:
        directionMode === 'rtl'
          ? language === 'ur'
            ? 'urd'
            : 'ara'
          : directionMode === 'ltr'
          ? 'eng'
          : detectedRtl
          ? language === 'ur'
            ? 'urd'
            : 'ara'
          : 'auto',
    };

    try {
      const docx = await pdfToDocx(
        file,
        (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        },
        options
      );

      setConvertedBlob(docx);
      setIsProcessing(false);
      triggerHaptic('success');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Failed to convert PDF to Word document.');
      triggerHaptic('error');
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    downloadSingleFile(convertedBlob, `${baseName}.docx`);
    triggerHaptic('selection');
  };

  const handleShare = async () => {
    if (!convertedBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    await shareDownloadedFile({ name: `${baseName}.docx`, blob: convertedBlob });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Title & Badge */}
      <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Smart RTL & Exact-Size Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isUrduOrArabic ? 'پی ڈی ایف کو ورڈ میں تبدیل کریں (DOCX)' : 'High-Fidelity PDF to Word (DOCX)'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {isUrduOrArabic
                ? 'اردو اور عربی دائیں سے بائیں (RTL)، انگلش بائیں سے دائیں، اصل سائز اور بغیر کسی خرابی یا دائروں کے مکمل محفوظ ورڈ فائل بنائیں۔'
                : 'Convert PDF documents to editable Microsoft Word (.docx) with automatic Right-to-Left (Urdu & Arabic) support, zero symbol/circle artifacts, and exact font size matching.'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side & Private</span>
          </div>
        </div>
      </div>

      {/* Main Upload / Control Card */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative border-2 border-dashed border-blue-400/50 hover:border-blue-500 dark:border-blue-500/30 hover:dark:border-blue-400 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 bg-white/50 dark:bg-slate-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 shadow-sm hover:shadow-md"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                loadPdf(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isUrduOrArabic ? 'پی ڈی ایف فائل منتخب کریں یا یہاں ڈریگ کریں' : 'Click or Drag & Drop PDF Document Here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports Standard & Scanned PDFs • Multilingual (Urdu, Arabic, English, Hindi)
              </p>
            </div>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{isUrduOrArabic ? 'فائل منتخب کریں' : 'Browse Files'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
                  {detectedRtl !== null && (
                    <>
                      <span>•</span>
                      <span className={`font-medium ${detectedRtl ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {detectedRtl ? 'Urdu/Arabic RTL Detected' : 'English/LTR Detected'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setConvertedBlob(null);
                  setPageThumbnails([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Change PDF
              </button>
            </div>
          </div>

          {/* Direction & Layout Settings Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                <Settings2 className="w-4 h-4 text-blue-500" />
                <span>Text Layout & Language Direction</span>
              </div>
              <span className="text-xs text-slate-500">Zero Error Guarantee</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDirectionMode('auto')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  directionMode === 'auto'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Languages className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Auto-Detect (Smart)</div>
                  <div className="text-[11px] text-slate-500">Arabic/Urdu (RTL) & English (LTR)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDirectionMode('rtl')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  directionMode === 'rtl'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <AlignRight className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Right-to-Left (دائیں سے بائیں)</div>
                  <div className="text-[11px] text-slate-500">Urdu, Arabic, Persian</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDirectionMode('ltr')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  directionMode === 'ltr'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <AlignLeft className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Left-to-Right (LTR)</div>
                  <div className="text-[11px] text-slate-500">English, Hindi, Latin</div>
                </div>
              </button>
            </div>

            {/* Smart Quality Checks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanArtifacts}
                  onChange={(e) => setCleanArtifacts(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Clean Strange Circles & Symbols</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveExactSizes}
                  onChange={(e) => setPreserveExactSizes(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Preserve Exact Font Sizes</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={normalizeArabic}
                  onChange={(e) => setNormalizeArabic(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Connect Arabic Cursive Script</span>
              </label>
            </div>
          </div>

          {/* Page Preview Thumbnails */}
          {pageThumbnails.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Document Page Preview</span>
                </div>
                <span className="text-slate-500">Showing {pageThumbnails.length} of {totalPages} pages</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {pageThumbnails.map((thumb) => (
                  <div
                    key={thumb.pageNum}
                    className="flex flex-col items-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                  >
                    <img
                      src={thumb.dataUrl}
                      alt={`Page ${thumb.pageNum}`}
                      className="w-full h-32 object-contain rounded-lg shadow-xs bg-white"
                    />
                    <span className="mt-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Page {thumb.pageNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar during conversion */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  <span>{progressStatus || 'Processing...'}</span>
                </div>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-500/30 flex items-center gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action / Download Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {!convertedBlob ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvert}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Converting PDF to Word...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Convert to Word (.docx)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Word Document (.docx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConvertedBlob(null);
                    handleConvert();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Re-convert</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
