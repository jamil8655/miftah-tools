'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Home, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface PinnedEventDetail {
  toolId: string;
  toolName: string;
  url: string;
  message?: string;
}

const TOAST_LOCALES = {
  en: {
    added: 'Shortcut added to Phone Screen!',
    dismiss: 'Dismiss',
    viewOnHome: 'View on Home',
  },
  ur: {
    added: 'موبائل اسکرین پر شارٹ کٹ بن گیا!',
    dismiss: 'بند کریں',
    viewOnHome: 'ہوم پر دیکھیں',
  },
  ar: {
    added: 'تمت إضافة الاختصار لشاشة الهاتف!',
    dismiss: 'إغلاق',
    viewOnHome: 'عرض في الرئيسية',
  },
  hi: {
    added: 'फ़ोन स्क्रीन पर शॉर्टकट जुड़ गया!',
    dismiss: 'बंद करें',
    viewOnHome: 'होम पर देखें',
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

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="flex items-center justify-between gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl shadow-black/40 ring-1 ring-white/10">
        {/* Left: Icon & Tool Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-xs font-black truncate leading-tight">
              {activeToast.toolName}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{activeToast.message || loc.added}</span>
            </p>
          </div>
        </div>

        {/* Right: Dismiss Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            aria-label={loc.dismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
