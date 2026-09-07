'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, Shield, Zap } from 'lucide-react';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissed = localStorage.getItem('nexora_pwa_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also show banner on mobile browsers after 3 seconds for easy homescreen bookmarking
    const timer = setTimeout(() => {
      if (!dismissed) setShowBanner(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Miftah Tools on iOS/Android: Tap "Share" or "Menu (⋮)" in your browser and select "Add to Home Screen" or "Install App".');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    try {
      localStorage.setItem('miftah_pwa_dismissed', 'true');
    } catch (e) {}
  };

  if (!showBanner || isDismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md lg:bottom-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white text-slate-900 border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-slate-900/10 flex items-start justify-between gap-3.5 relative overflow-hidden">
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">Install Miftah Tools App</h4>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">100% Offline</span>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-2">
            Add to your Home Screen or Desktop for instant 1-click access and ultra-fast offline file processing.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 inline-flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Free App</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
