'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { adConfig } from '@/config/ads';

const EXCLUDED_ROUTES = [
  '/pdf-editor',
  '/pdf-workspace',
  '/quiz',
  '/account',
  '/settings',
  '/privacy',
  '/terms',
  '/disclaimer',
];

const BOTTOM_CREATIVES = [
  {
    brand: 'Canva Pro',
    tagline: 'Design faster with AI tools',
    cta: 'Try Free',
    url: 'https://canva.com',
    rating: '4.8 ★',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    brand: 'Google Cloud',
    tagline: 'Claim $300 free developer credits',
    cta: 'Claim $300',
    url: 'https://cloud.google.com',
    rating: '4.9 ★',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    brand: 'NordVPN',
    tagline: 'Secure your files with 256-bit encryption',
    cta: 'Get 70% Off',
    url: 'https://nordvpn.com',
    rating: '4.7 ★',
    color: 'from-emerald-600 to-teal-700',
  },
];

export function StickyBottomAd() {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!adConfig.enabled) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BOTTOM_CREATIVES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const isExcluded = pathname ? EXCLUDED_ROUTES.some((route) => pathname.startsWith(route)) : false;

  if (!adConfig.enabled || isClosed || isExcluded) return null;

  const current = BOTTOM_CREATIVES[index];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {isMinimized ? (
          <div className="flex justify-end">
            <button
              onClick={() => setIsMinimized(false)}
              className="px-3 py-1 rounded-t-xl bg-slate-900/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg hover:bg-slate-800 transition-all border border-slate-700 border-b-0"
            >
              <span>Ad • Sponsored</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-2.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
            {/* Left Ad info badge & brand */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider shrink-0">
                Ad
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {current.brand}
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold hidden sm:inline">
                    {current.rating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {current.tagline}
                </p>
              </div>
            </div>

            {/* Right Action & Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3.5 py-1.5 rounded-xl bg-linear-to-r ${current.color} text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1`}
              >
                <span>{current.cta}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Minimize Banner"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsClosed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                title="Close Banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
