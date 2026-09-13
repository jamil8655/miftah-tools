'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { TextStudio } from '@/components/text/TextStudio';
import { TextDiffViewer } from '@/components/text/TextDiffViewer';
import { Type, GitCompare } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const TEXT_PAGE_LOCALES = {
  en: {
    title: 'Text & Writing Tools',
    desc: 'Word counter, case converter, list deduplicator, and text compare diff.',
    tabs: {
      editor: 'Word Counter',
      diff: 'Text Diff',
    },
  },
  ur: {
    title: 'ٹیکسٹ اور تحریری ٹولز',
    desc: 'الفاظ کی گنتی، کیس کنورٹر، ڈپلیکیٹ ہٹائیں اور ٹیکسٹ موازنہ۔',
    tabs: {
      editor: 'ورڈ کاؤنٹر',
      diff: 'ٹیکسٹ موازنہ',
    },
  },
  ar: {
    title: 'أدوات النصوص والكتابة',
    desc: 'إحصائيات الكلمات، تحويل الحالة، إزالة التكرار ومقارنة النصوص.',
    tabs: {
      editor: 'عداد الكلمات',
      diff: 'مقارنة النصوص',
    },
  },
  hi: {
    title: 'टेक्स्ट व लेखन टूल्स',
    desc: 'शब्द गणना, केस रूपांतरण, डुप्लिकेट हटाना और टेक्स्ट तुलना।',
    tabs: {
      editor: 'वर्ड काउंटर',
      diff: 'टेक्स्ट डिफ',
    },
  },
};

export default function TextToolsPage() {
  const { language } = useI18n();
  const loc = TEXT_PAGE_LOCALES[language as keyof typeof TEXT_PAGE_LOCALES] || TEXT_PAGE_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'editor' | 'diff'>('editor');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: loc.title }]} />

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <Type className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          {loc.desc}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>{loc.tabs.editor}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'diff'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>{loc.tabs.diff}</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        {activeTab === 'editor' ? <TextStudio /> : <TextDiffViewer />}
      </div>
    </div>
  );
}
