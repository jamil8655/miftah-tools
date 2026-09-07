'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  GraduationCap,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Code,
  Globe2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function AboutPage() {
  const { t, isRtl } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {t.footer.aboutPlatform}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
            The Privacy-First Digital Utility & Learning Ecosystem
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Miftah Tools bridges the gap between high-performance client-side digital tools and practical engineering education. Transform files instantly with 100% local privacy and master real digital skills.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/tools"
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t.nav.allTools}
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-brand-600" />
              {t.nav.courses}
            </Link>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">100% Client-Side Privacy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every PDF, image, and document is processed directly in your browser using WebAssembly (WASM). Your sensitive files are never uploaded to any remote server.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blazing Fast Execution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Zero network latency on file transformations. Compress, merge, extract text, and calculate at hardware-accelerated speeds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Open Practical Education</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Learn full-stack engineering, AI prompt design, and cybersecurity through real project-based courses with free previews and zero mandatory enrollment locks.
            </p>
          </div>
        </div>

        {/* Feature Capabilities */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              What Powers Miftah Tools?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A modern technology stack designed for privacy, resilience, and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: '220+ Client-Side Tools', desc: 'PDF, Image Studio, OCR, QR/Barcode, Dev Toolkit, and Calculators.' },
              { title: 'WebAssembly (WASM) Engine', desc: 'Native binary execution inside the browser sandbox.' },
              { title: 'Tesseract OCR Vision', desc: 'Multilingual text extraction directly on your GPU/CPU.' },
              { title: 'Offline-Ready PWA', desc: 'Install Miftah Tools as an app on Windows, macOS, Android, and iOS.' },
              { title: 'Firebase Authentication & Claims', desc: 'Enterprise cryptographic role verification and secure state.' },
              { title: 'Full 4-Language Localization', desc: 'Seamless instant switching between English, Urdu, Arabic, and Hindi with RTL.' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white text-center space-y-6 shadow-xl shadow-brand-500/10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to experience next-generation tools & learning?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            All 220+ tools and course curriculums are 100% free and open for everyone. No credit card, no sign-up barrier.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-white text-brand-600 hover:bg-brand-50 font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              Start Using Tools Now
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
