'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { adConfig } from '@/config/ads';

const REWARD_PERKS = [
  {
    brand: 'Google Cloud Platform',
    title: 'Claim 100GB Free Cloud Backup with Your File',
    desc: 'Store, sync, and share your converted documents with zero storage loss.',
    cta: 'Claim Free 100GB',
    url: 'https://cloud.google.com',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    brand: 'Canva Pro',
    title: 'Unlock 30 Days Free Pro Document Designing',
    desc: 'Edit PDFs, create resumes, and export ultra HD assets without watermarks.',
    cta: 'Claim 30 Days Free',
    url: 'https://canva.com',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    brand: 'NordVPN',
    title: 'Protect Your Downloaded Files with 70% Off VPN',
    desc: 'Encrypt your file transfers and hide your IP address with high-speed security.',
    cta: 'Claim 70% Discount',
    url: 'https://nordvpn.com',
    gradient: 'from-emerald-600 to-teal-700',
  },
];

export function ResultRewardAd() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!adConfig.enabled) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % REWARD_PERKS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  if (!adConfig.enabled) return null;

  const current = REWARD_PERKS[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-r from-emerald-500/10 via-brand-500/5 to-purple-500/10 dark:from-emerald-950/30 dark:via-slate-900 dark:to-purple-950/30 p-3.5 sm:p-4 my-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Icon & Text */}
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <Gift className="w-5 h-5 animate-bounce" />
          </div>

          <div className="min-w-0 text-left rtl:text-right flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider">
                Reward Perk
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {current.brand}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
              {current.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full sm:w-auto flex justify-end">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:w-auto px-4 py-2 rounded-xl bg-linear-to-r ${current.gradient} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-transform`}
          >
            <span>{current.cta}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
