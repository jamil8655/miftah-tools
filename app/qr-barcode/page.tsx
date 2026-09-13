'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { QrGenerator } from '@/components/qr/QrGenerator';
import { BarcodeStudio } from '@/components/qr/BarcodeStudio';
import { QrCode, Barcode } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const QR_PAGE_LOCALES = {
  en: {
    title: 'QR Code & Barcode',
    desc: 'Generate custom styled QR codes and barcodes with instant download.',
    tabs: {
      qr: 'QR Code',
      barcode: 'Barcode',
    },
  },
  ur: {
    title: 'کیو آر اور بارکوڈ',
    desc: 'اسٹائلش QR کوڈز اور بارکوڈز بنائیں اور ڈاؤن لوڈ کریں۔',
    tabs: {
      qr: 'کیو آر کوڈ',
      barcode: 'بارکوڈ',
    },
  },
  ar: {
    title: 'رمز QR والباركود',
    desc: 'توليد رموز QR والباركود بدقة عالية وتنزيل فوري.',
    tabs: {
      qr: 'رمز QR',
      barcode: 'الباركود',
    },
  },
  hi: {
    title: 'क्यूआर और बारकोड',
    desc: 'कस्टम स्टाइल वाले क्यूआर कोड और बारकोड जनरेट करें।',
    tabs: {
      qr: 'QR कोड',
      barcode: 'बारकोड',
    },
  },
};

export default function QrBarcodePage() {
  const { language } = useI18n();
  const loc = QR_PAGE_LOCALES[language as keyof typeof QR_PAGE_LOCALES] || QR_PAGE_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>('qr');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: 'Utilities', href: '/tools' }, { label: loc.title }]} />

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          {loc.desc}
        </p>
      </div>

      {/* Selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{loc.tabs.qr}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'barcode'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>{loc.tabs.barcode}</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        {activeTab === 'qr' ? <QrGenerator /> : <BarcodeStudio />}
      </div>
    </div>
  );
}
