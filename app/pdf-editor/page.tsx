'use client';

import React from 'react';
import { VisualPdfEditor } from '@/components/pdf/VisualPdfEditor';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Edit3, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const PAGE_LOCALES = {
  en: {
    badge: 'Live PDF Markup & Editing Studio',
    title: 'PDF Visual Editor & Markup Studio',
    sub: 'Easily add text, signatures, highlights, notes, and official stamps directly on your PDF pages.',
  },
  ur: {
    badge: 'لائیو پی ڈی ایف مارک اپ و ایڈیٹنگ اسٹوڈیو',
    title: 'پی ڈی ایف ایڈیٹر و مارک اپ اسٹوڈیو',
    sub: 'پی ڈی ایف پر متن لکھیں، دستخط بنائیں، ہائی لائٹ کریں، اور سرکاری مہریں آسانی سے لگائیں۔',
  },
  ar: {
    badge: 'استوديو تعديل وملاحظات PDF الحي',
    title: 'محرر مستندات PDF التفاعلي',
    sub: 'أضف نصوصاً وتوقيعات وتظليلاً وملاحظات وأختاماً رسمية على صفحات PDF بسهولة.',
  },
  hi: {
    badge: 'लाइव PDF मार्कअप व एडिटिंग स्टूडियो',
    title: 'PDF विज़ुअल एडिटर व मार्कअप स्टूडियो',
    sub: 'PDF पर टेक्स्ट लिखें, हस्ताक्षर बनाएं, हाइलाइट करें और आधिकारिक स्टैम्प लगाएं।',
  },
};

export default function PdfEditorPage() {
  const { language } = useI18n();
  const loc = PAGE_LOCALES[language as keyof typeof PAGE_LOCALES] || PAGE_LOCALES.en;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: loc.title }]} />

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <Edit3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {loc.sub}
        </p>
      </div>

      <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <VisualPdfEditor />
      </div>
    </div>
  );
}
