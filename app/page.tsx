'use client';

import React, { useState } from 'react';
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
  Camera,
  Layers,
  FileCheck,
  Type,
  Lock,
  Video,
  Binary,
  Code2,
  Bookmark,
  Clock,
  History,
  Brain,
  Calculator,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { ToolCard } from '@/components/shared/ToolCard';
import { HorizontalRecentToolsCarousel } from '@/components/shared/HorizontalRecentToolsCarousel';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';

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

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  pdf: { bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400', text: 'text-rose-600 dark:text-rose-400' },
  document: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-600 dark:text-indigo-400' },
  image: { bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-400' },
  ocr: { bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
  text: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  compress: { bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-400' },
  security: { bg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400', text: 'text-orange-600 dark:text-orange-400' },
  media: { bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400', text: 'text-purple-600 dark:text-purple-400' },
  calculator: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400', text: 'text-cyan-600 dark:text-cyan-400' },
  dev: { bg: 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400', text: 'text-violet-600 dark:text-violet-400' },
  qr: { bg: 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400', text: 'text-teal-600 dark:text-teal-400' },
  ai: { bg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400', text: 'text-sky-600 dark:text-sky-400' },
};

const HOME_LOCALES = {
  en: {
    bookmarked: (count: number) => `Bookmarked Tools (${count})`,
    manageBookmarks: 'Manage Bookmarks →',
    frequentUtilities: 'Frequent Utilities',
    allToolsLink: 'All 220+ Tools →',
    categories: 'Tool Categories',
    showAllCategories: 'Show All Categories',
    toolsCount: (count: number) => `${count} tools`,
    popularTools: 'Popular Tools',
    selectedTools: (catLabel: string) => `${catLabel} Tools`,
    exploreDirectory: (count: number) => `Explore All ${count} Tools in Directory`,
  },
  ur: {
    bookmarked: (count: number) => `محفوظ شدہ ٹولز (${count})`,
    manageBookmarks: 'بک مارکس کا انتظام کریں ←',
    frequentUtilities: 'اکثر استعمال ہونے والے ٹولز',
    allToolsLink: 'تمام 220+ ٹولز دیکھیں ←',
    categories: 'اقسام کی فہرست',
    showAllCategories: 'تمام اقسام دیکھیں',
    toolsCount: (count: number) => `${count} ٹولز`,
    popularTools: 'مقبول ترین ٹولز',
    selectedTools: (catLabel: string) => `${catLabel} کے ٹولز`,
    exploreDirectory: (count: number) => `ڈائرکٹری کے تمام ${count} ٹولز دیکھیں`,
  },
  ar: {
    bookmarked: (count: number) => `الأدوات المحفوظة (${count})`,
    manageBookmarks: 'إدارة الإشارات المرجعية ←',
    frequentUtilities: 'الأدوات الشائعة',
    allToolsLink: 'جميع الأدوات 220+ ←',
    categories: 'تصنيفات الأدوات',
    showAllCategories: 'عرض جميع التصنيفات',
    toolsCount: (count: number) => `${count} أداة`,
    popularTools: 'الأدوات الشائعة',
    selectedTools: (catLabel: string) => `أدوات ${catLabel}`,
    exploreDirectory: (count: number) => `استكشف جميع الأدوات (${count}) في الدليل`,
  },
  hi: {
    bookmarked: (count: number) => `बुकमार्क किए गए टूल्स (${count})`,
    manageBookmarks: 'बुकमार्क प्रबंधित करें →',
    frequentUtilities: 'अक्सर उपयोग किए जाने वाले टूल्स',
    allToolsLink: 'सभी 220+ टूल्स देखें →',
    categories: 'टूल श्रेणियां',
    showAllCategories: 'सभी श्रेणियां दिखाएं',
    toolsCount: (count: number) => `${count} टूल्स`,
    popularTools: 'लोकप्रिय टूल्स',
    selectedTools: (catLabel: string) => `${catLabel} टूल्स`,
    exploreDirectory: (count: number) => `निर्देशिका में सभी ${count} टूल्स देखें`,
  },
};

const QUICK_ACTION_DEFINITIONS = [
  { id: 'compress-pdf', color: 'bg-rose-500', fallbackIcon: Minimize2 },
  { id: 'merge-pdf', color: 'bg-blue-500', fallbackIcon: Combine },
  { id: 'pdf-to-word', color: 'bg-indigo-500', fallbackIcon: FileText },
  { id: 'word-to-pdf', color: 'bg-teal-500', fallbackIcon: FileText },
  { id: 'images-to-pdf', color: 'bg-amber-500', fallbackIcon: ImageIcon },
  { id: 'image-resizer', color: 'bg-emerald-500', fallbackIcon: Camera },
  { id: 'ocr-image-to-text', color: 'bg-purple-500', fallbackIcon: ScanText },
  { id: 'qr-code-generator', color: 'bg-cyan-500', fallbackIcon: QrCode },
];

export default function HomePage() {
  const { language, isRTL } = useI18n();
  const { favorites, pinnedTools } = useUserStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const loc = HOME_LOCALES[language] || HOME_LOCALES.en;

  // User's bookmarked favorite tools
  const favoriteTools = TOOLS_LIST.filter(
    (tool) =>
      favorites.some((fav) => fav.id === tool.id || fav.id === tool.slug) ||
      pinnedTools.includes(tool.id)
  );

  const filteredTools = TOOLS_LIST.filter((tool) => {
    return activeCategory === 'all' || tool.category === activeCategory;
  });

  const activeCategoryLabel = activeCategory === 'all'
    ? loc.popularTools
    : loc.selectedTools(getLocalizedCategory(activeCategory, language));

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* 1. BOOKMARKED FAVORITES (Conditional on real user saving) */}
      {favoriteTools.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pt-4 max-w-7xl mx-auto space-y-3">
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

      {/* 2. RECENT TOOLS (Horizontal Scrolling RTL/LTR-Aware Carousel) */}
      <HorizontalRecentToolsCarousel />

      {/* 3. FREQUENT TOOLS / QUICK ACTIONS */}
      <section className="px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{loc.frequentUtilities}</span>
          </h2>
          <Link href="/tools" className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline">
            {loc.allToolsLink}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {QUICK_ACTION_DEFINITIONS.map((def) => {
            const tool = TOOLS_LIST.find((t) => t.id === def.id || t.slug === def.id);
            const localized = tool ? getLocalizedTool(tool, language) : null;
            const title = localized?.name || def.id;
            const desc = localized?.shortDesc || '';
            const FallbackIcon = def.fallbackIcon;

            return (
              <Link
                key={def.id}
                href={`/tools/${tool?.slug || def.id}`}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-500 dark:hover:border-brand-500 active:scale-95 transition-all flex items-center gap-3 group"
              >
                <div className={`w-9 h-9 rounded-xl ${def.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                  <FallbackIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {title}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    {desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. BALANCED CATEGORIES GRID (12 Symmetrical Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>{loc.categories}</span>
          </h2>
          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {loc.showAllCategories}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {CATEGORIES_CONFIG.map((cat) => {
            const Icon = categoryIconMap[cat.id] || FileText;
            const count = TOOLS_LIST.filter((t) => t.category === cat.id).length;
            const isSelected = activeCategory === cat.id;
            const colors = categoryColorMap[cat.id] || { bg: 'bg-brand-500/10 text-brand-600', text: 'text-brand-600' };
            const localizedCatName = getLocalizedCategory(cat.id, language);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
                className={`p-3 rounded-2xl border text-left rtl:text-right transition-all duration-150 active:scale-95 flex items-center gap-3 min-h-[64px] ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : colors.bg
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black truncate">{localizedCatName}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {loc.toolsCount(count)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Middle Banner Ad Slot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot placement="in-feed" />
      </section>

      {/* 5. TOOL DIRECTORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {activeCategoryLabel}
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">{loc.toolsCount(filteredTools.length)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTools.slice(0, 32).map((tool, idx) => (
            <React.Fragment key={tool.id}>
              <ToolCard tool={tool} />
              {idx === 7 && <NativeFeedAd />}
              {idx === 19 && <NativeFeedAd />}
            </React.Fragment>
          ))}
        </div>

        {filteredTools.length > 32 && (
          <div className="text-center pt-4">
            <Link
              href={`/tools${activeCategory !== 'all' ? `?cat=${activeCategory}` : ''}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:border-brand-500 shadow-xs active:scale-95 transition-all"
            >
              <span>{loc.exploreDirectory(filteredTools.length)}</span>
              {isRTL ? (
                <ArrowRight className="w-4 h-4 text-brand-600 rotate-180" />
              ) : (
                <ArrowRight className="w-4 h-4 text-brand-600" />
              )}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
