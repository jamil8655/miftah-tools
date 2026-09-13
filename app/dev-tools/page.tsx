'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonStudio } from '@/components/dev/JsonStudio';
import { Base64Studio } from '@/components/dev/Base64Studio';
import { TimestampStudio } from '@/components/dev/TimestampStudio';
import { ColorStudio } from '@/components/dev/ColorStudio';
import { DeveloperToolkit } from '@/components/dev/DeveloperToolkit';
import { Code2, FileCode, Clock, Palette, Terminal } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const DEV_PAGE_LOCALES = {
  en: {
    title: 'Developer Tools',
    desc: 'Regex, SQL, CSV/JSON, URL encoder, JSON validator, and Base64.',
    tabs: {
      toolkit: 'Toolkit',
      json: 'JSON Formatter',
      base64: 'Base64',
      timestamp: 'Timestamp',
      color: 'Colors',
    },
  },
  ur: {
    title: 'ڈیولپر ٹولز',
    desc: 'ریجیکس، ایس کیو ایل، CSV/JSON، یو آر ایل اینکوڈر اور بیس64۔',
    tabs: {
      toolkit: 'ٹول کٹ',
      json: 'JSON فارمیٹر',
      base64: 'بیس64',
      timestamp: 'ٹائم اسٹیمپ',
      color: 'کلر',
    },
  },
  ar: {
    title: 'أدوات المطورين',
    desc: 'أدوات Regex، وتنسيق SQL، وتحويل CSV/JSON، وBase64.',
    tabs: {
      toolkit: 'الأدوات',
      json: 'منسق JSON',
      base64: 'Base64',
      timestamp: 'الوقت Unix',
      color: 'الألوان',
    },
  },
  hi: {
    title: 'डेवलपर टूल्स',
    desc: 'रेगेक्स टेस्टर, एसक्यूएल फॉर्मेटर, CSV/JSON और बेस64।',
    tabs: {
      toolkit: 'टूलकिट',
      json: 'JSON फॉर्मेटर',
      base64: 'Base64',
      timestamp: 'टाइमस्टैम्प',
      color: 'कलर',
    },
  },
};

export default function DevToolsPage() {
  const { language } = useI18n();
  const loc = DEV_PAGE_LOCALES[language as keyof typeof DEV_PAGE_LOCALES] || DEV_PAGE_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'toolkit' | 'json' | 'base64' | 'timestamp' | 'color'>('toolkit');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: loc.title }]} />

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <Terminal className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          {loc.desc}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {[
            { id: 'toolkit', label: loc.tabs.toolkit, icon: Terminal },
            { id: 'json', label: loc.tabs.json, icon: Code2 },
            { id: 'base64', label: loc.tabs.base64, icon: FileCode },
            { id: 'timestamp', label: loc.tabs.timestamp, icon: Clock },
            { id: 'color', label: loc.tabs.color, icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        {activeTab === 'toolkit' && <DeveloperToolkit />}
        {activeTab === 'json' && <JsonStudio />}
        {activeTab === 'base64' && <Base64Studio />}
        {activeTab === 'timestamp' && <TimestampStudio />}
        {activeTab === 'color' && <ColorStudio />}
      </div>
    </div>
  );
}
