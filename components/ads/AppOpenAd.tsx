'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, ShieldCheck, ChevronRight, Star, Award, CheckCircle2 } from 'lucide-react';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';

const APP_OPEN_CREATIVES = [
  {
    brand: 'Google Cloud Platform',
    category: 'Developer & AI Cloud',
    title: 'Deploy & Scale with $300 Free Cloud & AI Credits',
    desc: 'Access enterprise Vertex AI, Gemini models, high-speed storage, and serverless compute infrastructure with instant setup.',
    cta: 'Claim $300 Free Credits',
    url: 'https://cloud.google.com',
    rating: '4.9 ★',
    reviews: '340k+ reviews',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    accentColor: 'text-blue-400',
    bgBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badge: 'Official Cloud Partner',
    highlights: ['100% Free Initial Tier', 'Enterprise Security', 'Global CDN & API Speed'],
  },
  {
    brand: 'Canva Pro Studio',
    category: 'Graphic Design & Video Editing',
    title: 'Turn Ideas into Visual Masterpieces with AI',
    desc: '100M+ premium templates, instant background remover, brand kits, PDF editors, and 4K video exports without watermarks.',
    cta: 'Start 30-Day Free Trial',
    url: 'https://canva.com',
    rating: '4.8 ★',
    reviews: '1.2M+ reviews',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    accentColor: 'text-pink-400',
    bgBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    badge: 'Editor Choice',
    highlights: ['Unlimited AI Tools', '100M+ Stock Media', 'Ultra HD PDF & Image Export'],
  },
  {
    brand: 'NordVPN Security',
    category: 'Privacy & Cybersecurity',
    title: 'Browse & Download Privately with Next-Gen VPN',
    desc: 'Ultra-fast global servers with Threat Protection, malware blocker, and verified zero-logging policy for total security.',
    cta: 'Get 70% Discount Now',
    url: 'https://nordvpn.com',
    rating: '4.7 ★',
    reviews: '580k+ reviews',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    accentColor: 'text-cyan-400',
    bgBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    badge: 'Top Security Pick',
    highlights: ['Military-Grade 256-bit Encryption', '111 Countries', 'Zero Logs Guaranteed'],
  },
  {
    brand: 'Shopify Commerce',
    category: 'E-Commerce & Online Business',
    title: 'Build Your Global Online Business in Minutes',
    desc: 'Start selling everywhere with world-class checkout, automated inventory tools, payment processing, and 24/7 support.',
    cta: 'Start $1/Month Trial',
    url: 'https://shopify.com',
    rating: '4.9 ★',
    reviews: '750k+ reviews',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    accentColor: 'text-emerald-400',
    bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badge: 'Top Business Platform',
    highlights: ['Instant Global Storefront', 'Integrated Payments', '99.99% Uptime'],
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

      // Natural 5-second countdown to enable skip/close naturally
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col justify-between p-4 sm:p-8 text-white animate-in fade-in duration-300 select-none overflow-y-auto">
      {/* 1. Top AdMob-style Header Bar */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between pt-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md bg-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-sm">
            Ad
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight truncate">
              {creative.brand}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {creative.category}
            </span>
          </div>
        </div>

        {/* Natural AdMob Skip / Close Action */}
        <div className="flex items-center gap-2">
          {countdown > 0 ? (
            <div className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Reward in {countdown}s</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-extrabold text-white border border-slate-600 shadow-md flex items-center gap-1 transition-all"
            >
              <span>Skip</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Ad"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 shadow-lg"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Main Full-Screen Ad Creative Hero */}
      <div className="w-full max-w-2xl mx-auto my-auto py-6 space-y-6 text-center">
        {/* Large Media Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-5">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Large Hero Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-600 p-1 shadow-2xl shadow-brand-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-white">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-brand-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${creative.bgBadge}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{creative.badge}</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight max-w-lg mx-auto">
              {creative.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              {creative.desc}
            </p>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-black">{creative.rating}</span>
              <span className="text-slate-400 font-medium">({creative.reviews})</span>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            {creative.highlights.map((h, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>

          {/* Main Action Button */}
          <div className="pt-3">
            <a
              href={creative.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${creative.gradient} hover:opacity-95 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-brand-500/25 hover:scale-[1.01] active:scale-95 transition-all`}
            >
              <span>{creative.cta}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Bottom Dismissal Control */}
      <div className="w-full max-w-2xl mx-auto text-center pt-2 pb-2">
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-800 shadow-sm"
        >
          <span>Continue to Miftah Tools App</span>
        </button>
      </div>
    </div>
  );
}

