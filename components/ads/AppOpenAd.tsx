'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, ShieldCheck, ChevronRight, Star } from 'lucide-react';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';

const APP_OPEN_CREATIVES = [
  {
    brand: 'Google Cloud Platform',
    category: 'Developer & AI Cloud',
    title: 'Deploy & Scale Apps with $300 Free Credits',
    desc: 'Access enterprise Vertex AI, Gemini 1.5 Pro, and serverless compute infrastructure with instant setup.',
    cta: 'Claim $300 Credits',
    url: 'https://cloud.google.com',
    rating: '4.9 ★',
    reviews: '340k+ reviews',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    iconBg: 'bg-blue-600',
    badge: 'Sponsored',
  },
  {
    brand: 'Canva Pro Studio',
    category: 'Graphic Design & Video',
    title: 'Turn Ideas into Visual Masterpieces with AI',
    desc: '100M+ premium design templates, instant background remover, brand kits, and 4K video editing.',
    cta: 'Start 30-Day Free Trial',
    url: 'https://canva.com',
    rating: '4.8 ★',
    reviews: '1.2M+ reviews',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    iconBg: 'bg-purple-600',
    badge: 'Featured',
  },
  {
    brand: 'NordVPN Security',
    category: 'Privacy & Cybersecurity',
    title: 'Browse Privately with Military-Grade Encryption',
    desc: 'Ultra-fast global servers with Threat Protection, malware blocker, and verified zero-logging policy.',
    cta: 'Get 70% Discount Now',
    url: 'https://nordvpn.com',
    rating: '4.7 ★',
    reviews: '580k+ reviews',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    iconBg: 'bg-cyan-600',
    badge: 'Top Privacy',
  },
  {
    brand: 'Shopify Commerce',
    category: 'E-Commerce & Retail',
    title: 'Build Your Dream Online Store in Minutes',
    desc: 'Start selling everywhere with world-class checkout, automated marketing tools, and 24/7 support.',
    cta: 'Start $1/Month Trial',
    url: 'https://shopify.com',
    rating: '4.9 ★',
    reviews: '750k+ reviews',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    iconBg: 'bg-emerald-600',
    badge: 'Special Deal',
  },
];

export function AppOpenAd() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [creative, setCreative] = useState(APP_OPEN_CREATIVES[0]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('miftah_app_open_last', Date.now().toString());
    }
  };

  useEffect(() => {
    if (!adConfig.enabled) return;

    // Check 15-second debounce between launches in the same session
    const lastShown = sessionStorage.getItem('miftah_app_open_last');
    const now = Date.now();
    if (lastShown && now - parseInt(lastShown, 10) < 15000) {
      return;
    }

    // Attempt Native Android App Open Ad first if native platform detected
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      adManager.showAppOpenAd().then((shown) => {
        if (!shown) {
          // If native ad didn't show immediately, show rich full-screen startup ad
          triggerWebOpenAd();
        }
      });
    } else {
      triggerWebOpenAd();
    }

    function triggerWebOpenAd() {
      const randomIndex = Math.floor(Math.random() * APP_OPEN_CREATIVES.length);
      setCreative(APP_OPEN_CREATIVES[randomIndex]);
      setIsOpen(true);
      sessionStorage.setItem('miftah_app_open_last', Date.now().toString());

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Automatic close after 15 seconds if user leaves it running
      const autoCloseTimer = setTimeout(() => {
        setIsOpen(false);
      }, 15000);

      return () => {
        clearInterval(timer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 text-white animate-in fade-in duration-200 select-none">
      {/* 1. Header with Ad Badge and Large, Prominent 'Katne Wala' (✕) Button */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2">
        {/* Left: Ad Badge & Brand */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
            Ad
          </span>
          <span className="text-xs text-slate-300 font-bold truncate max-w-[160px]">
            {creative.brand}
          </span>
        </div>

        {/* Right: Real Cut / Close '✕' & Skip Button */}
        <div className="flex items-center gap-2">
          {/* Skip / Countdown Pill */}
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-white transition-all flex items-center gap-1 border border-white/25 shadow-md"
            title="Skip Ad"
          >
            {countdown > 0 ? (
              <span>Skip ({countdown}s)</span>
            ) : (
              <span>Skip Ad</span>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Prominent Large Circular Cut (✕) Button - 44px touch target */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Ad"
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-rose-600/80 hover:bg-rose-600 active:scale-90 text-white flex items-center justify-center transition-all border-2 border-white/40 shadow-xl"
            title="Close Ad (Katne Wala Button)"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 2. Main Center Ad Creative Card */}
      <div className="w-full max-w-md my-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-center shadow-2xl relative overflow-hidden space-y-4">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-brand-500/25 flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white">
            <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-300 mb-2 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{creative.brand} • {creative.badge}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            {creative.title}
          </h3>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
            {creative.desc}
          </p>

          <div className="mt-2.5 text-xs text-amber-400 font-bold flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{creative.rating}</span>
            <span className="text-slate-400 font-normal">({creative.reviews})</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href={creative.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className={`w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r ${creative.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-transform`}
          >
            <span>{creative.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Bottom 'Continue to App' Bar with Clear Dismissal */}
      <div className="w-full max-w-md text-center pb-2">
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 active:scale-98 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 border border-white/20 shadow-md"
        >
          <span>Continue to Miftah Tools</span>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✕</span>
        </button>
      </div>
    </div>
  );
}
