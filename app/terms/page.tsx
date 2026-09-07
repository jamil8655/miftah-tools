'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500">Last updated: September 1, 2026</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
            <p>
              By accessing, browsing, or using Miftah Tools (including all 220+ client-side digital utility tools, courses, workflows, and developer APIs), you agree to be bound by these Terms of Service. If you do not agree, please do not use the services.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. 100% Free Core Tools & Learning Usage</h3>
            <p>
              All core utility tools and open learning materials provided on Miftah Tools are free for both personal and commercial use. You may convert, compress, edit, calculate, and download your files without subscription requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Client-Side WebAssembly Processing & Ownership</h3>
            <p>
              All file transformations take place locally on your client device using in-browser WebAssembly. You retain 100% full ownership and intellectual property rights over all files, documents, images, and content you process. Miftah Tools does not claim any rights, access, or custody over your data.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Acceptable Use Policy</h3>
            <p>
              You agree not to use Miftah Tools for any illegal, malicious, or abusive activities, including the creation or dissemination of malware, unlawful copyright infringement, or attempting to compromise platform infrastructure.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Limitation of Liability</h3>
            <p>
              Miftah Tools is provided "as is" without warranty of any kind. While our tools undergo rigorous testing for precision and performance, we are not liable for any data loss, transformation inaccuracies, or service interruptions resulting from local device limitations.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Questions about our terms?</span>
            <Link href="/contact" className="text-xs font-bold text-brand-600 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
