'use client';

import React, { useState } from 'react';
import { runOcr, OcrResult } from '@/lib/ocr/ocr-engine';
import { textToWordDocx } from '@/lib/documents/doc-converter';
import { getPdfJsLib } from '@/lib/utils/formatters';
import { FileUploader } from '@/components/shared/FileUploader';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ScanText, Copy, Check, Download, Languages, Sparkles, FileText } from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';
import { addHistoryItem } from '@/lib/storage/file-store';
import { useI18n } from '@/lib/i18n/i18n-context';

const OCR_LOCALES = {
  en: {
    initWorker: 'Initializing OCR Web Worker engine...',
    ocrFailed: 'OCR Recognition failed. Please try a clearer image.',
    docLangTitle: 'Document Text Language',
    docLangSubtitle: 'Select the primary language of the text in your image',
    extractButton: 'Extract Text with OCR',
    extractingTitle: 'Extracting Text with OCR...',
    ocrCompleted: 'OCR Recognition Completed',
    confidenceScore: (conf: number, chars: number) => `Confidence score: ${conf}% • ${chars} characters extracted`,
    copied: 'Copied!',
    copyText: 'Copy Text',
    exportTxt: 'Export .TXT',
    exportDocx: 'Export Word (.DOCX)',
    scanAnother: 'Scan Another Document',
  },
  ur: {
    initWorker: 'OCR انجن شروع کیا جا رہا ہے...',
    ocrFailed: 'OCR کی شناخت ناکام ہو گئی۔ براہ کرم واضح تصویر آزمائیں۔',
    docLangTitle: 'دستاویزی متن کی زبان',
    docLangSubtitle: 'اپنی تصویر میں موجود متن کی بنیادی زبان منتخب کریں',
    extractButton: 'OCR سے متن نکالیں',
    extractingTitle: 'OCR سے متن نکالا جا رہا ہے...',
    ocrCompleted: 'OCR کی شناخت مکمل ہو گئی',
    confidenceScore: (conf: number, chars: number) => `درستگی: ${conf}% • ${chars} حروف نکالے گئے`,
    copied: 'کاپی ہو گیا!',
    copyText: 'متن کاپی کریں',
    exportTxt: 'TXT برآمد کریں',
    exportDocx: 'Word DOCX برآمد کریں',
    scanAnother: 'دوسری دستاویز اسکین کریں',
  },
  ar: {
    initWorker: 'جاري تشغيل محرك OCR...',
    ocrFailed: 'فشل التعرف على النص. يرجى تجربة صورة أوضح.',
    docLangTitle: 'لغة نص المستند',
    docLangSubtitle: 'حدد اللغة الأساسية للنص الموجود في صورتك',
    extractButton: 'استخراج النص بواسطة OCR',
    extractingTitle: 'جاري استخراج النص بواسطة OCR...',
    ocrCompleted: 'اكتمل التعرف على النص بنجاح',
    confidenceScore: (conf: number, chars: number) => `نسبة الدقة: ${conf}% • تم استخراج ${chars} حرفًا`,
    copied: 'تم النسخ!',
    copyText: 'نسخ النص',
    exportTxt: 'تصدير TXT',
    exportDocx: 'تصدير Word (.DOCX)',
    scanAnother: 'مسح مستند آخر',
  },
  hi: {
    initWorker: 'OCR इंजन शुरू हो रहा है...',
    ocrFailed: 'OCR पहचान विफल रही। कृपया अधिक स्पष्ट छवि आज़माएं।',
    docLangTitle: 'दस्तावेज़ पाठ की भाषा',
    docLangSubtitle: 'अपनी छवि में मौजूद पाठ की प्राथमिक भाषा चुनें',
    extractButton: 'OCR से पाठ निकालें',
    extractingTitle: 'OCR से पाठ निकाला जा रहा है...',
    ocrCompleted: 'OCR पहचान पूरी हुई',
    confidenceScore: (conf: number, chars: number) => `सटीकता स्कोर: ${conf}% • ${chars} अक्षर निकाले गए`,
    copied: 'कॉपी हो गया!',
    copyText: 'टेक्स्ट कॉपी करें',
    exportTxt: 'TXT निर्यात करें',
    exportDocx: 'Word (.DOCX) निर्यात करें',
    scanAnother: 'दूसरा दस्तावेज़ स्कैन करें',
  },
};

export function OcrStudio() {
  const { language: appLang, isRTL } = useI18n();
  const loc = OCR_LOCALES[appLang] || OCR_LOCALES.en;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState<string>('eng');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartOcr = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusText(loc.initWorker);
    setErrorMsg(null);
    setOcrResult(null);

    try {
      const file = selectedFiles[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        setStatusText('Loading PDF pages for OCR scanning...');
        const pdfjsLib = await getPdfJsLib();
        if (!pdfjsLib) throw new Error('PDF library unavailable');

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        let combinedText = '';
        let totalConf = 0;
        let countedPages = 0;

        for (let p = 1; p <= totalPages; p++) {
          const basePct = Math.round((p / totalPages) * 85);
          setProgress(basePct);
          setStatusText(`Scanning page ${p} of ${totalPages}...`);

          const page = await pdfDoc.getPage(p);
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');
            const pageRes = await runOcr(dataUrl, language);
            if (pageRes.text && pageRes.text.trim()) {
              combinedText += (combinedText ? '\n\n' : '') + pageRes.text.trim();
              totalConf += pageRes.confidence;
              countedPages++;
            }
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        const avgConf = countedPages > 0 ? Math.round(totalConf / countedPages) : 90;
        const res: OcrResult = {
          text: combinedText || 'No text could be recognized from the PDF.',
          confidence: avgConf,
          lines: combinedText.split('\n').map((l) => ({ text: l, confidence: avgConf })),
        };
        setOcrResult(res);
      } else {
        const result = await runOcr(file, language, (pct, status) => {
          setProgress(pct);
          setStatusText(status);
        });
        setOcrResult(result);
      }

      addHistoryItem({
        toolId: 'ocr-image-to-text',
        toolName: 'OCR Image/PDF to Text & Word',
        fileName: file.name,
        originalSize: file.size,
        outputSize: ocrResult?.text.length || file.size,
        success: true,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || loc.ocrFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!ocrResult?.text) return;
    navigator.clipboard.writeText(ocrResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!ocrResult?.text) return;
    const baseName = selectedFiles[0]?.name ? selectedFiles[0].name.replace(/\.[^/.]+$/, '') : 'ocr-extracted';
    const blob = new Blob([ocrResult.text], { type: 'text/plain;charset=utf-8' });
    downloadSingleFile(blob, `${baseName}.txt`);
  };

  const handleDownloadDocx = async () => {
    if (!ocrResult?.text) return;
    const baseName = selectedFiles[0]?.name ? selectedFiles[0].name.replace(/\.[^/.]+$/, '') : 'ocr-extracted';
    const blob = await textToWordDocx(ocrResult.text, baseName);
    downloadSingleFile(blob, `${baseName}.docx`);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Upload & Config Area */}
      {!ocrResult && !isProcessing && (
        <div className="space-y-6">
          <FileUploader
            acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.pdf']}
            acceptedMimeTypes={['image/*', 'application/pdf']}
            maxFiles={1}
            maxFileSizeMB={50}
            selectedFiles={selectedFiles}
            onFilesSelected={setSelectedFiles}
            onRemoveFile={() => setSelectedFiles([])}
          />

          {selectedFiles.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-brand-500" />
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {loc.docLangTitle}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {loc.docLangSubtitle}
                  </p>
                </div>
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="eng">English (Latin)</option>
                <option value="ara">العربية (Arabic)</option>
                <option value="urd">اردو (Urdu)</option>
                <option value="hin">हिन्दी (Hindi)</option>
                <option value="spa">Spanish (Español)</option>
                <option value="fra">French (Français)</option>
                <option value="deu">German (Deutsch)</option>
              </select>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={handleStartOcr}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 text-white font-bold text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <ScanText className="w-5 h-5" />
              <span>{loc.extractButton}</span>
            </button>
          )}
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="py-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/40 border-2 border-brand-500 border-t-transparent animate-spin flex items-center justify-center" />
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {loc.extractingTitle}
            </h3>
            <ProgressBar progress={progress} statusText={statusText} />
          </div>
        </div>
      )}

      {/* Result Display */}
      {ocrResult && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                {ocrResult.confidence}%
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {loc.ocrCompleted}
                </h4>
                <p className="text-xs text-slate-500">
                  {loc.confidenceScore(ocrResult.confidence, ocrResult.text.length)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? loc.copied : loc.copyText}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDocx}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <FileText className="w-4 h-4" />
                <span>{loc.exportDocx}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{loc.exportTxt}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={12}
              value={ocrResult.text}
              onChange={(e) => setOcrResult({ ...ocrResult, text: e.target.value })}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setOcrResult(null);
                setSelectedFiles([]);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              {loc.scanAnother}
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
