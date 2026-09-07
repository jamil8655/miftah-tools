'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Volume2, VolumeX, Play, Award, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdMobModalProps {
  type: 'interstitial' | 'rewarded' | 'app-open' | null;
  unitId?: string;
  onClose: () => void;
  onReward?: () => void;
}

export function AdMobTestModal({ type, unitId, onClose, onReward }: AdMobModalProps) {
  const [countdown, setCountdown] = useState(type === 'rewarded' ? 10 : 5);
  const [canClose, setCanClose] = useState(type === 'app-open');
  const [isMuted, setIsMuted] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (!type) return;
    setCountdown(type === 'rewarded' ? 10 : 5);
    setCanClose(type === 'app-open');
    setRewardClaimed(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          if (type === 'rewarded' && !rewardClaimed) {
            setRewardClaimed(true);
            try {
              confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
            if (onReward) onReward();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [type]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 text-white animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider shadow-sm">
            Google AdMob Test Ad
          </span>
          <span className="text-xs text-slate-300 font-mono hidden sm:inline truncate max-w-[200px]">
            {type.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {countdown > 0 && !canClose && (
            <div className="px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-semibold text-white/90">
              Reward in <span className="font-bold text-amber-400">{countdown}s</span>
            </div>
          )}

          <button
            onClick={onClose}
            aria-label="Close Ad"
            className="w-8 h-8 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center shadow-lg hover:bg-slate-200 active:scale-90 transition-all"
            title="Close Ad (✕)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Ad Content / Creative */}
      <div className="w-full max-w-lg my-auto bg-linear-to-b from-slate-900 to-slate-950 border border-slate-700/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-linear-to-tr from-brand-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-brand-500/30 flex items-center justify-center mb-4">
            <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white">
              <Sparkles className="w-10 h-10 text-brand-400 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Sponsor • Google AdMob</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {type === 'rewarded' ? 'Unlock Pro Tools with 0 Limits' : 'Boost Your Workflow with Cloud AI'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            {type === 'rewarded'
              ? 'Watch this short test ad to claim unlimited batch processing and premium features.'
              : 'Experience next-generation lightning speed document manipulation with 100% offline privacy.'}
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-amber-400 font-semibold">
            <span>★★★★★</span>
            <span className="text-slate-400">(4.9 • 450,000+ Downloads)</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-brand-500 via-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Install / Learn More</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {type === 'rewarded' && rewardClaimed && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>Reward Granted! You unlocked Premium Batch mode.</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md text-center pb-2">
        <p className="text-[10px] text-slate-400 font-mono">
          AdMob Test Unit ID: {unitId || 'ca-app-pub-3940256099942544/...'}
        </p>
      </div>
    </div>
  );
}
