'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { adConfig } from '@/config/ads';

const APP_OPEN_CREATIVES = [
  {
    brand: 'Google Cloud Platform',
    title: 'Deploy & Scale Apps with $300 Free Credits',
    desc: 'Access enterprise Vertex AI, Gemini 1.5 Pro, and serverless compute infrastructure.',
    cta: 'Claim Free Credits',
    url: 'https://cloud.google.com',
    rating: '4.9 ★ (320k+ reviews)',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    iconColor: 'bg-blue-500',
  },
  {
    brand: 'Canva Pro Studio',
    title: 'Turn Ideas into Visual Masterpieces with AI',
    desc: '100M+ premium graphics, background removers, brand kits, and video animations.',
    cta: 'Start 30-Day Trial',
    url: 'https://canva.com',
    rating: '4.8 ★ (1.2M+ reviews)',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    iconColor: 'bg-purple-500',
  },
  {
    brand: 'NordVPN Security',
    title: 'Browse Privately with Military-Grade Encryption',
    desc: 'Ultra-fast global servers with Threat Protection, malware blocker, and zero logging.',
    cta: 'Get 70% Discount',
    url: 'https://nordvpn.com',
    rating: '4.7 ★ (580k+ reviews)',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    iconColor: 'bg-cyan-500',
  },
];

export function AppOpenAd() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [creative, setCreative] = useState(APP_OPEN_CREATIVES[0]);

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

    // 4-second countdown
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
    <div className="fixed inset-0 z-99999 bg-black/80 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 text-white animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
            Ad
          </span>
          <span className="text-xs text-slate-300 font-medium">Sponsored Launch</span>
        </div>

        {countdown > 0 ? (
          <div className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-semibold text-slate-300">
            Skip in <span className="text-amber-400 font-bold">{countdown}s</span>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-900 font-bold text-xs hover:bg-slate-200 transition-all shadow-lg active:scale-95"
          >
            <span>Continue to App</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Center Creative Card */}
      <div className="w-full max-w-md my-auto bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden space-y-5">
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-linear-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-xl shadow-brand-500/20 flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white">
            <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-slate-300 mb-2">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{creative.brand}</span>
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
            onClick={() => setIsOpen(false)}
            className={`w-full py-3 px-5 rounded-2xl bg-linear-to-r ${creative.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform`}
          >
            <span>{creative.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Bottom Dismiss Prompt */}
      <div className="w-full max-w-xs text-center pb-2">
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-slate-400 hover:text-white underline transition-colors"
        >
          {countdown > 0 ? 'Loading application...' : 'Skip and go to Nexora Tools →'}
        </button>
      </div>
    </div>
  );
}
