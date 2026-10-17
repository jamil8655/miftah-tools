'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pin, Home, ArrowRight, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface PinnedEventDetail {
  toolId: string;
  toolName: string;
  url: string;
}

const TOAST_LOCALES = {
  en: {
    added: 'Added to Home Page!',
    viewOnHome: 'Go to Home Page →',
    undo: 'Dismiss',
  },
  ur: {
    added: 'ہوم پیج پر شامل کر دیا گیا!',
    viewOnHome: 'ہوم پیج پر دیکھیں ←',
    undo: 'بند کریں',
  },
  ar: {
    added: 'تمت الإضافة إلى الصفحة الرئيسية!',
    viewOnHome: 'عرض في الرئيسية ←',
    undo: 'إغلاق',
  },
  hi: {
    added: 'होम पेज पर जोड़ दिया गया!',
    viewOnHome: 'होम पेज पर जाएं →',
    undo: 'बंद करें',
  },
};

export function GlobalPinnedToast() {
  const router = useRouter();
  const { language, isRTL } = useI18n();
  const [activeToast, setActiveToast] = useState<PinnedEventDetail | null>(null);

  const loc = TOAST_LOCALES[language as keyof typeof TOAST_LOCALES] || TOAST_LOCALES.en;

  useEffect(() => {
    const handlePinned = (e: CustomEvent<PinnedEventDetail>) => {
      if (e.detail) {
        setActiveToast(e.detail);
      }
    };

    window.addEventListener('miftah:tool-pinned' as any, handlePinned as any);
    return () => {
      window.removeEventListener('miftah:tool-pinned' as any, handlePinned as any);
    };
  }, []);

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const handleNavigate = () => {
    triggerHaptic('selection');
    router.push(`/?pinned=${encodeURIComponent(activeToast.toolId)}#pinned-tools`);
    setActiveToast(null);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="flex items-center justify-between gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl shadow-black/40 ring-1 ring-white/10">
        
        {/* Left: Icon & Tool Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Pin className="w-4 h-4 fill-current rotate-45" />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-xs font-black truncate leading-tight">
              {activeToast.toolName}
            </p>
            <p className="text-[11px] text-slate-300 dark:text-slate-400 font-medium truncate flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{loc.added}</span>
            </p>
          </div>
        </div>

        {/* Right: Direct Navigation CTA & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleNavigate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-xs shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer select-none"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{loc.viewOnHome}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            aria-label={loc.undo}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
