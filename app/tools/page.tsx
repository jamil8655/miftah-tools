'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Wrench, Filter, Sparkles, X } from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ToolCard } from '@/components/shared/ToolCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedCategory, getLocalizedTool } from '@/lib/i18n/catalog-translations';
import { triggerHaptic } from '@/lib/motion/motion-system';

const TOOLS_PAGE_LOCALES = {
  en: {
    badge: '220+ Digital Tools',
    title: 'All Digital Tools & Utilities',
    subtitle: 'Convert, edit, compress and create with fast, privacy-focused tools designed for everyday digital work.',
    searchPlaceholder: 'Search 220+ tools by name or format...',
    allToolsBadge: 'All Tools',
    noToolsFound: (query: string) => `No tools found matching "${query}"`,
    noToolsHint: 'Try checking another category or clearing your search.',
    clearSearch: 'Clear Search',
    loading: 'Loading tools directory...',
  },
  ur: {
    badge: '220+ ڈیجیٹل ٹولز',
    title: 'تمام ڈیجیٹل ٹولز اور یوٹیلیٹیز',
    subtitle: 'روزمرہ کے کام کے لیے تیز رفتار، نجی اور جدید ٹولز کے ذریعے فائلیں تبدیل کریں اور ایڈٹ کریں۔',
    searchPlaceholder: '220+ ٹولز تلاش کریں نام یا فارمیٹ سے...',
    allToolsBadge: 'تمام ٹولز',
    noToolsFound: (query: string) => `"${query}" سے ملتا جلتا کوئی ٹول نہیں ملا`,
    noToolsHint: 'کوئی دوسری کیٹیگری منتخب کریں یا تلاش ختم کریں۔',
    clearSearch: 'تلاش صاف کریں',
    loading: 'ٹولز ڈائرکٹری لوڈ ہو رہی ہے...',
  },
  ar: {
    badge: '220+ أداة رقمية',
    title: 'جميع الأدوات والخدمات الرقمية',
    subtitle: 'أدوات سريعة وآمنة ومصممة للعمل اليومي المتقن دون الحاجة لرفع الملفات إلى خوادم خارجية.',
    searchPlaceholder: 'ابحث في 220+ أداة بالاسم أو الصيغة...',
    allToolsBadge: 'جميع الأدوات',
    noToolsFound: (query: string) => `لم يتم العثور على أدوات تطابق "${query}"`,
    noToolsHint: 'يرجى تجربة تصنيف آخر أو مسح عبارة البحث.',
    clearSearch: 'مسح البحث',
    loading: 'جاري تحميل دليل الأدوات...',
  },
  hi: {
    badge: '220+ डिजिटल टूल्स',
    title: 'सभी डिजिटल टूल्स व यूटिलिटीज',
    subtitle: 'फ़ाइलें कन्वर्ट, एडिट, कंप्रेस और क्रिएट करें — रोज़मर्रा के डिजिटल काम के लिए तेज़ और सुरक्षित टूल्स।',
    searchPlaceholder: '220+ टूल्स खोजें नाम या फ़ॉर्मेट के अनुसार...',
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

      {/* Clean Modern Hero Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c1017] border border-[#E1E7EC] dark:border-slate-800/80 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0B79B7]/10 dark:bg-[#0B79B7]/20 text-[#0B79B7] dark:text-[#38a8f8] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#0B79B7]/10 text-[#0B79B7] dark:text-[#38a8f8] border border-[#0B79B7]/20">
                <Sparkles className="w-3 h-3 text-[#0B79B7] dark:text-[#38a8f8]" />
                <span>{loc.badge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#182230] dark:text-white">
                {loc.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 font-normal leading-relaxed max-w-xl">
                {loc.subtitle}
              </p>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8] pointer-events-none`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={loc.searchPlaceholder}
              className={`w-full ${isRTL ? 'pr-10 pl-9' : 'pl-10 pr-9'} py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-[#F5F7F9] dark:bg-slate-900 border border-[#E1E7EC] dark:border-slate-800 text-[#182230] dark:text-white placeholder:text-[#687587] focus:outline-none focus:border-[#0B79B7] focus:bg-white dark:focus:bg-slate-900 transition-all shadow-xs`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1 text-[#687587] hover:text-[#182230] dark:hover:text-white cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Category Chips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-xs cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#0B79B7] text-white shadow-sm shadow-[#0B79B7]/20'
              : 'bg-white dark:bg-slate-900 text-[#687587] dark:text-slate-300 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/40 hover:text-[#182230]'
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
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0B79B7] text-white shadow-sm shadow-[#0B79B7]/20'
                  : 'bg-white dark:bg-slate-900 text-[#687587] dark:text-slate-300 border border-[#E1E7EC] dark:border-slate-800 hover:border-[#0B79B7]/40 hover:text-[#182230]'
              }`}
            >
              <span>{getLocalizedCategory(cat.id, language)}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#F5F7F9] dark:bg-slate-800 text-[#687587]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Indicator Banner */}
      {activeCategory !== 'all' && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B79B7]/5 dark:bg-[#0B79B7]/10 border border-[#0B79B7]/20 text-[#182230] dark:text-white text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0B79B7] dark:text-[#38a8f8]" />
            <span>
              Showing: <strong className="font-extrabold text-[#0B79B7] dark:text-[#38a8f8]">{getLocalizedCategory(activeCategory, language)}</strong> ({filteredTools.length} tools)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveCategory('all');
            }}
            className="text-[11px] font-bold text-[#0B79B7] dark:text-[#38a8f8] hover:underline px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-[#0B79B7]/20 cursor-pointer"
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
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="pt-8">
            <AdSlot placement="in-feed" />
          </div>
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
