'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pin, Check, ArrowRight, Home, Sparkles, X } from 'lucide-react';
import { useUserStore } from '@/lib/user/user-store';
import { TOOLS_LIST } from '@/lib/tools-config';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedTool } from '@/lib/i18n/catalog-translations';

export interface AddToHomeButtonProps {
  toolId: string;
  toolName?: string;
  category?: string;
  icon?: string;
  className?: string;
  variant?: 'icon' | 'pill' | 'button' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  directNavigate?: boolean; // When true, immediately navigates to Home Page
  showLabel?: boolean;
}

const LOCALES = {
  en: {
    addToHome: 'Add to Home Page',
    pinnedToHome: 'Pinned to Home',
    goToHome: 'View on Home Page',
    unpin: 'Remove from Home',
    addedToast: 'Added to Home Page!',
    viewNow: 'View on Home →',
  },
  ur: {
    addToHome: 'ہوم پیج پر شامل کریں',
    pinnedToHome: 'ہوم پیج پر پن ہے',
    goToHome: 'ہوم پیج پر دیکھیں',
    unpin: 'ہوم پیج سے ہٹائیں',
    addedToast: 'ہوم پیج پر شامل کر دیا گیا!',
    viewNow: 'ہوم پیج پر دیکھیں ←',
  },
  ar: {
    addToHome: 'إضافة إلى الصفحة الرئيسية',
    pinnedToHome: 'مثبت في الرئيسية',
    goToHome: 'عرض في الرئيسية',
    unpin: 'إزالة من الرئيسية',
    addedToast: 'تمت الإضافة إلى الرئيسية!',
    viewNow: 'عرض في الرئيسية ←',
  },
  hi: {
    addToHome: 'होम पेज पर जोड़ें',
    pinnedToHome: 'होम पेज पर पिन है',
    goToHome: 'होम पेज पर देखें',
    unpin: 'होम पेज से हटाएं',
    addedToast: 'होम पेज पर जोड़ दिया गया!',
    viewNow: 'होम पेज पर देखें →',
  },
};

export function AddToHomeButton({
  toolId,
  toolName,
  category,
  icon,
  className = '',
  variant = 'icon',
  size = 'md',
  directNavigate = false,
  showLabel = false,
}: AddToHomeButtonProps) {
  const router = useRouter();
  const { language, isRTL } = useI18n();
  const { isToolPinned, togglePinTool, isFavorite, toggleFavorite } = useUserStore();
  const [justPinned, setJustPinned] = useState(false);

  const loc = LOCALES[language as keyof typeof LOCALES] || LOCALES.en;

  // Resolve tool details
  const tool = TOOLS_LIST.find((t) => t.id === toolId || t.slug === toolId);
  const localized = tool ? getLocalizedTool(tool, language) : null;
  const resolvedName = toolName || localized?.name || tool?.name || toolId;
  const resolvedCategory = category || tool?.category || 'utility';
  const resolvedIcon = icon || tool?.icon || 'tool';

  // Check if pinned either via pinnedTools or favorites
  const pinned = isToolPinned(toolId) || isFavorite(toolId);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    triggerHaptic(pinned ? 'light' : 'success');

    // If already pinned and clicked on a prominent button, navigate directly to home
    if (pinned && (variant === 'pill' || variant === 'button')) {
      try {
        sessionStorage.setItem('miftah_last_pinned_tool', toolId);
        sessionStorage.setItem('miftah_last_clicked_tool', toolId);
      } catch (_) {}
      router.push(`/?pinned=${encodeURIComponent(toolId)}#pinned-tools`);
      return;
    }

    // Toggle Pin in store
    togglePinTool(toolId);
    toggleFavorite({
      id: toolId,
      type: 'tool',
      title: resolvedName,
      category: resolvedCategory,
      url: `/tools/${tool?.slug || toolId}`,
      iconName: resolvedIcon,
    });

    if (!pinned) {
      // Just added to home page!
      setJustPinned(true);
      setTimeout(() => setJustPinned(false), 3000);

      try {
        sessionStorage.setItem('miftah_last_pinned_tool', toolId);
        sessionStorage.setItem('miftah_last_clicked_tool', toolId);
      } catch (_) {}

      // Dispatch global event for animated toast notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('miftah:tool-pinned', {
            detail: {
              toolId,
              toolName: resolvedName,
              url: `/tools/${tool?.slug || toolId}`,
            },
          })
        );
      }

      // If directNavigate is enabled (e.g. from tool header button), jump straight to Home Page!
      if (directNavigate) {
        setTimeout(() => {
          router.push(`/?pinned=${encodeURIComponent(toolId)}#pinned-tools`);
        }, 150);
      }
    }
  };

  const handleUnpin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic('light');
    if (isToolPinned(toolId)) togglePinTool(toolId);
    if (isFavorite(toolId)) {
      toggleFavorite({
        id: toolId,
        type: 'tool',
        title: resolvedName,
        category: resolvedCategory,
        url: `/tools/${tool?.slug || toolId}`,
        iconName: resolvedIcon,
      });
    }
  };

  // 1. Prominent Pill / Button Variant (for tool headers & workspace banners)
  if (variant === 'pill' || variant === 'button') {
    if (pinned) {
      return (
        <div className={`inline-flex items-center rounded-2xl border p-1 shadow-xs transition-all duration-200 bg-brand-50/90 dark:bg-brand-950/70 border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 ${className}`}>
          <button
            type="button"
            onClick={handleAction}
            title={loc.goToHome}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-black hover:text-brand-800 dark:hover:text-brand-200 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            <span>{loc.pinnedToHome}</span>
            <span className="text-[10px] opacity-75 font-bold flex items-center gap-1 bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded-lg border border-brand-200/50 dark:border-brand-800/50">
              <Home className="w-3 h-3" />
              <span>{loc.viewNow}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={handleUnpin}
            title={loc.unpin}
            aria-label={loc.unpin}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handleAction}
        title={loc.addToHome}
        aria-label={loc.addToHome}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-black text-xs sm:text-xs transition-all duration-200 cursor-pointer active:scale-95 select-none bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-sm hover:shadow-md shadow-brand-600/20 ${className}`}
      >
        <Pin className="w-3.5 h-3.5 fill-current rotate-45 shrink-0" />
        <span>{loc.addToHome}</span>
        <Home className="w-3.5 h-3.5 opacity-80 shrink-0" />
      </button>
    );
  }

  // 2. Icon Variant (for tool cards, grids, compact bars)
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={handleAction}
      aria-label={pinned ? loc.unpin : loc.addToHome}
      title={pinned ? `${loc.pinnedToHome} • ${loc.unpin}` : loc.addToHome}
      className={`group/pin relative p-2 rounded-xl transition-all duration-200 active:scale-75 select-none cursor-pointer ${
        pinned
          ? 'text-brand-600 dark:text-brand-400 bg-brand-500/15 dark:bg-brand-500/25 shadow-xs border border-brand-500/30 ring-2 ring-brand-500/20'
          : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
    >
      <Pin
        className={`${iconSize} transition-transform duration-200 ${
          pinned ? 'fill-current rotate-45 scale-110 text-brand-600 dark:text-brand-400' : 'group-hover/pin:rotate-45'
        }`}
      />

      {/* Tiny celebratory sparkle dot when just added */}
      {justPinned && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
        </span>
      )}
    </button>
  );
}
