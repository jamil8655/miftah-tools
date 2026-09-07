'use client';

import React, { useEffect, useState } from 'react';
import {
  Download,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Share2,
  Sparkles,
  Eye,
  FileCheck2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes, formatBytesDual, calculatePercentageSaved } from '@/lib/utils/formatters';
import { useI18n } from '@/lib/i18n/i18n-context';
import { AdSlot } from '@/components/ads/AdSlot';
import { ResultRewardAd } from '@/components/ads/ResultRewardAd';
import { adManager } from '@/lib/ads/AdManager';
import { shareFileNative, isNativeAndroid } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { openDownloadedFile } from '@/lib/utils/download';

interface ResultPreviewProps {
  files: {
    name: string;
    originalSize: number;
    processedSize?: number;
    blob?: Blob;
    dataUrl?: string;
    textResult?: string;
    downloadUrl?: string;
  }[];
  onDownloadSingle: (index: number) => void;
  onDownloadAllZip?: () => void;
  onReset: () => void;
}

const RESULT_LOCALES = {
  en: {
    readyTitle: 'Your File is Ready!',
    reducedBadge: (pct: number, orig: string, proc: string) => `Reduced by ${pct}% (${orig} → ${proc})`,
    optimalBadge: (orig: string, proc: string) => `Optimal Fidelity (${orig} → ${proc})`,
    original: 'Original:',
    final: 'Final:',
    copied: 'Copied!',
    copyText: 'Copy Text',
    view: 'View',
    saving: 'Saving...',
    saved: 'Saved ✓',
    download: 'Download',
    shareFile: 'Share File',
    processAnother: 'Process Another',
    shareApp: 'Share App',
    linkCopied: 'Link Copied!',
    downloadAllZip: 'Download All as ZIP',
  },
  ur: {
    readyTitle: 'آپ کی فائل تیار ہے!',
    reducedBadge: (pct: number, orig: string, proc: string) => `${pct}% سائز کم ہو گیا (${orig} → ${proc})`,
    optimalBadge: (orig: string, proc: string) => `بہترین کوالٹی (${orig} → ${proc})`,
    original: 'اصل سائز:',
    final: 'حتمی سائز:',
    copied: 'کاپی ہو گیا!',
    copyText: 'ٹیکسٹ کاپی کریں',
    view: 'دیکھیں',
    saving: 'محفوظ ہو رہا ہے...',
    saved: 'محفوظ ہو گیا ✓',
    download: 'ڈاؤن لوڈ کریں',
    shareFile: 'فائل شیئر کریں',
    processAnother: 'مزید فائل پروسیس کریں',
    shareApp: 'ایپ شیئر کریں',
    linkCopied: 'لنک کاپی ہو گیا!',
    downloadAllZip: 'تمام بطور ZIP ڈاؤن لوڈ کریں',
  },
  ar: {
    readyTitle: 'ملفك جاهز الآن!',
    reducedBadge: (pct: number, orig: string, proc: string) => `تم تقليل الحجم بنسبة ${pct}% (${orig} ← ${proc})`,
    optimalBadge: (orig: string, proc: string) => `دقة مثالية (${orig} ← ${proc})`,
    original: 'الحجم الأصلي:',
    final: 'الحجم النهائي:',
    copied: 'تم النسخ!',
    copyText: 'نسخ النص',
    view: 'معاينة',
    saving: 'جاري الحفظ...',
    saved: 'تم الحفظ ✓',
    download: 'تنزيل',
    shareFile: 'مشاركة الملف',
    processAnother: 'معالجة ملف آخر',
    shareApp: 'مشاركة التطبيق',
    linkCopied: 'تم نسخ الرابط!',
    downloadAllZip: 'تنزيل الكل كملف ZIP',
  },
  hi: {
    readyTitle: 'आपकी फ़ाइल तैयार है!',
    reducedBadge: (pct: number, orig: string, proc: string) => `${pct}% साइज़ कम हुआ (${orig} → ${proc})`,
    optimalBadge: (orig: string, proc: string) => `उत्कृष्ट क्वालिटी (${orig} → ${proc})`,
    original: 'मूल साइज़:',
    final: 'अंतिम साइज़:',
    copied: 'कॉपी हो गया!',
    copyText: 'टेक्स्ट कॉपी करें',
    view: 'देखें',
    saving: 'सहेजा जा रहा है...',
    saved: 'सहेज लिया गया ✓',
    download: 'डाउनलोड करें',
    shareFile: 'फ़ाइल शेयर करें',
    processAnother: 'अन्य फ़ाइल प्रोसेस करें',
    shareApp: 'ऐप शेयर करें',
    linkCopied: 'लिंक कॉपी हो गया!',
    downloadAllZip: 'सभी ZIP के रूप में डाउनलोड करें',
  },
};

export function ResultPreview({
  files,
  onDownloadSingle,
  onDownloadAllZip,
  onReset,
}: ResultPreviewProps) {
  const { language, isRTL } = useI18n();
  const loc = RESULT_LOCALES[language] || RESULT_LOCALES.en;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [shared, setShared] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [downloadedIndices, setDownloadedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleCopyText = (text: string, index: number) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadWithFeedback = async (index: number) => {
    setDownloadingIndex(index);
    triggerHaptic('medium');
    try {
      await onDownloadSingle(index);
      setDownloadedIndices((prev) => new Set(prev).add(index));
      // Show non-disruptive interstitial after task completion
      adManager.showInterstitial();
    } finally {
      setTimeout(() => setDownloadingIndex(null), 400);
    }
  };

  const handlePreviewOpen = async (file: ResultPreviewProps['files'][0]) => {
    triggerHaptic('light');
    await openDownloadedFile({
      name: file.name,
      blob: file.blob,
      mimeType: file.blob?.type,
    });
  };

  const handleShare = async (file?: ResultPreviewProps['files'][0]) => {
    if (isNativeAndroid() && file?.name) {
      await shareFileNative(
        file.name,
        `Check out my processed file: ${file.name}`,
        typeof window !== 'undefined' ? window.location.href : undefined
      );
      return;
    }

    if (typeof window !== 'undefined') {
      const shareData = {
        title: 'Miftah Tools',
        text: 'Processed my files with Miftah Tools - Fast, private and free!',
        url: window.location.href,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (e) {
          // ignore share cancel
        }
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    }
  };

  const totalOriginal = files.reduce((acc, f) => acc + (f.originalSize || 0), 0);
  const totalProcessed = files.reduce((acc, f) => acc + (f.processedSize || f.blob?.size || 0), 0);
  const totalSavedPercent = calculatePercentageSaved(totalOriginal, totalProcessed);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Reward Ad Perk */}
      <ResultRewardAd />

      {/* Success Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl text-center space-y-2.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
          {loc.readyTitle}
        </h3>
        {totalSavedPercent > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {loc.reducedBadge(totalSavedPercent, formatBytesDual(totalOriginal), formatBytesDual(totalProcessed))}
            </span>
          </div>
        ) : totalOriginal > 0 && totalProcessed > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium font-mono">
            <span>
              {loc.optimalBadge(formatBytesDual(totalOriginal), formatBytesDual(totalProcessed))}
            </span>
          </div>
        ) : null}
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.map((file, idx) => {
          const processedBytes = file.processedSize || file.blob?.size;
          const isImage = file.dataUrl || (file.blob && file.blob.type.startsWith('image/'));
          const isDownloaded = downloadedIndices.has(idx);
          const isCurrentDownloading = downloadingIndex === idx;

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {file.originalSize > 0 && (
                      <span>{loc.original} <strong className="text-slate-700 dark:text-slate-300">{formatBytesDual(file.originalSize)}</strong></span>
                    )}
                    {processedBytes !== undefined && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {loc.final} {formatBytesDual(processedBytes)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {file.textResult && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(file.textResult!, idx)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 active:scale-95"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{loc.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{loc.copyText}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Quick In-App Preview / Open */}
                  {file.blob && (
                    <button
                      type="button"
                      onClick={() => handlePreviewOpen(file)}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
                      title={loc.view}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{loc.view}</span>
                    </button>
                  )}

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={() => handleDownloadWithFeedback(idx)}
                    disabled={isCurrentDownloading}
                    className={`px-4 py-2.5 rounded-xl active:scale-95 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 transition-all ${
                      isDownloaded
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                        : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/25'
                    }`}
                  >
                    {isCurrentDownloading ? (
                      <span className="inline-flex items-center gap-1">{loc.saving}</span>
                    ) : isDownloaded ? (
                      <>
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{loc.saved}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{loc.download}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(file)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-95"
                    title={loc.shareFile}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Result Preview */}
              {file.textResult && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {file.textResult}
                </div>
              )}

              {/* Image Preview */}
              {isImage && file.dataUrl && (
                <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 max-h-60">
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="max-h-56 w-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result Page Ad Placement */}
      <AdSlot placement="result-page" />

      {/* Global Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{loc.processAnother}</span>
          </button>

          <button
            type="button"
            onClick={() => handleShare()}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{loc.linkCopied}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{loc.shareApp}</span>
              </>
            )}
          </button>
        </div>

        {files.length > 1 && onDownloadAllZip && (
          <button
            type="button"
            onClick={onDownloadAllZip}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 inline-flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{loc.downloadAllZip}</span>
          </button>
        )}
      </div>
    </div>
  );
}

