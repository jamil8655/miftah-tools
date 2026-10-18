'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { AddToHomeButton } from './AddToHomeButton';
import { FavoriteButton } from './FavoriteButton';
import { useI18n } from '@/lib/i18n/i18n-context';
import { shareFileNative } from '@/lib/native/android-bridge';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface ToolActionHeaderProps {
  toolId: string;
  toolName: string;
  category?: string;
  icon?: string;
  slug?: string;
  className?: string;
}

const LOCALES = {
  en: { share: 'Share', copied: 'Copied!' },
  ur: { share: 'شیئر کریں', copied: 'کاپی ہو گیا!' },
  ar: { share: 'مشاركة', copied: 'تم النسخ!' },
  hi: { share: 'शेयर करें', copied: 'कॉपी हो गया!' },
};

export function ToolActionHeader({
  toolId,
  toolName,
  category = 'utility',
  icon = 'tool',
  slug,
  className = '',
}: ToolActionHeaderProps) {
  const { language } = useI18n();
  const [shared, setShared] = useState(false);
  const loc = LOCALES[language as keyof typeof LOCALES] || LOCALES.en;

  const handleShare = async () => {
    triggerHaptic('light');
    const path = `/tools/${slug || toolId}`;
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    const title = `${toolName} - Miftah Tools`;
    const text = `Use ${toolName} on Miftah Tools for free:`;

    const success = await shareFileNative(title, text, url);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2 select-none ${className}`}>
      {/* 1. Add to Phone Screen Primary Action Button */}
      <AddToHomeButton
        toolId={toolId}
        toolName={toolName}
        category={category}
        icon={icon}
        variant="pill"
        size="md"
      />

      {/* 2. In-App Favorite Star Pill */}
      <FavoriteButton toolId={toolId} variant="pill" size="md" />

      {/* 3. Share Tool Pill */}
      <button
        type="button"
        onClick={handleShare}
        aria-label={loc.share}
        title={loc.share}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs"
      >
        {shared ? (
          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
        ) : (
          <Share2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        )}
        <span>{shared ? loc.copied : loc.share}</span>
      </button>
    </div>
  );
}
