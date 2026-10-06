'use client';

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Download,
  Video,
  Music,
  Image as ImageIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  User,
  ShieldCheck,
  Check,
  Copy,
  Share2,
  CheckCircle,
} from 'lucide-react';
import {
  MediaMetadata,
  MediaDownloadFormat,
  fetchMediaMetadata,
  detectPlatform,
  downloadInSiteMedia,
  triggerDirectUrlDownload,
} from '@/lib/media/media-downloader';
import { downloadSingleFile } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

const MEDIA_LOCALES = {
  en: {
    badge: 'Social Media Downloader',
    title: 'Social Video & Audio Downloader',
    subtitle: 'Download videos, reels, shorts, and MP3 music directly from YouTube, Instagram, Facebook, TikTok, and X.',
    placeholder: 'Paste YouTube, Instagram, TikTok, Facebook, or X link here...',
    btnPaste: 'Paste',
    btnFetch: 'Fetch Media',
    btnFetching: 'Scanning...',
    tabVideo: 'Video (MP4)',
    tabAudio: 'Audio (MP3)',
    tabImage: 'Cover Image',
    btnDownload: 'Download',
    btnSaving: 'Saving...',
    downloadSuccess: 'Download Complete! Saved directly to your device.',
    openFile: 'Open File',
    shareFile: 'Share',
    downloadAgain: 'Download Again',
    features: [
      { title: '100% Free & Direct', desc: 'Saves directly to your device without external redirects' },
      { title: 'No Watermark HD', desc: 'Clean TikTok and Instagram Reels in crystal-clear quality' },
      { title: '320kbps MP3 Audio', desc: 'Extract high-fidelity audio and music tracks instantly' },
      { title: '5+ Supported Platforms', desc: 'YouTube, Instagram, Facebook, TikTok, and X' },
    ],
  },
  ur: {
    badge: 'سوشل میڈیا ویڈیو ڈاؤنلوڈر',
    title: 'سوشل میڈیا ویڈیو اور آڈیو ڈاؤنلوڈر',
    subtitle: 'یوٹیوب، انسٹاگرام، فیس بک، ٹک ٹاک اور ایکس (ٹوئٹر) سے ریلز، شارٹس اور ایم پی تھری آڈیو ڈاؤنلوڈ کریں۔',
    placeholder: 'یوٹیوب، انسٹاگرام، فیس بک یا ٹک ٹاک کا لنک یہاں پیسٹ کریں...',
    btnPaste: 'پیسٹ کریں',
    btnFetch: 'ویڈیو حاصل کریں',
    btnFetching: 'تلاش جاری ہے...',
    tabVideo: 'ویڈیو (MP4)',
    tabAudio: 'آڈیو (MP3)',
    tabImage: 'کور تصویر',
    btnDownload: 'ڈاؤنلوڈ کریں',
    btnSaving: 'محفوظ ہو رہا ہے...',
    downloadSuccess: 'ڈاؤنلوڈ مکمل! فائل کامیابی سے موبائل میں محفوظ ہو گئی۔',
    openFile: 'فائل کھولیں',
    shareFile: 'شیئر کریں',
    downloadAgain: 'دوبارہ ڈاؤنلوڈ',
    features: [
      { title: '100% مفت اور ڈائریکٹ', desc: 'بغیر کسی اشتہاری ویب سائٹ پر بھیجے براہِ راست موبائل میں محفوظ کریں' },
      { title: 'بغیر واٹر مارک ایچ ڈی', desc: 'ٹک ٹاک اور انسٹاگرام ریلز بالکل صاف ایچ ڈی کوالٹی میں' },
      { title: '320kbps MP3 آڈیو', desc: 'ویڈیو سے بہترین کوالٹی کی آڈیو فائل حاصل کریں' },
      { title: '5 بڑے پلیٹ فارمز', desc: 'یوٹیوب، انسٹاگرام، فیس بک، ٹک ٹاک، اور ایکس' },
    ],
  },
  ar: {
    badge: 'برنامج تنزيل وسائط التواصل الاجتماعي',
    title: 'تنزيل مقاطع الفيديو والصوتيات',
    subtitle: 'تنزيل الفيديوهات والريلز والشورتس ومقاطع MP3 مباشرة من يوتيوب، إنستغرام، فيسبوك، تيك توك وX.',
    placeholder: 'الصق رابط يوتيوب، إنستغرام، فيسبوك، تيك توك أو X هنا...',
    btnPaste: 'لصق',
    btnFetch: 'استخراج الوسائط',
    btnFetching: 'جاري البحث...',
    tabVideo: 'فيديو (MP4)',
    tabAudio: 'صوت (MP3)',
    tabImage: 'غلاف الفيديو',
    btnDownload: 'تنزيل',
    btnSaving: 'جاري الحفظ...',
    downloadSuccess: 'اكتمل التنزيل! تم حفظ الملف في جهازك بنجاح.',
    openFile: 'فتح الملف',
    shareFile: 'مشاركة',
    downloadAgain: 'تنزيل مجدداً',
    features: [
      { title: 'تنزيل مباشر ومجاني 100%', desc: 'حفظ الملفات في جهازك مباشرة دون روابط مزعجة' },
      { title: 'دون علامة مائية HD', desc: 'فيديوهات تيك توك وإنستغرام ريلز عالية الدقة' },
      { title: 'صوتيات MP3 عالية الجودة', desc: 'استخراج الصوت بوضوح فائق 320kbps' },
      { title: '5 منصات مدعومة', desc: 'يوتيوب، إنستغرام، فيسبوك، تيك توك، وX' },
    ],
  },
  hi: {
    badge: 'सोशल मीडिया वीडियो डाउनलोडर',
    title: 'सोशल मीडिया वीडियो व ऑडियो डाउनलोडर',
    subtitle: 'यूट्यूब, इंस्टाग्राम, फेसबुक, टिकटॉक और X से वीडियो, रील्स और MP3 ऑडियो सीधे डाउनलोड करें।',
    placeholder: 'यूट्यूब, इंस्टाग्राम, फेसबुक या टिकटॉक का लिंक यहां पेस्ट करें...',
    btnPaste: 'पेस्ट करें',
    btnFetch: 'वीडियो लाएं',
    btnFetching: 'स्कैन कर रहे हैं...',
    tabVideo: 'वीडियो (MP4)',
    tabAudio: 'ऑडियो (MP3)',
    tabImage: 'कवर फोटो',
    btnDownload: 'डाउनलोड करें',
    btnSaving: 'सुरक्षित हो रहा है...',
    downloadSuccess: 'डाउनलोड पूरा हुआ! फ़ाइल सीधे आपके डिवाइस में सुरक्षित हो गई।',
    openFile: 'फ़ाइल खोलें',
    shareFile: 'शेयर करें',
    downloadAgain: 'पुनः डाउनलोड करें',
    features: [
      { title: '100% मुफ़्त व सीधा डाउनलोड', desc: 'बिना किसी रीडायरेक्ट के सीधे अपने डिवाइस में सुरक्षित करें' },
      { title: 'बिना वॉटरमार्क HD', desc: 'टिकटॉक और इंस्टाग्राम रील्स बिल्कुल स्पष्ट क्वालिटी में' },
      { title: '320kbps MP3 ऑडियो', desc: 'क्रिस्टल क्लियर ऑडियो व म्यूज़िक ट्रैक्स निकालें' },
      { title: '5 प्रमुख प्लेटफ़ॉर्म्स', desc: 'यूट्यूब, इंस्टाग्राम, फेसबुक, टिकटॉक और X' },
    ],
  },
};

export function MediaDownloaderStudio() {
  const { language } = useI18n();
  const loc = MEDIA_LOCALES[language as keyof typeof MEDIA_LOCALES] || MEDIA_LOCALES.ur;

  const [isMounted, setIsMounted] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'image'>('video');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatusText, setDownloadStatusText] = useState('');
  const [copiedTitle, setCopiedTitle] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time Platform Detection as user types or pastes
  useEffect(() => {
    if (!urlInput.trim()) {
      setDetectedPlatform(null);
      return;
    }
    const detected = detectPlatform(urlInput);
    if (detected && detected.platform !== 'generic') {
      setDetectedPlatform(detected.platform);
    } else {
      setDetectedPlatform(null);
    }
  }, [urlInput]);

  const handlePaste = async () => {
    triggerHaptic('light');
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text.trim());
          const detected = detectPlatform(text);
          setDetectedPlatform(detected && detected.platform !== 'generic' ? detected.platform : null);
          handleAnalyze(text.trim());
        }
      }
    } catch (_) {}
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || urlInput;
    if (!targetUrl.trim()) {
      setError(language === 'ur' ? 'براہ کرم یوٹیوب، انسٹاگرام، فیس بک یا ٹک ٹاک کا درست لنک درج کریں۔' : 'Please enter or paste a valid link from YouTube, Instagram, Facebook, TikTok, or X.');
      return;
    }

    triggerHaptic('medium');
    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const data = await fetchMediaMetadata(targetUrl);
      setMetadata(data);
      triggerHaptic('success');
    } catch (err: any) {
      setError(err.message || (language === 'ur' ? 'ویڈیو حاصل کرنے میں مسئلہ آیا۔ براہ کرم لنک چیک کر کے دوبارہ کوشش کریں۔' : 'Failed to fetch video streams. Please check the URL and try again.'));
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const [downloadSuccessFile, setDownloadSuccessFile] = useState<{
    fileName: string;
    blob?: Blob | null;
    directUrl?: string;
    format: MediaDownloadFormat;
  } | null>(null);

  const handleDownload = async (format: MediaDownloadFormat) => {
    if (!metadata) return;
    triggerHaptic('medium');
    setDownloadingId(format.id);
    setDownloadProgress(20);
    setDownloadStatusText(loc.btnSaving);
    setError(null);
    setDownloadSuccessFile(null);

    try {
      const result = await downloadInSiteMedia(
        metadata,
        format,
        (pct, status) => {
          setDownloadProgress(pct);
          setDownloadStatusText(status);
        }
      );

      if (result.blob && result.blob.size > 1000) {
        await downloadSingleFile(result.blob, result.fileName);
        setDownloadSuccessFile({
          fileName: result.fileName,
          blob: result.blob,
          format,
        });
        triggerHaptic('success');
      } else if (result.directUrl) {
        triggerDirectUrlDownload(
          result.directUrl,
          result.fileName,
          format.type === 'audio' ? 'audio/mpeg' : 'video/mp4'
        );
        setDownloadSuccessFile({
          fileName: result.fileName,
          directUrl: result.directUrl,
          format,
        });
        triggerHaptic('success');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to download media stream directly.');
      triggerHaptic('error');
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
        setDownloadProgress(0);
        setDownloadStatusText('');
      }, 500);
    }
  };

  const handleOpenDownloaded = async () => {
    if (downloadSuccessFile) {
      if (downloadSuccessFile.blob) {
        const { openDownloadedFile } = await import('@/lib/utils/download');
        openDownloadedFile({
          name: downloadSuccessFile.fileName,
          blob: downloadSuccessFile.blob,
          mimeType: downloadSuccessFile.blob.type,
        });
      } else if (downloadSuccessFile.directUrl) {
        window.open(downloadSuccessFile.directUrl, '_blank');
      }
    }
  };

  const handleShareDownloaded = async () => {
    if (downloadSuccessFile) {
      if (downloadSuccessFile.blob) {
        const { shareDownloadedFile } = await import('@/lib/utils/download');
        shareDownloadedFile({
          name: downloadSuccessFile.fileName,
          blob: downloadSuccessFile.blob,
          mimeType: downloadSuccessFile.blob.type,
        });
      } else if (downloadSuccessFile.directUrl && navigator.share) {
        try {
          await navigator.share({
            title: downloadSuccessFile.fileName,
            url: downloadSuccessFile.directUrl,
          });
        } catch (_) {}
      }
    }
  };

  const handleCopyTitle = () => {
    if (metadata?.title) {
      navigator.clipboard?.writeText(metadata.title);
      setCopiedTitle(true);
      triggerHaptic('light');
      setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  // 5 Clean Supported Platforms
  const platforms = [
    { id: 'youtube', name: 'YouTube', badge: 'Shorts & 4K', icon: '▶️', activeBg: 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400' },
    { id: 'instagram', name: 'Instagram', badge: 'Reels & Stories', icon: '📸', activeBg: 'bg-pink-500/10 border-pink-500/40 text-pink-600 dark:text-pink-400' },
    { id: 'facebook', name: 'Facebook', badge: 'Watch & Reels', icon: '👥', activeBg: 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400' },
    { id: 'tiktok', name: 'TikTok', badge: 'No Watermark', icon: '🎵', activeBg: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400' },
    { id: 'twitter', name: 'X (Twitter)', badge: 'Clips & GIFs', icon: '🐦', activeBg: 'bg-slate-500/10 border-slate-500/40 text-slate-800 dark:text-slate-200' },
  ];

  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 text-white shadow-xl text-center space-y-2">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span>{loc.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {loc.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {loc.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Platform Badges */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {platforms.map((p) => {
          const isDetected = detectedPlatform === p.id;
          return (
            <div
              key={p.id}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 select-none ${
                isDetected
                  ? `${p.activeBg} border-2 scale-105 shadow-md`
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <span className="text-lg sm:text-xl">{p.icon}</span>
              <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate max-w-full">{p.name}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Main Input Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-4">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder={loc.placeholder}
              className="w-full pl-10 pr-20 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{loc.btnPaste}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isLoading || !urlInput.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{loc.btnFetching}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>{loc.btnFetch}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. Metadata & Formats Studio */}
      {metadata && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-500/30 dark:border-brand-500/40 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Thumbnail Preview */}
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-800">
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';
                }}
              />
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-black uppercase">
                {metadata.platformName}
              </div>
              {metadata.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[10px] font-mono font-bold">
                  {metadata.duration}
                </div>
              )}
            </div>

            {/* Video Info & Format Tabs */}
            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {metadata.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <User className="w-3.5 h-3.5" />
                    <span>{metadata.author}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTitle}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                  >
                    {copiedTitle ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTitle ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Segmented Format Tabs */}
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                {[
                  { id: 'video', label: loc.tabVideo, icon: Video },
                  { id: 'audio', label: loc.tabAudio, icon: Music },
                  { id: 'image', label: loc.tabImage, icon: ImageIcon },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab(t.id as any);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Download Options Format List */}
          <div className="space-y-2.5 pt-1">
            {metadata.formats
              .filter((f) => f.type === activeTab)
              .map((format) => {
                const isDownloading = downloadingId === format.id;
                return (
                  <div
                    key={format.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-brand-500/40 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {format.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 uppercase">
                          {format.quality}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                        {format.extension.toUpperCase()} • {format.resolution} • {format.sizeEstimate}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={!!downloadingId}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{downloadStatusText || loc.btnSaving}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{loc.btnDownload}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Download Progress Bar */}
          {downloadingId && (
            <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-1.5 animate-in fade-in">
              <div className="flex justify-between text-xs font-black text-brand-700 dark:text-brand-300">
                <span>{downloadStatusText}</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-200 dark:bg-brand-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Downloaded Card */}
          {downloadSuccessFile && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loc.downloadSuccess}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate">
                {downloadSuccessFile.fileName}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenDownloaded}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>{loc.openFile}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareDownloaded}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{loc.shareFile}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Clean Feature Badges (Compact & Neat) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {loc.features.map((feat, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600 mx-auto" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{feat.title}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
