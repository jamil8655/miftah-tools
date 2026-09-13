'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Zap,
  FileText,
  Minimize2,
  Combine,
  Image as ImageIcon,
  ScanText,
  QrCode,
  Layers,
  FileCheck,
  Type,
  Video,
  Bookmark,
  Brain,
  Calculator,
  Terminal,
  ShieldCheck,
  Search,
  X,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { ToolCard } from '@/components/shared/ToolCard';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';

const categoryIconMap: Record<string, React.ElementType> = {
  pdf: FileText,
  document: FileCheck,
  image: ImageIcon,
  ocr: ScanText,
  text: Type,
  compress: Minimize2,
  security: ShieldCheck,
  media: Video,
  calculator: Calculator,
  dev: Terminal,
  qr: QrCode,
  ai: Brain,
};

const PAGE_LOCALES = {
  en: {
    heroBadge: '✨ 220+ Free Tools & Master Courses',
    heroTitle: 'Fast, Private & Free Online Utilities',
    heroSubtitle: 'Transform documents, convert images, optimize media, format code, and master skills — 100% private in your browser.',
    searchPlaceholder: 'Search 220+ tools (e.g. PDF to Word, OCR, Compress, QR)...',
    clearSearch: 'Clear',
    allToolsTab: 'All Tools',
    frequentTools: 'Popular Quick Actions',
    browseByCategory: 'Browse by Category',
    directoryTitle: 'Tools Directory',
    toolsCount: (count: number) => `${count} tools`,
    noToolsFound: 'No tools found matching your search.',
    resetFilters: 'Reset filters',
    coursesTitle: 'Featured Master Courses',
    coursesSubtitle: 'Free, open curriculums with practical interactive projects.',
    viewAllCourses: 'Explore All Courses →',
    viewAllTools: 'View All 220+ Tools Directory →',
    trustPrivate: '100% In-Browser Privacy',
    trustPrivateDesc: 'Files never leave your device',
    trustEngine: '500 MB WASM Engine',
    trustEngineDesc: 'Ultra-fast local processing',
    trustFree: 'Zero Sign-In Required',
    trustFreeDesc: 'Instant, free unlimited access',
    bookmarked: (count: number) => `Bookmarked Tools (${count})`,
    manageBookmarks: 'Manage Bookmarks →',
  },
  ur: {
    heroBadge: '✨ 220+ مفت آن لائن ٹولز اور تعلیمی کورسز',
    heroTitle: 'مفت، تیز اور مکمل نجی آن لائن ٹولز',
    heroSubtitle: 'دستاویزات میں ترمیم، تصاویر کی تبدیلی، میڈیا آپٹیمائزیشن اور پروگرامنگ اسکلز — بغیر کسی سرور اپلوڈ کے براہِ راست براؤزر میں۔',
    searchPlaceholder: '220+ ٹولز تلاش کریں (مثلاً پی ڈی ایف، امیج، او سی آر، کیو آر)...',
    clearSearch: 'صاف کریں',
    allToolsTab: 'تمام ٹولز',
    frequentTools: 'مقبول ترین ٹولز',
    browseByCategory: 'اقسام کے لحاظ سے دیکھیں',
    directoryTitle: 'ٹولز ڈائرکٹری',
    toolsCount: (count: number) => `${count} ٹولز`,
    noToolsFound: 'آپ کی تلاش کے مطابق کوئی ٹول نہیں ملا۔',
    resetFilters: 'فلٹرز ری سیٹ کریں',
    coursesTitle: 'نمایاں ماسٹر کورسز',
    coursesSubtitle: 'مفت اور کھلے نصاب کے ساتھ جدید پریکٹیکل پروجیکٹس۔',
    viewAllCourses: 'تمام کورسز دیکھیں ←',
    viewAllTools: 'تمام 220+ ٹولز ڈائرکٹری دیکھیں ←',
    trustPrivate: '100% مکمل مقامی رازداری',
    trustPrivateDesc: 'فائلیں آپ کے ڈیوائس پر ہی رہتی ہیں',
    trustEngine: '500 ایم بی لوکل انجن',
    trustEngineDesc: 'بغیر انتظار تیز ترین پروسیسنگ',
    trustFree: 'بغیر سائن ان مکمل رسائی',
    trustFreeDesc: 'مفت اور لامحدود استعمال',
    bookmarked: (count: number) => `محفوظ شدہ ٹولز (${count})`,
    manageBookmarks: 'بک مارکس کا انتظام کریں ←',
  },
  ar: {
    heroBadge: '✨ أكثر من 220 أداة مجانية ودورات تعليمية',
    heroTitle: 'أدوات مجانية وآمنة وسريعة لمعالجة الملفات',
    heroSubtitle: 'تحويل المستندات، وضغط الصور، وتعديل الوسائط، والبرمجة — خصوصية محلية تامة 100% داخل المتصفح.',
    searchPlaceholder: 'ابحث في 220+ أداة (مثل تحويل PDF، ضغط، OCR، QR)...',
    clearSearch: 'مسح',
    allToolsTab: 'جميع الأدوات',
    frequentTools: 'الأدوات الأكثر استخداماً',
    browseByCategory: 'تصفح حسب التصنيف',
    directoryTitle: 'دليل الأدوات',
    toolsCount: (count: number) => `${count} أداة`,
    noToolsFound: 'لم يتم العثور على أي أداة مطابقة لبحثك.',
    resetFilters: 'إعادة ضبط التصفية',
    coursesTitle: 'الدورات التدريبية المتميزة',
    coursesSubtitle: 'مناهج تقنية مفتوحة ومجانية مع مشاريع تفاعلية عملية.',
    viewAllCourses: 'استكشف جميع الكورسات ←',
    viewAllTools: 'استكشف دليل جميع الأدوات 220+ ←',
    trustPrivate: 'خصوصية محلية 100%',
    trustPrivateDesc: 'ملفاتك لا تغادر جهازك أبداً',
    trustEngine: 'محرك WASM بسعة 500 ميجابايت',
    trustEngineDesc: 'معالجة فورية وفائقة السرعة',
    trustFree: 'استخدام فوري بدون تسجيل',
    trustFreeDesc: 'وصول مجاني وغير محدود',
    bookmarked: (count: number) => `الأدوات المحفوظة (${count})`,
    manageBookmarks: 'إدارة الإشارات المرجعية ←',
  },
  hi: {
    heroBadge: '✨ 220+ मुफ़्त ऑनलाइन टूल्स व मास्टर कोर्सेज',
    heroTitle: 'मुफ़्त, तेज़ और सुरक्षित ऑनलाइन यूटिलिटीज',
    heroSubtitle: 'दस्तावेज़ रूपांतरण, छवि संपीड़न, वीडियो टूल्स और कोडिंग — 100% इन-ब्राउज़र गोपनीयता के साथ।',
    searchPlaceholder: '220+ टूल्स खोजें (जैसे PDF से Word, OCR, Compress, QR)...',
    clearSearch: 'साफ़ करें',
    allToolsTab: 'सभी टूल्स',
    frequentTools: 'लोकप्रिय त्वरित टूल्स',
    browseByCategory: 'श्रेणियों के अनुसार ब्राउज़ करें',
    directoryTitle: 'टूल्स निर्देशिका',
    toolsCount: (count: number) => `${count} टूल्स`,
    noToolsFound: 'आपकी खोज से मेल खाता कोई टूल नहीं मिला।',
    resetFilters: 'फ़िल्टर रीसेट करें',
    coursesTitle: 'प्रमुख मास्टर कोर्सेज',
    coursesSubtitle: 'मुफ़्त, खुले पाठ्यक्रम और व्यावहारिक प्रोजेक्ट्स।',
    viewAllCourses: 'सभी कोर्सेज देखें →',
    viewAllTools: 'सभी 220+ टूल्स डायरेक्टरी देखें →',
    trustPrivate: '100% इन-ब्राउज़र गोपनीयता',
    trustPrivateDesc: 'फ़ाइलें कभी डिवाइस से बाहर नहीं जातीं',
    trustEngine: '500 MB स्थानीय WASM इंजन',
    trustEngineDesc: 'अति-तीव्र प्रोसेसिंग',
    trustFree: 'बिना लॉगिन मुफ़्त एक्सेस',
    trustFreeDesc: 'तत्काल और असीमित उपयोग',
    bookmarked: (count: number) => `बुकमार्क किए गए टूल्स (${count})`,
    manageBookmarks: 'बुकमार्क प्रबंधित करें →',
  },
};

const FEATURED_COURSES = [
  {
    id: 'modern-fullstack-web-mastery',
    title: 'Full-Stack Web Mastery',
    desc: 'Master React, Next.js 15, TypeScript, Node.js, and Modern Web Architecture.',
    badge: 'Comprehensive',
    lessons: '48 Lessons',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'python-ai-prompt-engineering-mastery',
    title: 'Python & AI Prompt Mastery',
    desc: 'Build AI agents, automated pipelines, LLM workflows, and data scripts.',
    badge: 'AI & Data',
    lessons: '36 Lessons',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'document-pdf-automation-mastery',
    title: 'Document & PDF Engineering',
    desc: 'Deep-dive into client-side WASM, OCR, PDF syntax, and automated pipelines.',
    badge: 'Engineering',
    lessons: '28 Lessons',
    color: 'from-rose-600 to-red-600',
  },
];

const POPULAR_QUICK_ACTIONS = [
  { id: 'pdf-to-docx', name: 'PDF to Word (OCR)', cat: 'pdf', icon: FileText, color: 'bg-indigo-600' },
  { id: 'compress-pdf', name: 'Compress PDF', cat: 'pdf', icon: Minimize2, color: 'bg-rose-600' },
  { id: 'merge-pdf', name: 'Merge PDF', cat: 'pdf', icon: Combine, color: 'bg-blue-600' },
  { id: 'ocr-image', name: 'OCR Image to Text', cat: 'ocr', icon: ScanText, color: 'bg-purple-600' },
  { id: 'image-resizer', name: 'Image Studio', cat: 'image', icon: ImageIcon, color: 'bg-emerald-600' },
  { id: 'qr-generator', name: 'QR Code Generator', cat: 'qr', icon: QrCode, color: 'bg-cyan-600' },
  { id: 'markitdown', name: 'MarkItDown AI', cat: 'ai', icon: Brain, color: 'bg-amber-600', isDirectPath: '/markitdown' },
  { id: 'pdf-editor', name: 'PDF Editor Studio', cat: 'pdf', icon: FileCheck, color: 'bg-violet-600', isDirectPath: '/pdf-editor' },
];

export default function HomePage() {
  const { language, isRTL } = useI18n();
  const { favorites, pinnedTools } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const loc = PAGE_LOCALES[language] || PAGE_LOCALES.en;

  const favoriteTools = useMemo(() => {
    return TOOLS_LIST.filter(
      (tool) =>
        favorites.some((fav) => fav.id === tool.id || fav.id === tool.slug) ||
        pinnedTools.includes(tool.id)
    );
  }, [favorites, pinnedTools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return TOOLS_LIST.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      const localized = getLocalizedTool(tool, language);
      const name = (localized?.name || tool.name).toLowerCase();
      const desc = (localized?.shortDesc || tool.shortDesc || tool.fullDesc || '').toLowerCase();
      const tags = (tool.tags || []).join(' ').toLowerCase();

      return name.includes(query) || desc.includes(query) || tags.includes(query) || tool.id.includes(query);
    });
  }, [searchQuery, activeCategory, language]);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen pb-12 transition-colors">
      {/* 1. HERO BANNER (WEBSITE HEADER) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-500/10 via-brand-500/5 to-transparent dark:from-brand-950/40 dark:via-slate-900/20 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800/80 pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-brand-500/10 dark:bg-brand-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-black shadow-xs">
            <span>{loc.heroBadge}</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {loc.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {loc.heroSubtitle}
          </p>

          {/* Live Search Input Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-lg shadow-slate-900/5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500/30 dark:border-brand-500/40 focus-within:border-brand-600 dark:focus-within:border-brand-400 transition-all">
              <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 absolute left-4 rtl:left-auto rtl:right-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={loc.searchPlaceholder}
                className="w-full py-3.5 sm:py-4 pl-12 pr-12 rtl:pl-12 rtl:pr-12 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none rounded-2xl font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 rtl:right-auto rtl:left-3.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                  title={loc.clearSearch}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3 Core Trust Highlight Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-3xl mx-auto text-left rtl:text-right">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{loc.trustPrivate}</p>
                <p className="text-[10px] text-slate-500 truncate">{loc.trustPrivateDesc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{loc.trustEngine}</p>
                <p className="text-[10px] text-slate-500 truncate">{loc.trustEngineDesc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{loc.trustFree}</p>
                <p className="text-[10px] text-slate-500 truncate">{loc.trustFreeDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS (RESPONSIVE HORIZONTAL SCROLL BAR) */}
      <section className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {loc.allToolsTab} (220+)
          </button>

          {CATEGORIES_CONFIG.map((cat) => {
            const Icon = categoryIconMap[cat.id] || FileText;
            const isSelected = activeCategory === cat.id;
            const localizedName = getLocalizedCategory(cat.id, language);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveCategory(cat.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{localizedName}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BOOKMARKED FAVORITES (IF ANY) */}
      {favoriteTools.length > 0 && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{loc.bookmarked(favoriteTools.length)}</span>
            </h2>
            <Link href="/favorites" className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {loc.manageBookmarks}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {favoriteTools.slice(0, 4).map((tool) => (
              <ToolCard key={`fav-${tool.id}`} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* 4. POPULAR QUICK ACTIONS GRID (SHOWS WHEN ON ALL CATEGORY & NO SEARCH) */}
      {activeCategory === 'all' && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{loc.frequentTools}</span>
            </h2>
            <Link href="/tools" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {loc.viewAllTools}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {POPULAR_QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const href = action.isDirectPath || `/tools/${action.id}`;
              return (
                <Link
                  key={action.id}
                  href={href}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md transition-all flex items-center gap-3 group active:scale-95"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {action.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      {action.cat}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. MAIN TOOL DIRECTORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
              {activeCategory === 'all'
                ? loc.directoryTitle
                : `${getLocalizedCategory(activeCategory, language)} Tools`}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {loc.toolsCount(filteredTools.length)}
            </span>
          </div>

          {(activeCategory !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {loc.resetFilters}
            </button>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{loc.noToolsFound}</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-brand-500 transition-colors"
            >
              {loc.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredTools.slice(0, 48).map((tool, idx) => (
              <React.Fragment key={tool.id}>
                <ToolCard tool={tool} />
                {idx === 7 && <NativeFeedAd />}
                {idx === 23 && <NativeFeedAd />}
              </React.Fragment>
            ))}
          </div>
        )}

        {filteredTools.length > 48 && (
          <div className="text-center pt-6">
            <Link
              href={`/tools${activeCategory !== 'all' ? `?cat=${activeCategory}` : ''}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              <span>{loc.viewAllTools}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        )}
      </section>

      {/* Middle Banner Ad */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AdSlot placement="in-feed" />
      </section>

      {/* 6. FEATURED MASTER COURSES (FREE EDUCATIONAL HUB) */}
      {!searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                <span>{loc.coursesTitle}</span>
              </h2>
              <p className="text-xs text-slate-500">{loc.coursesSubtitle}</p>
            </div>
            <Link href="/courses" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {loc.viewAllCourses}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_COURSES.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold border border-brand-200 dark:border-brand-800">
                      {course.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{course.lessons}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {course.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                  <span>Start Learning Free</span>
                  <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
