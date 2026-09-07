'use client';

import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '@/lib/types';
import { Breadcrumbs } from './Breadcrumbs';
import { PrivacyBadge } from './PrivacyBadge';
import { FileUploader } from './FileUploader';
import { ProgressBar } from './ProgressBar';
import { ResultPreview } from './ResultPreview';
import { DownloadSuccessModal } from './DownloadSuccessModal';
import { ToolOptionControls } from './ToolOptionControls';
import { Play, Sparkles, HelpCircle } from 'lucide-react';
import { downloadSingleFile, downloadAsZip, SavedFileInfo } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { AdSlot } from '@/components/ads/AdSlot';

interface ToolLayoutProps {
  tool: ToolDefinition;
  onProcess: (
    files: File[],
    options: Record<string, any>,
    onProgress: (percent: number, statusText: string) => void
  ) => Promise<
    {
      name: string;
      originalSize: number;
      processedSize?: number;
      blob?: Blob;
      dataUrl?: string;
      textResult?: string;
    }[]
  >;
  customWorkspace?: React.ReactNode;
}

const TOOL_LAYOUT_LOCALES = {
  en: {
    startAction: (name: string) => `Start ${name}`,
    initStatus: 'Initializing engine...',
    genericError: 'Your file could not be processed. Please try another file.',
    faqTitle: 'Frequently Asked Questions',
  },
  ur: {
    startAction: (name: string) => `${name} شروع کریں`,
    initStatus: 'انجن تیار کیا جا رہا ہے...',
    genericError: 'آپ کی فائل پروسیس نہیں ہو سکی۔ براہ کرم دوسری فائل آزمائیں۔',
    faqTitle: 'عمومی سوالات اور جوابات',
  },
  ar: {
    startAction: (name: string) => `بدء ${name}`,
    initStatus: 'جاري تهيئة المحرك...',
    genericError: 'تعذرت معالجة الملف. يرجى تجربة ملف آخر.',
    faqTitle: 'الأسئلة الأكثر شيوعاً',
  },
  hi: {
    startAction: (name: string) => `${name} शुरू करें`,
    initStatus: 'इंजन तैयार हो रहा है...',
    genericError: 'आपकी फ़ाइल प्रोसेस नहीं हो सकी। कृपया कोई अन्य फ़ाइल आज़माएं।',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
  },
};

export function ToolLayout({ tool, onProcess, customWorkspace }: ToolLayoutProps) {
  const { t, language, isRTL } = useI18n();
  const { addHistory, addDownload, recordToolUsage } = useUserStore();
  const localized = getLocalizedTool(tool, language);
  const loc = TOOL_LAYOUT_LOCALES[language] || TOOL_LAYOUT_LOCALES.en;
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {
      quality: 0.75,
      level: 'medium',
      outputFormat: 'image/jpeg',
      angle: '90',
      splitMode: 'all',
      orientation: 'portrait',
    };
    tool.options?.forEach((opt) => {
      initial[opt.id] = opt.defaultValue;
    });
    return initial;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadedModalFile, setDownloadedModalFile] = useState<SavedFileInfo | null>(null);
  const [results, setResults] = useState<
    {
      name: string;
      originalSize: number;
      processedSize?: number;
      blob?: Blob;
      dataUrl?: string;
      textResult?: string;
    }[]
    | null
  >(null);

  useEffect(() => {
    setIsMounted(true);

    const handleGlobalDownload = (e: CustomEvent<SavedFileInfo>) => {
      if (e.detail) {
        setDownloadedModalFile(e.detail);
      }
    };

    window.addEventListener('miftah:file-downloaded' as any, handleGlobalDownload as any);
    return () => {
      window.removeEventListener('miftah:file-downloaded' as any, handleGlobalDownload as any);
    };
  }, []);

  const handleStartProcess = async () => {
    if (selectedFiles.length === 0 && tool.maxFiles > 0) return;
    triggerHaptic('medium');
    setIsProcessing(true);
    setProgress(10);
    setProgressStatus(loc.initStatus);
    setErrorMessage(null);

    try {
      const outputFiles = await onProcess(selectedFiles, options, (pct, status) => {
        setProgress(pct);
        setProgressStatus(status);
      });

      setResults(outputFiles);

      // Record real tool usage for Recent Tools
      recordToolUsage(tool.id, localized.name, tool.category, tool.icon);

      // Record in unified user-store
      outputFiles.forEach((out) => {
        addHistory({
          type: 'tool',
          title: `${localized.name}: ${out.name}`,
          url: `/tools/${tool.id}`,
          meta: `Processed: ${out.originalSize ? Math.round(out.originalSize / 1024) + ' KB' : 'Client-Side'}`,
        });
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || loc.genericError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = async (index: number) => {
    if (!results || !results[index]) return;
    const file = results[index];
    if (file.blob) {
      const savedInfo = await downloadSingleFile(file.blob, file.name);
      if (savedInfo) setDownloadedModalFile(savedInfo);
      addDownload({
        name: file.name,
        size: `${Math.round((file.processedSize || file.blob.size) / 1024)} KB`,
        type: tool.outputExtension || 'file',
      });
    } else if (file.textResult) {
      const blob = new Blob([file.textResult], { type: 'text/plain;charset=utf-8' });
      const savedInfo = await downloadSingleFile(blob, file.name);
      if (savedInfo) setDownloadedModalFile(savedInfo);
      addDownload({
        name: file.name,
        size: `${Math.round(blob.size / 1024)} KB`,
        type: 'txt',
      });
    }
  };

  const handleDownloadAllZip = async () => {
    if (!results) return;
    const zipFiles: { name: string; blob: Blob }[] = [];
    results.forEach((r) => {
      if (r.blob) {
        zipFiles.push({ name: r.name, blob: r.blob });
      } else if (r.textResult) {
        zipFiles.push({ name: r.name, blob: new Blob([r.textResult], { type: 'text/plain;charset=utf-8' }) });
      }
    });
    const zipName = `${tool.slug}-result.zip`;
    const savedInfo = await downloadAsZip(zipFiles, zipName);
    if (savedInfo) setDownloadedModalFile(savedInfo);
    addDownload({
      name: zipName,
      size: 'Multi-File ZIP',
      type: 'zip',
    });
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResults(null);
    setProgress(0);
    setErrorMessage(null);
  };

  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="text-center space-y-3">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/60 rounded-lg mx-auto" />
        </div>
        <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300"
    >
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: getLocalizedCategory(tool.category, language).toUpperCase(), href: `/tools?cat=${tool.category}` },
          { label: localized.name },
        ]}
      />

      {/* Tool Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <PrivacyBadge isClientSide={tool.isClientSide} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {localized.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {localized.shortDesc}
        </p>
      </div>

      {/* Main Tool Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-md">
        {/* Custom interactive workspace (for calculators, QR, visual editor) */}
        {customWorkspace ? (
          customWorkspace
        ) : results ? (
          <ResultPreview
            files={results}
            onDownloadSingle={handleDownloadSingle}
            onDownloadAllZip={results.length > 1 ? handleDownloadAllZip : undefined}
            onReset={handleReset}
          />
        ) : isProcessing ? (
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/40 border-2 border-brand-500 border-t-transparent animate-spin flex items-center justify-center" />
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t.processing}
              </h3>
              <ProgressBar progress={progress} statusText={progressStatus} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Upload Zone */}
            {tool.maxFiles > 0 && (
              <FileUploader
                acceptedExtensions={tool.acceptedExtensions}
                acceptedMimeTypes={tool.acceptedMimeTypes}
                maxFiles={tool.maxFiles}
                maxFileSizeMB={tool.maxFileSizeMB}
                selectedFiles={selectedFiles}
                onFilesSelected={setSelectedFiles}
                onRemoveFile={(idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
              />
            )}

            {/* Dynamic & Fine-Grained Tool Options with Sliders & Controls */}
            {selectedFiles.length > 0 && (
              <ToolOptionControls
                tool={tool}
                files={selectedFiles}
                options={options}
                onOptionsChange={setOptions}
              />
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                {errorMessage}
              </div>
            )}

            {/* Action Trigger Button */}
            {(selectedFiles.length > 0 || tool.maxFiles === 0) && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleStartProcess}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-150 flex items-center justify-center gap-2.5 select-none"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{loc.startAction(localized.name)}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global In-App Download Complete Modal */}
      <DownloadSuccessModal
        fileInfo={downloadedModalFile}
        onClose={() => setDownloadedModalFile(null)}
      />

      {/* Responsive Ad Space for Monetization */}
      <AdSlot placement="tool-bottom" />

      {/* FAQ & Information Section */}
      {tool.faq && tool.faq.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
            <HelpCircle className="w-5 h-5 text-brand-500" />
            <span>{loc.faqTitle}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.faq.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {item.question}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

