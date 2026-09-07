'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { adConfig } from '@/config/ads';

const APP_OPEN_CREATIVES = [
  {
    brand: 'Google Cloud Platform',
    title: 'Deploy & Scale Apps with $300 Free Credits',
    desc: 'Access enterprise Vertex AI, Gemini 1.5 Pro, and serverless compute infrastructure.',
    cta: 'Claim Free $300 Credits',
    url: 'https://cloud.google.com',
    rating: '4.9 ★ (320k+ reviews)',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    iconColor: 'bg-blue-500',
  },
  {
    brand: 'Canva Pro Studio',
    title: 'Turn Ideas into Visual Masterpieces with AI',
    desc: '100M+ premium templates, background remover, brand kits, and video animations.',
    cta: 'Start 30-Day Free Trial',
    url: 'https://canva.com',
    rating: '4.8 ★ (1.2M+ reviews)',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    iconColor: 'bg-purple-500',
  },
  {
    brand: 'NordVPN Security',
    title: 'Browse Privately with Military-Grade Encryption',
    desc: 'Ultra-fast global servers with Threat Protection, malware blocker, and zero logging.',
    cta: 'Get 70% Discount Now',
    url: 'https://nordvpn.com',
    rating: '4.7 ★ (580k+ reviews)',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    iconColor: 'bg-cyan-500',
  },
];

export function AppOpenAd() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [creative, setCreative] = useState(APP_OPEN_CREATIVES[0]);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!adConfig.enabled) return;

    // Check if app open ad was already shown in this browser session
    const hasShown = sessionStorage.getItem('nexora_app_open_shown');
    if (hasShown) return;

    // Pick random creative
    const randomIndex = Math.floor(Math.random() * APP_OPEN_CREATIVES.length);
    setCreative(APP_OPEN_CREATIVES[randomIndex]);
    setIsOpen(true);
    sessionStorage.setItem('nexora_app_open_shown', 'true');

    // 3-second countdown (auto enables skip, but close X is ALWAYS clickable immediately)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 text-white animate-in fade-in duration-200 select-none">
      {/* 1. Real Google AdMob Style Top Bar with prominent Cut/Close 'X' */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2">
        {/* Left: Ad Badge & Brand */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-xs">
            Ad
          </span>
          <span className="text-xs text-slate-300 font-bold truncate max-w-[160px]">
            {creative.brand}
          </span>
        </div>

        {/* Right: Real Cut/Close 'X' Buttons (Instant Dismiss) */}
        <div className="flex items-center gap-2">
          {/* Skip / Countdown Pill */}
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-white transition-all flex items-center gap-1 border border-white/20 shadow-md"
            title="Skip Ad"
          >
            {countdown > 0 ? (
              <span>Skip ({countdown}s)</span>
            ) : (
              <span>Skip Ad</span>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Prominent Circular Cut (✕) Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Ad"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 active:scale-90 text-white flex items-center justify-center transition-all border border-white/30 shadow-lg hover:rotate-90 duration-150"
            title="Katne wala button (Close Ad)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Main Center Ad Creative Card */}
      <div className="w-full max-w-md my-auto bg-linear-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-center shadow-2xl relative overflow-hidden space-y-4">
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-linear-to-tr from-brand-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-brand-500/25 flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white">
            <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-300 mb-2 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{creative.brand} • Sponsored</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            {creative.title}
          </h3>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
            {creative.desc}
          </p>

          <div className="mt-2.5 text-xs text-amber-400 font-bold">
            {creative.rating}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href={creative.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className={`w-full py-3.5 px-5 rounded-2xl bg-linear-to-r ${creative.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-transform`}
          >
            <span>{creative.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Bottom 'Continue to App' Bar with explicit Cut / Close */}
      <div className="w-full max-w-md text-center pb-2">
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          <span>Continue to Miftah Tools</span>
          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">✕</span>
        </button>
      </div>
    </div>
  );
}
