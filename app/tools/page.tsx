'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Wrench, Filter, Sparkles, X } from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ToolCard } from '@/components/shared/ToolCard';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { NativeVideoAd } from '@/components/ads/NativeVideoAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedCategory, getLocalizedTool } from '@/lib/i18n/catalog-translations';
import { triggerHaptic } from '@/lib/motion/motion-system';

const TOOLS_PAGE_LOCALES = {
  en: {
    badge: 'Miftah Tools Studio Directory',
    title: 'All Document & Productivity Utilities',
    subtitle: 'High-speed, private, client-side tools running 100% locally on your device with zero cloud uploads.',
    searchPlaceholder: 'Search tools by name or format...',
    allToolsBadge: 'All Tools',
    noToolsFound: (query: string) => `No tools found matching "${query}"`,
    noToolsHint: 'Try checking another category or clearing your search.',
    clearSearch: 'Clear Search',
    loading: 'Loading tools directory...',
  },
  ur: {
    badge: 'مفتاح ٹولز اسٹوڈیو ڈائرکٹری',
    title: 'تمام دستاویز اور پیداواری ٹولز',
    subtitle: 'تیز رفتار اور محفوظ ٹولز، تمام کام 100% آپ کے ڈیوائس کے اندر مکمل رازداری کے ساتھ۔',
    searchPlaceholder: 'ٹول کا نام یا فارمیٹ تلاش کریں...',
    allToolsBadge: 'تمام ٹولز',
    noToolsFound: (query: string) => `"${query}" سے ملتا جلتا کوئی ٹول نہیں ملا`,
    noToolsHint: 'کوئی دوسری کیٹیگری منتخب کریں یا تلاش ختم کریں۔',
    clearSearch: 'تلاش صاف کریں',
    loading: 'ٹولز ڈائرکٹری لوڈ ہو رہی ہے...',
  },
  ar: {
    badge: 'دليل أدوات مفتاح تولز ستوديو',
    title: 'جميع أدوات المستندات والإنتاجية',
    subtitle: 'أدوات معالجة محلية وسريعة وآمنة 100% داخل جهازك وبخصوصية تامة دون اتصال.',
    searchPlaceholder: 'ابحث عن أداة بالاسم أو الصيغة...',
    allToolsBadge: 'جميع الأدوات',
    noToolsFound: (query: string) => `لم يتم العثور على أدوات تطابق "${query}"`,
    noToolsHint: 'يرجى تجربة تصنيف آخر أو مسح عبارة البحث.',
    clearSearch: 'مسح البحث',
    loading: 'جاري تحميل دليل الأدوات...',
  },
  hi: {
    badge: 'मिफ़्ताह टूल्स स्टूडियो डायरेक्टरी',
    title: 'सभी दस्तावेज़ व उत्पादकता टूल्स',
    subtitle: 'तेज़ व सुरक्षित ऑन-डिवाइस टूल्स, शत-प्रतिशत गोपनीयता के साथ आपके डिवाइस में कार्यरत।',
    searchPlaceholder: 'नाम या फ़ॉर्मेट से टूल खोजें...',
    allToolsBadge: 'सभी टूल्स',
    noToolsFound: (query: string) => `"${query}" से मेल खाता कोई टूल नहीं मिला`,
    noToolsHint: 'कृपया कोई अन्य श्रेणी चुनें या खोज साफ़ करें।',
    clearSearch: 'खोज साफ़ करें',
    loading: 'टूल्स निर्देशिका लोड हो रही है...',
  },
};

function ToolsDirectory() {
  const { t, language, isRTL } = useI18n();
  const searchParams = useSearchParams();
  const urlCat = searchParams.get('cat');

  const [activeCategory, setActiveCategory] = useState<string>(urlCat || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const loc = TOOLS_PAGE_LOCALES[language] || TOOLS_PAGE_LOCALES.en;

  // Restore category, search, and scroll position when returning back from a tool
  React.useEffect(() => {
    try {
      if (!urlCat) {
        const savedCat = sessionStorage.getItem('miftah_tools_category');
        if (savedCat && (savedCat === 'all' || CATEGORIES_CONFIG.some((c) => c.id === savedCat))) {
          setActiveCategory(savedCat);
        }
      }

      const savedSearch = sessionStorage.getItem('miftah_tools_search');
      if (savedSearch) {
        setSearchQuery(savedSearch);
      }

      const lastToolId = sessionStorage.getItem('miftah_last_clicked_tool');
      const savedScroll = sessionStorage.getItem('miftah_tools_scroll');

      if (lastToolId) {
        const timer = setTimeout(() => {
          const el = document.getElementById(`tool-card-${lastToolId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.02]');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.02]');
            }, 2500);
          } else if (savedScroll) {
            window.scrollTo({ top: parseInt(savedScroll, 10) || 0, behavior: 'smooth' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    } catch (_) {}
  }, [urlCat]);

  // Save scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      try {
        sessionStorage.setItem('miftah_tools_scroll', window.scrollY.toString());
      } catch (_) {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryChange = (cat: string) => {
    triggerHaptic('selection');
    setActiveCategory(cat);
    try {
      sessionStorage.setItem('miftah_tools_category', cat);
    } catch (_) {}
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    try {
      sessionStorage.setItem('miftah_tools_search', val);
    } catch (_) {}
  };

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
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-7 pb-24"
    >
      <div className="hidden sm:block">
        <Breadcrumbs items={[{ label: t.allTools || loc.allToolsBadge }]} />
      </div>

      {/* Premium Hero Identity & Search Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 p-5 sm:p-7 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-0.5 shadow-xl shadow-brand-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                <Wrench className="w-6 h-6 text-brand-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>{loc.badge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {loc.title}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300/90 font-normal leading-relaxed max-w-xl">
                {loc.subtitle}
              </p>
            </div>
          </div>

          {/* Search bar inside hero card */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={loc.searchPlaceholder}
              className={`w-full ${isRTL ? 'pr-10 pl-8' : 'pl-10 pr-8'} py-2.5 text-xs rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/50 shadow-inner`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Android Horizontal Category Chips Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shrink-0 active:scale-95 shadow-xs ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {loc.allToolsBadge}
        </button>
        {CATEGORIES_CONFIG.map((cat) => {
          const count = TOOLS_LIST.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shrink-0 active:scale-95 shadow-xs flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{getLocalizedCategory(cat.id, language)}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Indicator Banner */}
      {activeCategory !== 'all' && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 text-brand-900 dark:text-brand-200 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>
              Showing: <strong className="font-black text-brand-700 dark:text-brand-300">{getLocalizedCategory(activeCategory, language)}</strong> ({filteredTools.length} tools)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveCategory('all');
            }}
            className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800"
          >
            Show All
          </button>
        </div>
      )}

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
                {(idx + 1) % 24 === 12 && <NativeFeedAd />}
                {(idx + 1) % 24 === 0 && <NativeVideoAd />}
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
