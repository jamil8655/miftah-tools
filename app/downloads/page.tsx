'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { Download, Trash2, FileText, Sparkles, ArrowRight } from 'lucide-react';

export default function DownloadsPage() {
  const { t } = useI18n();
  const { downloads, removeDownload, clearDownloads } = useUserStore();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      <Breadcrumbs items={[{ label: t.userDashboard.downloadsTitle }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.userDashboard.downloadsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.userDashboard.downloadsSubtitle}
          </p>
        </div>
        {downloads.length > 0 && (
          <button
            onClick={clearDownloads}
            className="px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.userDashboard.clearAll}
          </button>
        )}
      </div>

      {downloads.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto">
            <Download className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.userDashboard.noDownloads}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you compress, convert, or generate files using Miftah Tools, your download records will appear here.
          </p>
          <div className="pt-2">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
            >
              <Sparkles className="w-4 h-4" />
              {t.nav.allTools}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.size} • {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => removeDownload(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
