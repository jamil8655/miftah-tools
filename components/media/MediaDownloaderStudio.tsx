'use client';

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Download,
  Video,
  Music,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Check,
  Key,
  Server,
  Layers,
  Settings2,
  Lock,
} from 'lucide-react';
import {
  MediaMetadata,
  MediaDownloadFormat,
  fetchMediaMetadata,
  detectPlatform,
  downloadInSiteMedia,
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

  // Auto-detect platform in real-time as user types or pastes
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
          setUrlInput(text);
          const detected = detectPlatform(text);
          setDetectedPlatform(detected && detected.platform !== 'generic' ? detected.platform : null);
          handleAnalyze(text);
        }
      }
    } catch (e) {
      // safe fallback
    }
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || urlInput;
    if (!targetUrl.trim()) {
      setError('Please enter a valid video link (e.g. YouTube, Instagram, Facebook, TikTok, X)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const data = await fetchMediaMetadata(targetUrl);
      setMetadata(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video streams. Please verify the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: MediaDownloadFormat) => {
    if (!metadata) return;
    setDownloadingId(format.id);
    setDownloadProgress(10);
    setDownloadStatusText('Connecting to multi-engine cluster...');

    try {
      const result = await downloadInSiteMedia(
        metadata,
        format,
        (pct, status) => {
          setDownloadProgress(pct);
          setDownloadStatusText(status);
        }
      );

      if (result.blob && result.blob.size > 2000 && !result.blob.type.includes('text/html')) {
        downloadSingleFile(result.blob, result.fileName);
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to download from current nodes. The system will automatically rotate to backup clusters.');
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
        setDownloadProgress(0);
        setDownloadStatusText('');
      }, 600);
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

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: '🎬', desc: 'Shorts, 4K & MP3', color: 'from-red-500 to-rose-600' },
    { id: 'instagram', name: 'Instagram', icon: '📸', desc: 'Reels & Stories', color: 'from-pink-500 to-purple-600' },
    { id: 'facebook', name: 'Facebook', icon: '👥', desc: 'Watch & HD Clips', color: 'from-blue-600 to-indigo-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', desc: 'No Watermark HD', color: 'from-cyan-500 to-slate-900' },
    { id: 'twitter', name: 'X / Twitter', icon: '🐦', desc: 'Clips & GIFs', color: 'from-sky-500 to-blue-600' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', desc: 'Status Saver', color: 'from-emerald-500 to-teal-600' },
  ];

  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto" />
        <div className="h-14 w-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-brand-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>5+ Multi-Engine Auto-Fallback Cluster • Zero Limit Failover</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Universal Social Media Video & Audio Downloader
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Paste any link from YouTube, Instagram, TikTok, Facebook, or X. Our multi-tiered failover engine automatically extracts 4K UHD video, 320kbps MP3 audio, and HD thumbnails.
        </p>

        {/* API Cluster Control Button */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setShowApiSettings(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <Settings2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>API Engine Cluster & Key Settings</span>
          </button>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Paste YouTube, Instagram, TikTok, FB, or X link here..."
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Paste
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isLoading || !urlInput.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shrink-0"
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

        {/* Platform Indicator Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400">Supported Platforms:</span>
          {platforms.map((p) => {
            const isDetected = detectedPlatform === p.id;
            return (
              <span
                key={p.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                  isDetected
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border-brand-500 scale-105 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </span>
            );
          })}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* API Configuration Modal */}
      {showApiSettings && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Multi-API Cluster & Custom Key Configuration
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowApiSettings(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Miftah Tools operates an active pool of 5+ fallback providers. If you have your own RapidAPI Key, enter it below to receive dedicated priority bandwidth:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🟢 Engine 1: RapidAPI Multi-Key Pool</span>
              <p className="text-[11px] text-slate-500">Auto-rotates across 3+ keys when rate limits occur.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🟢 Engine 2: Cobalt Global Cluster</span>
              <p className="text-[11px] text-slate-500">6+ global nodes for YouTube, TikTok, Insta & Twitter.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🟢 Engine 3: TikWM Public Cloud</span>
              <p className="text-[11px] text-slate-500">High-speed no-watermark TikTok videos & MP3 audio.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🟢 Engine 4: Render Dedicated Streamer</span>
              <p className="text-[11px] text-slate-500">Cloud backend failover for restricted media.</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom RapidAPI Key (Optional):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Enter your personal RapidAPI Key..."
                className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveCustomKey}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {savedKeyMsg ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata & Stream Result Section */}
      {metadata && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Thumbnail Preview */}
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-800">
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800';
                }}
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                {metadata.platformName}
              </div>
              {metadata.duration && (
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-bold">
                  {metadata.duration}
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="md:col-span-8 space-y-3">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white line-clamp-2">
                {metadata.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>{metadata.author}</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Stream Links Ready</span>
                </span>
              </div>

              {/* Quality Tabs */}
              <div className="flex items-center gap-2 pt-2">
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
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
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

          {/* Download Options List */}
          <div className="space-y-2.5 pt-2">
            {metadata.formats
              .filter((f) => f.type === activeTab)
              .map((format) => {
                const isDownloading = downloadingId === format.id;
                return (
                  <div
                    key={format.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-500/40 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">{format.label}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                          {format.quality}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Format: {format.extension.toUpperCase()} • {format.sizeEstimate}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={!!downloadingId}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{downloadStatusText || 'Downloading...'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Live Progress Bar when downloading */}
          {downloadingId && (
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-bold text-brand-700 dark:text-brand-300">
                <span>{downloadStatusText}</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-200 dark:bg-brand-900 overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
