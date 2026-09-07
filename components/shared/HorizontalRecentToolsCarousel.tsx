'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { ToolDefinition } from '@/lib/types';
import { TOOLS_LIST } from '@/lib/tools-config';
import { ToolIcon } from '@/components/shared/ToolIcon';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';
import { useUserStore } from '@/lib/user/user-store';

interface HorizontalRecentToolsCarouselProps {
  className?: string;
}

const RECENT_LOCALES = {
  en: {
    recentTitle: 'Recently Used',
    viewHistory: 'View History',
    noRecents: 'No recent tools yet. Try any utility below!',
    open: 'Open',
    ready: 'Ready',
  },
  ur: {
    recentTitle: 'حال ہی میں استعمال شدہ',
    viewHistory: 'تمام ہسٹری دیکھیں',
    noRecents: 'ابھی تک کوئی ٹول استعمال نہیں کیا گیا۔ نیچے سے منتخب کریں!',
    open: 'کھولیں',
    ready: 'تیار',
  },
  ar: {
    recentTitle: 'الأدوات المستخدمة مؤخراً',
    viewHistory: 'عرض السجل',
    noRecents: 'لم يتم استخدام أي أداة بعد. جرب إحدى الأدوات أدناه!',
    open: 'فتح',
    ready: 'جاهز',
  },
  hi: {
    recentTitle: 'हाल ही में उपयोग किए गए',
    viewHistory: 'इतिहास देखें',
    noRecents: 'अभी तक कोई टूल उपयोग नहीं किया गया। नीचे दिए टूल्स आज़माएं!',
    open: 'खोलें',
    ready: 'तैयार',
  },
};

export function HorizontalRecentToolsCarousel({ className = '' }: HorizontalRecentToolsCarouselProps) {
  const { language, isRTL } = useI18n();
  const { recentTools: trackedRecents, history } = useUserStore();
  const loc = RECENT_LOCALES[language] || RECENT_LOCALES.en;

  // Resolve user's recent tools dynamically with persistent fallback
  const recentToolIds = Array.from(new Set(history.map((h) => h.url.replace('/tools/', ''))));
  
  const resolvedRecentTools: ToolDefinition[] = (
    trackedRecents && trackedRecents.length > 0
      ? trackedRecents
          .map((r) => TOOLS_LIST.find((t) => t.id === r.toolId || t.slug === r.toolId))
          .filter((t): t is ToolDefinition => Boolean(t))
      : TOOLS_LIST.filter((tool) =>
          recentToolIds.includes(tool.id) || recentToolIds.includes(tool.slug)
        )
  ).slice(0, 10);

  if (resolvedRecentTools.length === 0) {
    return null;
  }

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3 ${className}`}
      aria-label={loc.recentTitle}
    >
      {/* Header with Title and Link */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {loc.recentTitle}
          </h2>
          <span className="px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-black">
            {resolvedRecentTools.length}
          </span>
        </div>

        <Link
          href="/history"
          className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span>{loc.viewHistory}</span>
          {isRTL ? (
            <ArrowLeft className="w-3 h-3 text-brand-600 dark:text-brand-400" />
          ) : (
            <ArrowRight className="w-3 h-3 text-brand-600 dark:text-brand-400" />
          )}
        </Link>
      </div>

      {/* Horizontal Elevated Tool Strip (RTL/LTR aware) */}
      <div className="relative">
        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-2 px-1 -mx-1 snap-x snap-mandatory">
          {resolvedRecentTools.map((tool) => {
            const localized = getLocalizedTool(tool, language);
            const localizedCat = getLocalizedCategory(tool.category, language);

            return (
              <Link
                key={`recent-carousel-${tool.id}`}
                href={`/tools/${tool.slug || tool.id}`}
                className="snap-start shrink-0 w-[200px] sm:w-[220px] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] hover:-translate-y-1 active:scale-[0.97] transition-all duration-200 flex flex-col justify-between group overflow-hidden relative"
              >
                {/* Subtle 3D Top Gradient Lip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-brand-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <ToolIcon name={tool.icon} className="w-4 h-4 text-white" />
                    </div>

                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-extrabold uppercase tracking-tight truncate max-w-[90px]">
                      {localizedCat}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {localized.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal">
                      {localized.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Card Action / Indicator Footer */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{loc.ready}</span>
                  </span>

                  <div className="flex items-center gap-0.5 text-brand-600 dark:text-brand-400 group-hover:underline">
                    <span>{loc.open}</span>
                    {isRTL ? (
                      <ChevronLeft className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
