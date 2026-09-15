'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { StorageUnitConverter } from '@/components/calculators/StorageUnitConverter';
import { BandwidthCalculator } from '@/components/calculators/BandwidthCalculator';
import { DpiCalculator } from '@/components/calculators/DpiCalculator';
import { MathCalculators } from '@/components/calculators/MathCalculators';
import { FinancialLoanCalculators } from '@/components/calculators/FinancialLoanCalculators';
import { StandardCalculatorStudio } from '@/components/calculators/StandardCalculatorStudio';
import { GeneralUnitConverter } from '@/components/calculators/GeneralUnitConverter';
import { Binary, Activity, Printer, Calculator, Scale, Coins, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const CALC_PAGE_LOCALES = {
  en: {
    title: 'Digital Calculators & Unit Converter Suite',
    desc: 'High-precision utilities: Daily Standard Calculator, Loan & EMI, GST/Tax, Profit Margins, Aspect ratio scaler, storage units, download ETA, and unit conversions.',
    tabs: {
      standard: 'Daily Calculator',
      finance: 'Financial & Loan / GST',
      math: 'Aspect Ratio & Math',
      storage: 'Storage Units (MB/GB)',
      units: 'General Unit Converter',
      bandwidth: 'Download ETA',
      dpi: 'Print DPI',
    },
  },
  ur: {
    title: 'ڈیجیٹل کیلکولیٹرز اور یونٹ کنورٹر سوٹ',
    desc: 'انتہائی درست ٹولز: روزمرہ عام کیلکولیٹر، قرض اور قسط (EMI)، جی ایس ٹی، منافع کا مارجن، اسپیکٹ ریشو، اسٹوریج یونٹس، اور عام یونٹس کنورٹر۔',
    tabs: {
      standard: 'روزمرہ کیلکولیٹر',
      finance: 'مالیات، قرض اور جی ایس ٹی',
      math: 'اسپیکٹ ریشو اور حساب',
      storage: 'اسٹوریج یونٹس (MB/GB)',
      units: 'عام یونٹس کنورٹر',
      bandwidth: 'ڈاؤن لوڈ ٹائم',
      dpi: 'پرنٹ ڈی پی آئی',
    },
  },
  ar: {
    title: 'حاسبات ومحولات الوحدات الرقمية',
    desc: 'أدوات رقمية دقيقة: الحاسبة اليومية القياسية، القروض والأقساط، ضريبة القيمة المضافة، نسبة الأبعاد، وحدات التخزين، وتحويل المقاييس.',
    tabs: {
      standard: 'الحاسبة اليومية',
      finance: 'المالية والقروض والضرائب',
      math: 'نسب الأبعاد والرياضيات',
      storage: 'وحدات التخزين (ميجابايت/جيجابايت)',
      units: 'محول الوحدات العام',
      bandwidth: 'وقت التحميل والتنزيل',
      dpi: 'دقة الطباعة DPI',
    },
  },
  hi: {
    title: 'डिजिटल कैलकुलेटर और यूनिट कनवर्टर सुइट',
    desc: 'उच्च-सटीक टूल्स: रोजमर्रा मानक कैलकुलेटर, लोन व ईएमआई, जीएसटी व टैक्स, लाभ मार्जिन, आस्पेक्ट रेश्यो स्केलर, स्टोरेज यूनिट्स, और यूनिट रूपांतरण।',
    tabs: {
      standard: 'रोजमर्रा कैलकुलेटर',
      finance: 'वित्तीय, लोन और जीएसटी',
      math: 'आस्पेक्ट रेश्यो और गणित',
      storage: 'स्टोरेज यूनिट्स (MB/GB)',
      units: 'सामान्य यूनिट कनवर्टर',
      bandwidth: 'डाउनलोड समय (ETA)',
      dpi: 'प्रिंट DPI',
    },
  },
};

export default function CalculatorsPage() {
  const { language } = useI18n();
  const loc = CALC_PAGE_LOCALES[language as keyof typeof CALC_PAGE_LOCALES] || CALC_PAGE_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'standard' | 'finance' | 'math' | 'storage' | 'units' | 'bandwidth' | 'dpi'>('standard');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Utilities', href: '/tools' }, { label: loc.title }]} />

      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2.5">
          <Calculator className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>{loc.title}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {loc.desc}
        </p>
      </div>

      {/* Mobile Touch Responsive Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {[
            { id: 'standard', label: loc.tabs.standard, icon: Calculator },
            { id: 'finance', label: loc.tabs.finance, icon: Coins },
            { id: 'math', label: loc.tabs.math, icon: Zap },
            { id: 'storage', label: loc.tabs.storage, icon: Binary },
            { id: 'units', label: loc.tabs.units, icon: Scale },
            { id: 'bandwidth', label: loc.tabs.bandwidth, icon: Activity },
            { id: 'dpi', label: loc.tabs.dpi, icon: Printer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
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

      {/* Main Studio Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        {activeTab === 'standard' && <StandardCalculatorStudio />}
        {activeTab === 'finance' && <FinancialLoanCalculators />}
        {activeTab === 'math' && <MathCalculators />}
        {activeTab === 'storage' && <StorageUnitConverter />}
        {activeTab === 'units' && <GeneralUnitConverter />}
        {activeTab === 'bandwidth' && <BandwidthCalculator />}
        {activeTab === 'dpi' && <DpiCalculator />}
      </div>
    </div>
  );
}
