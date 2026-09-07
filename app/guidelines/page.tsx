'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function GuidelinesPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <BookOpen className="w-3.5 h-3.5" />
            Community & Safety
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            User & Community Guidelines
          </h1>
          <p className="text-xs text-slate-500">Last updated: September 1, 2026</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Respectful Learning Environment</h3>
            <p>
              Miftah Tools courses and developer tools are built to empower students, engineers, and digital creators globally. Users must engage respectfully in all forum interactions, feedback comments, and code sharing.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Prohibited Content & Abuse</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Do not use tools to generate fraudulent documents, forged identification, or phishing collateral.</li>
              <li>Do not attempt to reverse-engineer closed APIs or exploit vulnerabilities for unauthorized data exfiltration.</li>
              <li>Do not use automated scraping bots that excessively disrupt platform performance for other users.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Ethical Code & AI Usage</h3>
            <p>
              When utilizing AI tools, OCR extractors, and code converters, verify outputs before deploying them into critical production or medical systems. Adhere to academic honesty when submitting coursework.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Report a violation?</span>
            <Link href="/contact" className="text-xs font-bold text-brand-600 hover:underline">
              Contact Trust & Safety
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
