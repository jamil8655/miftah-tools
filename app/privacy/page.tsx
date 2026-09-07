'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, UserX, Trash2, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google Play Policy & Privacy Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy & Data Safety
          </h1>
          <p className="text-xs text-slate-500">Last updated & verified: September 2026</p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Highlight Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Core Policy: 100% In-Device Memory Processing</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              When you convert a PDF, compress an image, or format code on Miftah Tools, the processing executes 100% locally in your device&apos;s sandboxed memory using client-side WebAssembly and JavaScript engines. Your documents never leave your phone and are never stored on external servers.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Do NOT Collect</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>We do NOT collect, inspect, or copy your uploaded documents, images, audio, or PDFs.</li>
              <li>We do NOT track your device location or scan your contacts.</li>
              <li>We do NOT store unencrypted passwords.</li>
              <li>We do NOT sell, rent, or monetize your personal information with data brokers or third parties.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Information Collected for Authentication</h3>
            <p>
              If you optionally create an account, we store minimal profile details (email address, full name, profile picture) securely via Google Firebase Authentication. This information is strictly used to authenticate your session, sync your learning progress, and protect your custom tool preferences.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Local Storage & Device Preferences</h3>
            <p>
              We use your device&apos;s local storage to save your UI preferences (dark/light theme, language selection: English, Urdu, Arabic, Hindi, and bookmarked favorite tools). This data remains on your local machine and can be erased anytime.
            </p>
          </section>

          {/* Section 4: Google Play Account & Data Deletion Compliance */}
          <section className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <UserX className="w-4 h-4 text-rose-500" />
              <span>4. Account & Data Deletion (Google Play Compliance / खाता और डेटा हटाने की नीति)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              In accordance with Google Play Developer Policies and global data privacy standards, all users have the absolute right to completely and permanently delete their account and all associated cloud and device data at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <strong>In-App Deletion (तुरंत खाता हटाएं):</strong> Open the <strong>Account / Profile</strong> tab inside the Miftah Tools app and tap <strong>&quot;Delete Account &amp; Wipe Data&quot;</strong>. This immediately purges your Firebase authentication record, synced profile, and all locally cached files in one tap.
              </li>
              <li>
                <strong>Web Deletion Request (ईमेल द्वारा अनुरोध):</strong> If you have uninstalled the application or cannot access your account, you can submit an instant data deletion request by emailing our team directly at <a href="mailto:jrahmanansari132@gmail.com" className="font-mono text-brand-600 dark:text-brand-400 font-bold underline">jrahmanansari132@gmail.com</a> with the subject <em>&quot;Account &amp; Data Deletion Request - Miftah Tools&quot;</em>. All records will be wiped within 24 hours.
              </li>
              <li>
                <strong>Official Privacy Policy URL:</strong> <a href="https://jamil8655.github.io/miftahi-tools/privacy" target="_blank" rel="noopener noreferrer" className="font-mono text-brand-600 dark:text-brand-400 underline">https://jamil8655.github.io/miftahi-tools/privacy</a>
              </li>
              <li>
                <strong>What is Purged:</strong> Your Firebase account credentials, authentication tokens, course enrollment records, saved favorites, notification history, and all locally cached metadata are permanently erased.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Security Standards</h3>
            <p>
              All network communications are strictly enforced via HTTPS (TLS 1.3) encryption. Cleartext HTTP traffic is disabled. No privileged service accounts or private secrets are bundled into client-side Android applications.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Support &amp; Privacy Contact:</span>
            <a href="mailto:jrahmanansari132@gmail.com" className="text-xs font-bold text-brand-600 hover:underline">
              jrahmanansari132@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
