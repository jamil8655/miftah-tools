'use client';

import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, ExternalLink, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { adConfig } from '@/config/ads';

const NATIVE_VIDEO_CAMPAIGNS = [
  {
    brand: 'Google Cloud AI Studio',
    title: 'Build Autonomous Agents with Gemini 1.5 Pro',
    desc: 'Watch developer workflow tutorial: Stream live multimodal outputs and fine-tune models with free API credits.',
    videoThumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    duration: '0:30',
    cta: 'Watch & Claim Credits',
    url: 'https://cloud.google.com',
    rating: '4.9 ★',
    views: '450K views',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    brand: 'Canva Pro Motion',
    title: 'Create Cinematic Video Effects in One Click',
    desc: 'Watch quick walkthrough: Auto AI scene transition, background remover, and ultra-HD video renders.',
    videoThumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60',
    duration: '0:25',
    cta: 'Try Free Studio',
    url: 'https://canva.com',
    rating: '4.8 ★',
    views: '1.2M views',
    color: 'from-purple-600 to-pink-600',
  },
  {
    brand: 'NordVPN CyberSec',
    title: 'How Next-Gen VPN Shields Your Data Stream',
    desc: 'See live demo of 256-bit encrypted tunneling, malware defense, and high-speed multi-gigabit connections.',
    videoThumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
    duration: '0:20',
    cta: 'Get 70% Off',
    url: 'https://nordvpn.com',
    rating: '4.7 ★',
    views: '890K views',
    color: 'from-emerald-600 to-teal-700',
  },
];

export function NativeVideoAd({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!adConfig.enabled) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NATIVE_VIDEO_CAMPAIGNS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  if (!adConfig.enabled) return null;

  const current = NATIVE_VIDEO_CAMPAIGNS[index];

  return (
    <div
      className={`group relative rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* Video Simulation Canvas / Header */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden select-none">
        <img
          src={current.videoThumbnail}
          alt={current.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
        />

        {/* Video Overlay Badges */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider shadow-sm">
                Sponsored Video
              </span>
              <span className="text-[11px] font-bold text-white/90 drop-shadow-sm">
                {current.brand}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsMuted(!isMuted);
              }}
              aria-label={isMuted ? 'Unmute video preview' : 'Mute video preview'}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-xs"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Center Play Indicator */}
          <div className="self-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg border border-white/30 group-hover:scale-110">
              <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
            </div>
          </div>

          {/* Bottom Video Meta Bar */}
          <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs">{current.duration}</span>
            <span className="text-amber-300 font-sans font-bold">{current.views}</span>
          </div>
        </div>
      </div>

      {/* Content & Action Bar */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {current.brand}
            </span>
            <span className="text-xs font-bold text-amber-500">
              {current.rating}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {current.title}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {current.desc}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>AdMob Video Partner</span>
          </span>

          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3.5 py-1.5 rounded-xl bg-linear-to-r ${current.color} text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition-transform`}
          >
            <span>{current.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
