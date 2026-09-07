'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Info, X, ExternalLink, Play, Award, ShieldCheck, Zap } from 'lucide-react';
import { adConfig } from '@/config/ads';
import { AdMobTestModal } from './AdMobTestModal';

interface AdSlotProps {
  placement: 'header' | 'in-feed' | 'tool-bottom' | 'result-page';
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  showTestTriggers?: boolean;
}

const AD_CAMPAIGNS = [
  {
    id: 'cloud',
    brand: 'Google Cloud Platform',
    category: 'Developer Tools & AI',
    title: 'Get $300 in Free Cloud & AI Credits',
    desc: 'Build, deploy, and scale apps with high-performance Vertex AI & Gemini APIs.',
    cta: 'Claim $300 Credits',
    url: 'https://cloud.google.com',
    rating: '4.9',
    reviews: '320k',
    gradient: 'from-blue-600 to-indigo-600',
    iconBg: 'bg-blue-500',
    badge: 'Special Offer',
  },
  {
    id: 'canva',
    brand: 'Canva Pro Studio',
    category: 'Design & Graphics',
    title: 'Create Stunning Graphics & Documents in Seconds',
    desc: 'Access 100M+ premium templates, AI background remover, and instant brand kits.',
    cta: 'Try 30 Days Free',
    url: 'https://canva.com',
    rating: '4.8',
    reviews: '1.2M',
    gradient: 'from-purple-600 to-pink-600',
    iconBg: 'bg-purple-500',
    badge: 'Popular',
  },
  {
    id: 'nord',
    brand: 'NordVPN Security',
    category: 'Privacy & Security',
    title: 'Protect Your Online Privacy with Next-Gen VPN',
    desc: 'Ultra-fast servers in 111 countries with military-grade 256-bit encryption.',
    cta: 'Get 70% Off Now',
    url: 'https://nordvpn.com',
    rating: '4.7',
    reviews: '580k',
    gradient: 'from-cyan-600 to-blue-700',
    iconBg: 'bg-cyan-500',
    badge: 'Editor Choice',
  },
  {
    id: 'grammarly',
    brand: 'Grammarly AI',
    category: 'Productivity & Writing',
    title: 'Write Clear, Error-Free Documents Instantly',
    desc: 'AI-powered suggestions for tone, clarity, grammar, and professional polish.',
    cta: 'Add Free Extension',
    url: 'https://grammarly.com',
    rating: '4.9',
    reviews: '890k',
    gradient: 'from-emerald-600 to-teal-700',
    iconBg: 'bg-emerald-500',
    badge: 'Free Tool',
  },
];

export function AdSlot({ placement, className = '', format = 'auto', showTestTriggers = true }: AdSlotProps) {
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [modalType, setModalType] = useState<'interstitial' | 'rewarded' | 'app-open' | null>(null);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adConfig.enabled) return;

    // Rotate active ad campaign every 7 seconds
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % AD_CAMPAIGNS.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  if (!adConfig.enabled || isDismissed) return null;

  const currentAd = AD_CAMPAIGNS[activeAdIndex];
  const unitId =
    placement === 'in-feed'
      ? adConfig.admob.nativeId
      : placement === 'result-page'
      ? adConfig.admob.fixedBannerId
      : adConfig.admob.adaptiveBannerId;

  return (
    <>
      <div
        ref={adRef}
        className={`relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm p-3.5 my-4 transition-all duration-300 hover:shadow-md ${className}`}
      >
        {/* AdMob Top Status Header */}
        <div className="flex items-center justify-between text-[11px] mb-2 px-1 border-b border-slate-100 dark:border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold text-[9px] uppercase tracking-wider border border-amber-500/30">
              Ad
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
              Google AdMob <span className="text-[10px] text-slate-400 font-mono">({placement})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="About this Ad"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
              title="Hide Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info Overlay Popup */}
        {showInfo && (
          <div className="p-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-bold flex items-center justify-between text-slate-800 dark:text-white">
              <span>Google AdMob Placement Info</span>
              <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Running active test creative for unit: <span className="font-mono text-slate-700 dark:text-slate-200">{unitId}</span>
            </p>
          </div>
        )}

        {/* Realistic Interactive Running Ad Banner Creative */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 p-2.5 rounded-xl bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          {/* Left Icon & Text Content */}
          <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
            <div className={`w-12 h-12 rounded-2xl ${currentAd.iconBg} text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/10`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1 text-left rtl:text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentAd.brand}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {currentAd.badge}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                {currentAd.title}
              </h4>

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="text-amber-500 font-bold">★ {currentAd.rating}</span>
                <span>({currentAd.reviews})</span>
                <span className="hidden md:inline">• {currentAd.category}</span>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <a
              href={currentAd.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl bg-linear-to-r ${currentAd.gradient} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-transform`}
            >
              <span>{currentAd.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* AdMob Quick Test Triggers (For developers/testers) */}
        {showTestTriggers && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
            <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>AdMob Test Simulator:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setModalType('interstitial')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1"
              >
                <Play className="w-2.5 h-2.5 text-blue-500" />
                <span>Test Interstitial (Full Screen)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalType('rewarded')}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/30 flex items-center gap-1"
              >
                <Award className="w-2.5 h-2.5 text-amber-500" />
                <span>Test Rewarded Video</span>
              </button>

              <button
                type="button"
                onClick={() => setModalType('app-open')}
                className="px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-semibold border border-purple-500/30 flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                <span>Test App Open</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AdMob Test Modal (Interstitial / Rewarded / App Open) */}
      <AdMobTestModal
        type={modalType}
        unitId={
          modalType === 'interstitial'
            ? adConfig.admob.interstitialId
            : modalType === 'rewarded'
            ? adConfig.admob.rewardedId
            : adConfig.admob.appOpenId
        }
        onClose={() => setModalType(null)}
      />
    </>
  );
}
