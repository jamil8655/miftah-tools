'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Download, Video, Music, Image as ImageIcon, Zap, CheckCircle2, AlertCircle, Play, RefreshCw, Clock, User, ShieldCheck, Check, Copy, Layers, Settings2, ExternalLink, Share2, ArrowRight, Sliders, CheckCircle } from 'lucide-react';
import {
  MediaMetadata,
  MediaDownloadFormat,
  fetchMediaMetadata,
  detectPlatform,
  downloadInSiteMedia,
  triggerDirectUrlDownload,
  getCustomRapidApiKey,
  setCustomRapidApiKey,
} from '@/lib/media/media-downloader';
import { downloadSingleFile } from '@/lib/utils/download';

export function MediaDownloaderStudio() {
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

  // API Cluster & Custom Key Modal
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const existingKey = getCustomRapidApiKey();
    if (existingKey) {
      setCustomKeyInput(existingKey);
    }
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
    } catch (e) {
      // safe fallback
    }
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || urlInput;
    if (!targetUrl.trim()) {
      setError('Please enter or paste a valid link from YouTube, Instagram, Facebook, TikTok, or X.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const data = await fetchMediaMetadata(targetUrl);
      setMetadata(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video streams. Please check the URL and try again.');
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
    setDownloadingId(format.id);
    setDownloadProgress(15);
    setDownloadStatusText('Connecting to in-app stream engine...');
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
        // Direct local device saving (on Android: saves directly to Public Downloads folder; on Web: saves direct blob)
        await downloadSingleFile(result.blob, result.fileName);
        setDownloadSuccessFile({
          fileName: result.fileName,
          blob: result.blob,
          format,
        });
      } else if (result.directUrl) {
        // Direct Stream URL Trigger (Android native DownloadManager / direct browser trigger)
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
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to download media stream directly. Please verify the URL.');
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
        } catch (e) {
          // User closed share dialog
        }
      }
    }
  };

  const handleCopyTitle = () => {
    if (metadata?.title) {
      navigator.clipboard?.writeText(metadata.title);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  const handleSaveCustomKey = () => {
    setCustomRapidApiKey(customKeyInput);
    setSavedKeyMsg(true);
    setTimeout(() => {
      setSavedKeyMsg(false);
      setShowApiSettings(false);
    }, 1500);
  };

  // 5 Premium Supported Platforms (No WhatsApp)
  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      badge: 'Shorts & 4K',
      icon: '▶️',
      color: 'text-red-600 dark:text-red-400',
      activeBg: 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 shadow-red-500/10',
      sample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      badge: 'Reels & Stories',
      icon: '📸',
      color: 'text-pink-600 dark:text-pink-400',
      activeBg: 'bg-pink-500/10 border-pink-500/40 text-pink-600 dark:text-pink-400 shadow-pink-500/10',
      sample: 'https://www.instagram.com/reel/C-sample123/',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: 'Watch & Reels',
      icon: '👥',
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-blue-500/10',
      sample: 'https://www.facebook.com/watch/?v=123456789',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      badge: 'No Watermark HD',
      icon: '🎵',
      color: 'text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-cyan-500/10',
      sample: 'https://www.tiktok.com/@creator/video/1234567890',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      badge: 'Clips & GIFs',
      icon: '🐦',
      color: 'text-slate-800 dark:text-slate-200',
      activeBg: 'bg-slate-500/10 border-slate-500/40 text-slate-800 dark:text-slate-200 shadow-slate-500/10',
      sample: 'https://x.com/username/status/1234567890',
    },
  ];

  if (!isMounted) {
    return (
      <div className="max-w-5xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto" />
        <div className="h-14 w-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-red-500/10 via-pink-500/10 to-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Direct In-App Downloader • 100% Free & Direct Device Saving</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Social Media Video & Audio Downloader
        </h1>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Paste any link from YouTube, Instagram, Facebook, TikTok, or X. Directly downloads high-definition videos and crystal-clear audio straight into your device with zero redirects.
        </p>
      </div>

      {/* 2. 5 Supported Platform Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {platforms.map((p) => {
          const isDetected = detectedPlatform === p.id;
          return (
            <div
              key={p.id}
              onClick={() => {
                if (!urlInput) {
                  setUrlInput(p.sample);
                  setDetectedPlatform(p.id);
                }
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                isDetected
                  ? `${p.activeBg} border-2 scale-105 shadow-md`
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="text-xl sm:text-2xl">{p.icon}</div>
              <span className="text-xs font-black text-slate-900 dark:text-white">{p.name}</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{p.badge}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Main Input Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 space-y-4">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Paste YouTube, Instagram, Facebook, TikTok, or X link here..."
              className="w-full pl-11 pr-24 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isLoading || !urlInput.trim()}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Streams...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Fetch Video</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Detection Badge & Cluster Settings Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            {detectedPlatform ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Detected: {platforms.find((p) => p.id === detectedPlatform)?.name || 'Social Media Link'}</span>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
                💡 Tip: Copy any share link directly from the app or browser URL bar.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-[11px] transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Engine & Key Settings</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. Advanced API Cluster & Key Settings (Collapsible) */}
      {showApiSettings && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Multi-Engine Cluster & Dedicated Key Settings
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowApiSettings(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Miftah Tools operates 5+ redundant failover clusters for YouTube, Instagram, Facebook, TikTok, and X. Optional custom RapidAPI key can be added below for priority bandwidth.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">🟢 Engine 1: RapidAPI Multi-Key Pool</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Automatic failover rotation with 3+ pre-configured keys.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">🟢 Engine 2: Cobalt Global Cluster</span>
              <p className="text-[11px] text-slate-500 mt-0.5">6+ global cloud nodes for YouTube, TikTok, Reels & Twitter.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">🟢 Engine 3: TikWM Public Cloud</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Ultra-fast watermark-free TikTok MP4 videos and audio.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">🟢 Engine 4: Direct In-App Blob Downloader</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Zero external redirects, direct saving to device Downloads.</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom RapidAPI Key (Optional):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Enter personal RapidAPI Key..."
                className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveCustomKey}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                {savedKeyMsg ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Metadata & Download Result Studio */}
      {metadata && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-500/30 dark:border-brand-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Thumbnail Preview */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-800 group">
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';
                }}
              />
              <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span>{metadata.platformName}</span>
              </div>
              {metadata.duration && (
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold">
                  {metadata.duration}
                </div>
              )}
            </div>

            {/* Video Info & Quality Tab Selector */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Streams Verified & Ready to Save Directly</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {metadata.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-bold">
                    <User className="w-3.5 h-3.5" />
                    <span>{metadata.author}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTitle}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                  >
                    {copiedTitle ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTitle ? 'Copied!' : 'Copy Title'}</span>
                  </button>
                </div>
              </div>

              {/* Segmented Format Tabs */}
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                {[
                  { id: 'video', label: 'Video (MP4)', icon: Video },
                  { id: 'audio', label: 'Audio (MP3)', icon: Music },
                  { id: 'image', label: 'Cover Image', icon: ImageIcon },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md font-black'
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
          <div className="space-y-3 pt-2">
            {metadata.formats
              .filter((f) => f.type === activeTab)
              .map((format) => {
                const isDownloading = downloadingId === format.id;
                return (
                  <div
                    key={format.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-500/50 hover:shadow-md transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {format.label}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 uppercase">
                          {format.quality}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Format: <span className="font-bold text-slate-700 dark:text-slate-300">{format.extension.toUpperCase()}</span> • Resolution: {format.resolution} • Estimated Size: {format.sizeEstimate}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={!!downloadingId}
                      className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{downloadStatusText || 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download {format.extension.toUpperCase()}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Download Progress Bar */}
          {downloadingId && (
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-black text-brand-700 dark:text-brand-300">
                <span>{downloadStatusText}</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-brand-200 dark:bg-brand-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Downloaded Card */}
          {downloadSuccessFile && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Download Triggered! Saved directly to your device Downloads folder.</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono break-all">
                {downloadSuccessFile.fileName}
                {downloadSuccessFile.blob
                  ? ` (${(downloadSuccessFile.blob.size / (1024 * 1024)).toFixed(2)} MB)`
                  : downloadSuccessFile.format?.sizeEstimate
                  ? ` (${downloadSuccessFile.format.sizeEstimate})`
                  : ''}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleOpenDownloaded}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Open File</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareDownloaded}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                {downloadSuccessFile.directUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (downloadSuccessFile.directUrl) {
                        triggerDirectUrlDownload(
                          downloadSuccessFile.directUrl,
                          downloadSuccessFile.fileName,
                          downloadSuccessFile.format.type === 'audio' ? 'audio/mpeg' : 'video/mp4'
                        );
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. 3-Step "How to Download" Visual Cards */}
      <div className="space-y-4 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            How to Download Social Media Videos in 3 Simple Steps
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No software installation or account sign-up needed. Works directly in any browser and the Android app with zero redirects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">1. Copy Share URL</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Open YouTube, Instagram, Facebook, TikTok, or X and copy the video or post link to your clipboard.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">2. Paste & Scan Streams</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste the link in the search bar above. The multi-cluster engine instantly analyzes available video and audio streams.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">3. Direct Device Saving</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Select 1080p, 720p, or 320kbps MP3 and tap Download. Saved directly to your device with zero redirects.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Key Features Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
          <h4 className="text-xs font-black text-slate-900 dark:text-white">100% Private & Direct</h4>
          <p className="text-[10px] text-slate-500">Zero redirects & safe client downloads</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <Zap className="w-5 h-5 text-amber-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900 dark:text-white">No Watermark</h4>
          <p className="text-[10px] text-slate-500">Clean TikTok & Reels media</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <Music className="w-5 h-5 text-purple-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900 dark:text-white">320kbps MP3</h4>
          <p className="text-[10px] text-slate-500">Extract crystal-clear music tracks</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <Zap className="w-5 h-5 text-brand-600 mx-auto" />
          <h4 className="text-xs font-black text-slate-900 dark:text-white">5+ Platforms</h4>
          <p className="text-[10px] text-slate-500">YouTube, IG, FB, TikTok, X</p>
        </div>
      </div>
    </div>
  );
}
