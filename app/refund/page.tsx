'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function RefundPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <CreditCard className="w-3.5 h-3.5" />
            Billing & Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Refund & Billing Policy
          </h1>
          <p className="text-xs text-slate-500">Last updated: September 1, 2026</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Free Core Platform Access</h3>
            <p>
              All 220+ core digital utility tools and educational course materials on Miftah Tools are provided 100% free of charge. No payment details or credit cards are required to access full-featured PDF editing, image processing, OCR, or course preview modules.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Future Paid Tier & Subscription Architecture</h3>
            <p>
              In the future, when premium automated cloud workers, specialized enterprise team workflows, or dedicated support subscriptions are introduced, we will offer a transparent 14-day no-questions-asked refund policy on all eligible purchases.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. How to Request Billing Support</h3>
            <p>
              For any billing inquiries, invoice requests, or payment concerns regarding future premium services, please contact our support team at <strong>support@miftahtools.app</strong> with your registered email and account UID.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Need billing help?</span>
            <Link href="/contact" className="text-xs font-bold text-brand-600 hover:underline">
              Contact Billing Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
