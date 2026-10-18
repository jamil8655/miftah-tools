'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  rightAction?: React.ReactNode;
}

const BREADCRUMB_LOCALES = {
  en: { back: 'Back', backAria: 'Go back' },
  ur: { back: 'واپس', backAria: 'پیچھے جائیں' },
  ar: { back: 'رجوع', backAria: 'الرجوع للخلف' },
  hi: { back: 'वापस', backAria: 'पीछे जाएं' },
};

export function Breadcrumbs({ items, rightAction }: BreadcrumbsProps) {
  const router = useRouter();
  const { t, language, isRTL } = useI18n();
  const loc = BREADCRUMB_LOCALES[language] || BREADCRUMB_LOCALES.en;

  const handleBack = () => {
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/tools');
      }
    } catch (_) {
      router.push('/tools');
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 w-full overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label={loc.backAria}
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="hidden xs:inline">{loc.back}</span>
        </button>

        <nav className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rtl:space-x-reverse min-w-0 truncate" aria-label="Breadcrumb">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.nav.home}</span>
          </Link>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 shrink-0" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate max-w-[70px] sm:max-w-[120px] shrink-0"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate min-w-0 max-w-[85px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-none">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {rightAction && (
        <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 ml-auto">
          {rightAction}
        </div>
      )}
    </div>
  );
}
