'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Wrench, Filter } from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ToolCard } from '@/components/shared/ToolCard';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedCategory, getLocalizedTool } from '@/lib/i18n/catalog-translations';

const TOOLS_PAGE_LOCALES = {
  en: {
    title: 'All Document & Productivity Utilities',
    subtitle: 'Fast, private and client-side processing utilities with zero cloud uploads.',
    searchPlaceholder: 'Search within 220+ tools...',
    allToolsBadge: (count: number) => `All Tools (${count})`,
    noToolsFound: (query: string) => `No tools found matching "${query}"`,
    noToolsHint: 'Try checking another category or clearing your search.',
    clearSearch: 'Clear Search',
    loading: 'Loading tools directory...',
  },
  ur: {
    title: 'تمام دستاویز اور پیداواری ٹولز',
    subtitle: 'تیز، محفوظ اور کلائنٹ سائیڈ پروسیسنگ ٹولز، بغیر کسی کلاؤڈ اپلوڈ کے۔',
    searchPlaceholder: '220+ ٹولز میں تلاش کریں...',
    allToolsBadge: (count: number) => `تمام ٹولز (${count})`,
    noToolsFound: (query: string) => `"${query}" سے ملتا جلتا کوئی ٹول نہیں ملا`,
    noToolsHint: 'کوئی دوسری کیٹیگری منتخب کریں یا تلاش ختم کریں۔',
    clearSearch: 'تلاش صاف کریں',
    loading: 'ٹولز ڈائرکٹری لوڈ ہو رہی ہے...',
  },
  ar: {
    title: 'جميع أدوات المستندات والإنتاجية',
    subtitle: 'أدوات معالجة محلية وسريعة وآمنة تماماً بدون أي رفع للملفات على السحابة.',
    searchPlaceholder: 'بحث في أكثر من 220+ أداة...',
    allToolsBadge: (count: number) => `جميع الأدوات (${count})`,
    noToolsFound: (query: string) => `لم يتم العثور على أدوات تطابق "${query}"`,
    noToolsHint: 'يرجى تجربة تصنيف آخر أو مسح عبارة البحث.',
    clearSearch: 'مسح البحث',
    loading: 'جاري تحميل دليل الأدوات...',
  },
  hi: {
    title: 'सभी दस्तावेज़ व उत्पादकता टूल्स',
    subtitle: 'तेज़, सुरक्षित और क्लाइंट-साइड प्रोसेसिंग टूल्स, बिना किसी क्लाउड अपलोड के।',
    searchPlaceholder: '220+ टूल्स में खोजें...',
    allToolsBadge: (count: number) => `सभी टूल्स (${count})`,
    noToolsFound: (query: string) => `"${query}" से मेल खाता कोई टूल नहीं मिला`,
    noToolsHint: 'कृपया कोई अन्य श्रेणी चुनें या खोज साफ़ करें।',
    clearSearch: 'खोज साफ़ करें',
    loading: 'टूल्स निर्देशिका लोड हो रही है...',
  },
};

function ToolsDirectory() {
  const { t, language, isRTL } = useI18n();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const loc = TOOLS_PAGE_LOCALES[language] || TOOLS_PAGE_LOCALES.en;

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const localized = getLocalizedTool(tool, language);
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      localized.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localized.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tg) => tg.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24"
    >
      <div className="hidden sm:block">
        <Breadcrumbs items={[{ label: t.allTools || loc.allToolsBadge(TOOLS_LIST.length) }]} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>{loc.title}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-mono">({TOOLS_LIST.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {loc.subtitle}
          </p>
        </div>

        {/* Search bar inside tools directory */}
        <div className="relative w-full md:w-80">
          <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={loc.searchPlaceholder}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500/30 shadow-xs`}
          />
        </div>
      </div>

      {/* Android Horizontal Category Chips Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shrink-0 active:scale-95 shadow-xs ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {loc.allToolsBadge(TOOLS_LIST.length)}
        </button>
        {CATEGORIES_CONFIG.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shrink-0 active:scale-95 shadow-xs ${
              activeCategory === cat.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {getLocalizedCategory(cat.id, language)}
          </button>
        ))}
      </div>

      {/* Tools Cards Grid */}
      {filteredTools.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{loc.noToolsFound(searchQuery)}</p>
          <p className="text-xs text-slate-400">{loc.noToolsHint}</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            {loc.clearSearch}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredTools.map((tool, idx) => (
              <React.Fragment key={tool.id}>
                <ToolCard tool={tool} />
                {(idx + 1) % 12 === 0 && <NativeFeedAd />}
              </React.Fragment>
            ))}
          </div>

          <AdSlot placement="in-feed" />
        </>
      )}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading tools directory...</div>}>
      <ToolsDirectory />
    </Suspense>
  );
}
