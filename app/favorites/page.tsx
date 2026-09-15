'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { Bookmark, Trash2, ExternalLink, Wrench, Workflow, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { t } = useI18n();
  const { favorites, removeFavorite } = useUserStore();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      <Breadcrumbs items={[{ label: t.userDashboard.favoritesTitle }]} />

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.userDashboard.favoritesTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t.userDashboard.favoritesSubtitle}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.userDashboard.noFavorites}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bookmark any tool to save it here for fast one-click access.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/tools"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all shadow-xs"
            >
              {t.nav.allTools}
            </Link>
            <Link
              href="/workflows"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
            >
              {t.nav.workflows}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/30 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase">
                    {item.category}
                  </span>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>

              <Link
                href={item.url}
                className="w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t.common.open}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
