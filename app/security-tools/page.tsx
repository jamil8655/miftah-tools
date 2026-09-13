'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { HashStudio } from '@/components/security/HashStudio';
import { PasswordStudio } from '@/components/security/PasswordStudio';
import { TextCipherStudio } from '@/components/security/TextCipherStudio';
import { Fingerprint, KeyRound, ShieldCheck, Lock, Key } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const SEC_PAGE_LOCALES = {
  en: {
    title: 'Security & Encryption',
    desc: 'SHA checksums, AES-256 text encryption, and strong password generator.',
    tabs: {
      hash: 'SHA Hash',
      cipher: 'AES-256 Cipher',
      password: 'Passwords',
    },
  },
  ur: {
    title: 'سیکیورٹی اور انکرپشن',
    desc: 'SHA چیک سم، AES-256 ٹیکسٹ انکرپشن اور پاس ورڈ جنریٹر۔',
    tabs: {
      hash: 'SHA ہیش',
      cipher: 'AES-256 انکرپشن',
      password: 'پاس ورڈ',
    },
  },
  ar: {
    title: 'الأمان والتشفير',
    desc: 'بصمة الملفات SHA، تشفير النصوص AES-256، ومولد كلمات المرور.',
    tabs: {
      hash: 'بصمة SHA',
      cipher: 'تشفير AES-256',
      password: 'كلمات المرور',
    },
  },
  hi: {
    title: 'सुरक्षा व एन्क्रिप्शन',
    desc: 'SHA चेकसम, AES-256 टेक्स्ट एन्क्रिप्शन और मजबूत पासवर्ड जनरेटर।',
    tabs: {
      hash: 'SHA हैश',
      cipher: 'AES-256 सिफर',
      password: 'पासवर्ड',
    },
  },
};

export default function SecurityToolsPage() {
  const { language } = useI18n();
  const loc = SEC_PAGE_LOCALES[language as keyof typeof SEC_PAGE_LOCALES] || SEC_PAGE_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'hash' | 'cipher' | 'password'>('hash');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: loc.title }]} />

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          {loc.desc}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('hash')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'hash'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>{loc.tabs.hash}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cipher')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'cipher'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{loc.tabs.cipher}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === 'password'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{loc.tabs.password}</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        {activeTab === 'hash' && <HashStudio />}
        {activeTab === 'cipher' && <TextCipherStudio />}
        {activeTab === 'password' && <PasswordStudio />}
      </div>
    </div>
  );
}
