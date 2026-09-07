'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, ChevronDown, ChevronUp, Sparkles, ShieldCheck, FileText, GraduationCap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function FaqPage() {
  const { t, isRtl } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const faqs = [
    {
      q: 'Are all 220+ tools really 100% free with no hidden charges?',
      a: 'Yes, absolutely. All core conversion, PDF manipulation, audio/video downloading, image compression, OCR, and developer utilities are 100% free and open for public use.',
      category: 'General',
    },
    {
      q: 'How does client-side WebAssembly (WASM) protect my privacy?',
      a: 'Unlike traditional web converters that upload your PDFs and photos to unknown third-party cloud servers, Miftah Tools compiles transformation binaries directly into your web browser. Your data never leaves your computer.',
      category: 'Privacy & Security',
    },
    {
      q: 'Is course enrollment compulsory to view course lessons?',
      a: 'No! You can freely browse all curriculums, read lesson overviews, and study course material without any mandatory enrollment. Enrolling is optional and provides personal progress tracking, saved history, and digital completion certificates.',
      category: 'Courses & Learning',
    },
    {
      q: 'Can I install Miftah Tools as an offline desktop or mobile app?',
      a: 'Yes! Miftah Tools is an offline-ready Progressive Web App (PWA). Click the "Install App" button or tap "Add to Home Screen" in your browser menu on Android, iOS, Windows, or macOS.',
      category: 'PWA & Offline',
    },
    {
      q: 'What is the maximum file size supported by Miftah Tools?',
      a: 'Miftah Tools client-side engine supports large files up to 500 MB directly inside your browser memory without crashing.',
      category: 'Tools & Processing',
    },
    {
      q: 'How do I switch the application language to Urdu, Arabic, or Hindi?',
      a: 'Use the language selector dropdown in the top navigation bar or go to Settings ➔ Language. The entire interface, navigation, buttons, and layout direction (RTL/LTR) will update instantly.',
      category: 'Language & Settings',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <HelpCircle className="w-3.5 h-3.5" />
            {t.footer.faq}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to know about Miftah Tools, privacy guarantees, courses, and offline capabilities.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className={`w-full py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqs[idx] !== false;

            return (
              <div
                key={idx}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:px-6 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {faq.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </h3>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions? */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Still have questions?</h4>
          <p className="text-xs text-slate-500">Our support team is always here to assist you.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            {t.footer.contactUs}
          </Link>
        </div>
      </div>
    </div>
  );
}
