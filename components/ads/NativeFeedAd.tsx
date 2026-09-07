'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Star, ShieldCheck } from 'lucide-react';
import { adConfig } from '@/config/ads';

const FEED_ADS = [
  {
    brand: 'Canva Pro Studio',
    title: 'AI Graphic & Document Editor',
    desc: 'Access 100M+ templates, auto background remover, and brand kits.',
    badge: 'Sponsored Pro',
    cta: 'Try Free',
    url: 'https://canva.com',
    rating: '4.8',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    brand: 'Google Cloud Platform',
    title: 'Free $300 Developer Credits',
    desc: 'Deploy fast APIs, host microservices, and build with Gemini AI models.',
    badge: 'Official Cloud',
    cta: 'Claim $300',
    url: 'https://cloud.google.com',
    rating: '4.9',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    brand: 'NordVPN Privacy',
    title: '256-Bit Encrypted Secure VPN',
    desc: 'Protect all your devices with high-speed servers in 111+ countries.',
    badge: 'Security',
    cta: 'Get 70% Off',
    url: 'https://nordvpn.com',
    rating: '4.7',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    brand: 'Grammarly AI',
    title: 'Smart AI Writing Assistant',
    desc: 'Instant clarity, tone, and grammar suggestions for all documents.',
    badge: 'Productivity',
    cta: 'Add to Browser',
    url: 'https://grammarly.com',
    rating: '4.9',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export function NativeFeedAd({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!adConfig.enabled) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FEED_ADS.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  if (!adConfig.enabled) return null;

  const current = FEED_ADS[index];

  return (
    <div
      className={`group relative rounded-2xl border border-amber-500/30 bg-linear-to-b from-amber-50/40 to-white dark:from-amber-950/20 dark:to-slate-900 p-4 transition-all duration-300 hover:shadow-lg hover:border-amber-500/50 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Ad badge & Brand */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider">
              Ad
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {current.brand}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span>{current.rating}</span>
          </div>
        </div>

        {/* Title and description */}
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {current.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {current.desc}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Verified Partner</span>
        </span>

        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3.5 py-1.5 rounded-xl bg-linear-to-r ${current.gradient} text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition-transform`}
        >
          <span>{current.cta}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
