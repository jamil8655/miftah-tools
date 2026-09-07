'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

const BREADCRUMB_LOCALES = {
  en: { back: 'Back', backAria: 'Go back' },
  ur: { back: 'واپس', backAria: 'پیچھے جائیں' },
  ar: { back: 'رجوع', backAria: 'الرجوع للخلف' },
  hi: { back: 'वापस', backAria: 'पीछे जाएं' },
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter();
  const { t, language, isRTL } = useI18n();
  const loc = BREADCRUMB_LOCALES[language] || BREADCRUMB_LOCALES.en;

  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold shadow-xs active:scale-95 transition-all"
          aria-label={loc.backAria}
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{loc.back}</span>
        </button>

        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 rtl:space-x-reverse" aria-label="Breadcrumb">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav.home}</span>
          </Link>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[140px] sm:max-w-none">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
}
