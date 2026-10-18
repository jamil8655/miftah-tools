'use client';

import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '@/lib/types';
import { Breadcrumbs } from './Breadcrumbs';
import { FileUploader } from './FileUploader';
import { ProgressBar } from './ProgressBar';
import { ResultPreview } from './ResultPreview';
import { DownloadSuccessModal } from './DownloadSuccessModal';
import { ToolOptionControls } from './ToolOptionControls';
import { AddToHomeButton } from './AddToHomeButton';
import { FavoriteButton } from './FavoriteButton';
import { ToolActionHeader } from './ToolActionHeader';
import { Play, Sparkles, HelpCircle } from 'lucide-react';
import { downloadSingleFile, downloadAsZip, SavedFileInfo } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { AdSlot } from '@/components/ads/AdSlot';
import { adManager } from '@/lib/ads/AdManager';
import { ToolSeoContent } from '@/components/shared/ToolSeoContent';
import { LiveRatingStudio } from '@/components/ratings/LiveRatingStudio';
import { useIsNativeApp } from '@/lib/native/android-bridge';

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
  const isNative = useIsNativeApp();
  const { t, language, isRTL } = useI18n();
  const { addHistory, addDownload, recordToolUsage } = useUserStore();
  const localized = getLocalizedTool(tool, language);
  const loc = TOOL_LAYOUT_LOCALES[language] || TOOL_LAYOUT_LOCALES.en;
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, any>>(() => {
    let defaultTargetKb = 100;
    const slugMatch = (tool.slug + ' ' + tool.id).match(/(\d+)\s*kb/i);
    const slugMatchMb = (tool.slug + ' ' + tool.id).match(/(\d+)\s*mb/i);
    if (slugMatch) {
      defaultTargetKb = parseInt(slugMatch[1]);
    } else if (slugMatchMb) {
      defaultTargetKb = parseInt(slugMatchMb[1]) * 1024;
    } else if (tool.id === 'pdf-extreme-compress') {
      defaultTargetKb = 200;
    }

    const initial: Record<string, any> = {
      quality: 0.75,
      level: 'medium',
      outputFormat: 'image/jpeg',
      angle: '90',
      splitMode: 'all',
      orientation: 'portrait',
      targetKb: defaultTargetKb,
      targetSizeLimit: `${defaultTargetKb}kb`,
      customNumValue: defaultTargetKb.toString(),
      customNumUnit: 'kb',
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

    try {
      recordToolUsage(tool.id, localized.name, tool.category, tool.icon);
    } catch (_) {}

    const handleGlobalDownload = (e: CustomEvent<SavedFileInfo>) => {
      if (e.detail) {
        setDownloadedModalFile(e.detail);
      }
    };

    window.addEventListener('miftah:file-downloaded' as any, handleGlobalDownload as any);
    return () => {
      window.removeEventListener('miftah:file-downloaded' as any, handleGlobalDownload as any);
    };
  }, [tool.id]);

  const handleStartProcess = async () => {
    if (selectedFiles.length === 0 && tool.maxFiles > 0) return;
    triggerHaptic('medium');
    setIsProcessing(true);
    adManager.setProcessingState(true);
    setProgress(10);
    setProgressStatus(loc.initStatus);
    setErrorMessage(null);
    setResults(null); // Clear previous results to prevent downloading old files on failure

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
      adManager.setProcessingState(false);
    }
  };

  const handleDownloadSingle = async (index: number) => {
    if (!results || !results[index]) return;
    const file = results[index];
    await adManager.showInterstitialOnDownload(async () => {
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
    });
  };

  const handleDownloadAllZip = async () => {
    if (!results) return;
    await adManager.showInterstitialOnDownload(async () => {
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
    });
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResults(null);
    setProgress(0);
    setErrorMessage(null);
  };

  return (
    <div
      dir={isMounted && isRTL ? 'rtl' : 'ltr'}
      className={`max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 sm:space-y-5 animate-in fade-in duration-200 ${
        isNative ? 'pb-28' : 'pb-20'
      }`}
    >
      {/* Breadcrumbs with 1-Click Add to Home Page Action */}
      <Breadcrumbs
        items={[
          { label: getLocalizedCategory(tool.category, language).toUpperCase(), href: `/tools?cat=${tool.category}` },
          { label: localized.name },
        ]}
        rightAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FavoriteButton toolId={tool.id} />
            <AddToHomeButton
              toolId={tool.id}
              toolName={localized.name}
              category={tool.category}
              icon={tool.icon}
              variant="pill"
            />
          </div>
        }
      />

      {/* Compact Tool Header with Title, Short Description, and Add to Home Shortcut */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {localized.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          {localized.shortDesc}
        </p>
        <ToolActionHeader
          toolId={tool.id}
          toolName={localized.name}
          category={tool.category}
          icon={tool.icon}
          slug={tool.slug}
        />
      </div>

      {/* Main Tool Card Container */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl shadow-slate-900/5 dark:shadow-none overflow-hidden transition-all">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600" />

        <div className="p-5 sm:p-8">
          {/* Custom interactive workspace (for calculators, QR, visual editor, OCR, image studio) */}
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
            <div className="py-14 text-center space-y-6 animate-in fade-in duration-200">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-950/60" />
                <div className="w-20 h-20 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="space-y-2.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.processing || 'Processing Your File...'}
                </h3>
                <ProgressBar progress={progress} statusText={progressStatus} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: File Upload Zone */}
              {tool.maxFiles > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                        1
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        {language === 'ur'
                          ? 'فائل منتخب کریں'
                          : language === 'ar'
                          ? 'اختر الملف'
                          : language === 'hi'
                          ? 'फ़ाइल चुनें'
                          : 'Select File(s)'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {tool.acceptedExtensions.slice(0, 4).join(', ')}
                    </span>
                  </div>

                  <FileUploader
                    acceptedExtensions={tool.acceptedExtensions}
                    acceptedMimeTypes={tool.acceptedMimeTypes}
                    maxFiles={tool.maxFiles}
                    maxFileSizeMB={tool.maxFileSizeMB}
                    selectedFiles={selectedFiles}
                    onFilesSelected={setSelectedFiles}
                    onRemoveFile={(idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  />
                </div>
              )}

              {/* Step 2: Dynamic & Fine-Grained Tool Options */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      {language === 'ur'
                        ? 'اختیارات اور سیٹنگز'
                        : language === 'ar'
                        ? 'الخيارات والإعدادات'
                        : language === 'hi'
                        ? 'विकल्प व सेटिंग्स'
                        : 'Custom Options & Settings'}
                    </h3>
                  </div>

                  <ToolOptionControls
                    tool={tool}
                    files={selectedFiles}
                    options={options}
                    onOptionsChange={setOptions}
                  />
                </div>
              )}

              {/* In-Tool In-Feed Ad Placement (Positioned above action button) */}
              <AdSlot placement="in-feed" />

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-xs">
                  <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Step 3: Action Trigger Button */}
              {(selectedFiles.length > 0 || tool.maxFiles === 0) && (
                <div className="pt-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleStartProcess}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 transition-all duration-150 flex items-center justify-center gap-3 select-none tracking-wide min-h-[52px]"
                  >
                    <Play className="w-5 h-5 fill-current shrink-0" />
                    <span>{loc.startAction(localized.name)}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global In-App Download Complete Modal */}
      <DownloadSuccessModal
        fileInfo={downloadedModalFile}
        onClose={() => setDownloadedModalFile(null)}
      />

      {/* Responsive Ad Space for Monetization */}
      <AdSlot placement="tool-bottom" />

      {/* Live User Ratings & Feedback for this Tool (Web only — hidden in native Android app) */}
      {!isNative && (
        <div className="pt-4">
          <LiveRatingStudio
            initialToolName={localized.name}
            initialToolSlug={tool.slug}
          />
        </div>
      )}

      {/* Comprehensive SEO Content, How-To Guide, Specifications, FAQs & Related Tools (Web only — hidden in native Android app) */}
      {!isNative && <ToolSeoContent tool={tool} />}
    </div>
  );
}

