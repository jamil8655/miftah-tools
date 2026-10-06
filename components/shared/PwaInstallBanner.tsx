'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export function PwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Never show banner inside native Android/iOS app or standalone PWA
    const isNativeOrInstalled =
      typeof window !== 'undefined' &&
      (!!(window as any).Capacitor?.isNativePlatform?.() ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        window.location.protocol === 'capacitor:');

    if (isNativeOrInstalled) {
      setIsDismissed(true);
      setShowBanner(false);
      return;
    }

    // Check if dismissed previously within 7 days
    try {
      const dismissedUntil = localStorage.getItem('miftah_play_banner_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsDismissed(true);
        return;
      }
    } catch (_) {}

    // Show after 2.5 seconds on web/mobile browsers
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    try {
      // Dismiss for 7 days
      localStorage.setItem('miftah_play_banner_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    } catch (e) {}
  };

  if (!showBanner || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white border border-slate-700/90 rounded-3xl p-4 shadow-2xl shadow-black/30 flex items-start justify-between gap-3 relative overflow-hidden">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        {/* Google Play Triangle SVG Icon */}
        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24">
            <path d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.36-.61-.88-.61-1.474V3.288c0-.594.24-1.114.61-1.474zM15.207 13.414l2.586 2.586-12.871 7.43 10.285-10.016zm0-2.828L4.922.57 17.793 8l-2.586 2.586zm1.414 1.414l3.779-2.182c.8-.462.8-1.214 0-1.676l-3.779-2.182-2.121 2.121 2.121 2.919z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">Miftah Tools App</h3>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">Free</span>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-2">
            Download our official Android app from Google Play for fast, 100% offline tools.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <a
              href="https://play.google.com/store/apps/details?id=com.miftahtools.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 transition-all select-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get on Google Play</span>
            </a>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
