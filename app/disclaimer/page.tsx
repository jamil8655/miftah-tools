'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function DisclaimerPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Legal Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Legal & Technical Disclaimer
          </h1>
          <p className="text-xs text-slate-500">Last updated: September 1, 2026</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Educational & General Purpose Use</h3>
            <p>
              The digital utility tools, code generators, calculations, and course lessons provided by Miftah Tools are intended for educational, technical, and general utility purposes only. While our engines use state-of-the-art WebAssembly algorithms, outputs should be independently validated.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. No Legal or Financial Advice</h3>
            <p>
              Calculations (including mortgage, tax, timestamp, and unit conversions) provided within our calculation modules do not constitute financial, legal, or investment advice. Always consult a certified professional for binding transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Third-Party Media & Trademarks</h3>
            <p>
              All trademarks, product names, and company logos cited within course materials or tool documentation are the property of their respective owners. Miftah Tools is an independent platform.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Questions?</span>
            <Link href="/contact" className="text-xs font-bold text-brand-600 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
