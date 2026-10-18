'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useUserStore } from '@/lib/user/user-store';
import { TOOLS_LIST } from '@/lib/tools-config';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedTool } from '@/lib/i18n/catalog-translations';

export interface FavoriteButtonProps {
  toolId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'pill' | 'button';
  directNavigate?: boolean;
}

const FAV_LOCALES = {
  en: { add: 'Favorite', saved: 'Favorited' },
  ur: { add: 'پسندیدہ میں شامل کریں', saved: 'پسندیدہ' },
  ar: { add: 'إضافة للمفضلة', saved: 'مفضل' },
  hi: { add: 'पसंदीदा में जोड़ें', saved: 'पसंदीदा' },
};

export function FavoriteButton({
  toolId,
  className = '',
  size = 'md',
  variant = 'icon',
}: FavoriteButtonProps) {
  const { language } = useI18n();
  const { isFavorite, toggleFavorite, isToolPinned, togglePinTool } = useUserStore();
  const loc = FAV_LOCALES[language as keyof typeof FAV_LOCALES] || FAV_LOCALES.en;

  const tool = TOOLS_LIST.find((t) => t.id === toolId || t.slug === toolId);
  const localized = tool ? getLocalizedTool(tool, language) : null;
  const resolvedName = localized?.name || tool?.name || toolId;

  const favorited = isFavorite(toolId) || isToolPinned(toolId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic(favorited ? 'light' : 'success');

    togglePinTool(toolId);
    toggleFavorite({
      id: toolId,
      type: 'tool',
      title: resolvedName,
      category: tool?.category || 'utility',
      url: `/tools/${tool?.slug || toolId}`,
      iconName: tool?.icon || 'tool',
    });
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  if (variant === 'pill' || variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={favorited ? loc.saved : loc.add}
        title={favorited ? loc.saved : loc.add}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
          favorited
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        } ${className}`}
      >
        <Star className={`${iconSize} ${favorited ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
        <span>{favorited ? loc.saved : loc.add}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={favorited ? loc.saved : loc.add}
      title={favorited ? loc.saved : loc.add}
      className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none active:scale-75 ${
        favorited
          ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
    >
      <Star className={`${iconSize} ${favorited ? 'fill-amber-500 text-amber-500 scale-110' : ''} transition-transform`} />
    </button>
  );
}
