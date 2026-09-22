'use client';

import React from 'react';
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
  Bookmark,
  Mic,
} from 'lucide-react';
import { TOOLS_LIST } from '@/lib/tools-config';
import { ToolCard } from '@/components/shared/ToolCard';
import { HorizontalRecentToolsCarousel } from '@/components/shared/HorizontalRecentToolsCarousel';
import { CategoryToolsModal } from '@/components/shared/CategoryToolsModal';
import { NativeFeedAd } from '@/components/ads/NativeFeedAd';
import { AdSlot } from '@/components/ads/AdSlot';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { triggerHaptic } from '@/lib/motion/motion-system';

import { getLocalizedTool } from '@/lib/i18n/catalog-translations';

const HOME_LOCALES = {
  en: {
    bookmarked: (count: number) => `Bookmarked Tools (${count})`,
    manageBookmarks: 'Manage Bookmarks →',
    frequentUtilities: 'Frequent Utilities',
    allToolsLink: 'All Tools →',
    categories: 'Tool Categories',
    showAllCategories: 'Show All Categories',
    toolsCount: (count: number) => `${count} tools`,
    popularTools: 'Popular Tools',
    selectedTools: (catLabel: string) => `${catLabel} Tools`,
    exploreDirectory: (count: number) => `Explore All Tools in Directory`,
  },
  ur: {
    bookmarked: (count: number) => `محفوظ شدہ ٹولز (${count})`,
    manageBookmarks: 'بک مارکس کا انتظام کریں ←',
    frequentUtilities: 'اکثر استعمال ہونے والے ٹولز',
    allToolsLink: 'تمام ٹولز دیکھیں ←',
    categories: 'اقسام کی فہرست',
    showAllCategories: 'تمام اقسام دیکھیں',
    toolsCount: (count: number) => `${count} ٹولز`,
    popularTools: 'مقبول ترین ٹولز',
    selectedTools: (catLabel: string) => `${catLabel} کے ٹولز`,
    exploreDirectory: (count: number) => `ڈائرکٹری کے تمام ٹولز دیکھیں`,
  },
  ar: {
    bookmarked: (count: number) => `الأدوات المحفوظة (${count})`,
    manageBookmarks: 'إدارة الإشارات المرجعية ←',
    frequentUtilities: 'الأدوات الشائعة',
    allToolsLink: 'جميع الأدوات ←',
    categories: 'تصنيفات الأدوات',
    showAllCategories: 'عرض جميع التصنيفات',
    toolsCount: (count: number) => `${count} أداة`,
    popularTools: 'الأدوات الشائعة',
    selectedTools: (catLabel: string) => `أدوات ${catLabel}`,
    exploreDirectory: (count: number) => `استكشف جميع الأدوات في الدليل`,
  },
  hi: {
    bookmarked: (count: number) => `बुकमार्क किए गए टूल्स (${count})`,
    manageBookmarks: 'बुकमार्क प्रबंधित करें →',
    frequentUtilities: 'अक्सर उपयोग किए जाने वाले टूल्स',
    allToolsLink: 'सभी टूल्स देखें →',
    categories: 'टूल श्रेणियां',
    showAllCategories: 'सभी श्रेणियां दिखाएं',
    toolsCount: (count: number) => `${count} टूल्स`,
    popularTools: 'लोकप्रिय टूल्स',
    selectedTools: (catLabel: string) => `${catLabel} टूल्स`,
    exploreDirectory: (count: number) => `निर्देशिका में सभी टूल्स देखें`,
  },
};

const QUICK_ACTION_DEFINITIONS = [
  { id: 'voice-to-text', color: 'bg-rose-500', fallbackIcon: Mic },
  { id: 'media-downloader', color: 'bg-purple-600', fallbackIcon: Video },
  { id: 'camera-scanner', color: 'bg-blue-600', fallbackIcon: Camera },
  { id: 'pdf-to-docx', color: 'bg-indigo-600', fallbackIcon: FileText },
  { id: 'compress-pdf', color: 'bg-emerald-600', fallbackIcon: Minimize2 },
  { id: 'merge-pdf', color: 'bg-sky-500', fallbackIcon: Combine },
  { id: 'pdf-editor', color: 'bg-amber-500', fallbackIcon: Layers },
  { id: 'markitdown', color: 'bg-fuchsia-600', fallbackIcon: Sparkles },
  { id: 'background-remover', color: 'bg-pink-500', fallbackIcon: Sparkles },
  { id: 'image-resizer', color: 'bg-cyan-600', fallbackIcon: ImageIcon },
  { id: 'qr-generator', color: 'bg-teal-600', fallbackIcon: QrCode },
  { id: 'workflows', color: 'bg-orange-500', fallbackIcon: Zap },
  { id: 'video-to-mp3', color: 'bg-violet-600', fallbackIcon: Video },
  { id: 'audio-booster', color: 'bg-lime-600', fallbackIcon: Zap },
  { id: 'pdf-signer', color: 'bg-slate-700', fallbackIcon: FileCheck },
  { id: 'docx-to-pdf', color: 'bg-blue-500', fallbackIcon: FileText },
];

export default function HomePage() {
  const { language, isRTL } = useI18n();
  const { favorites, pinnedTools } = useUserStore();
  const loc = HOME_LOCALES[language] || HOME_LOCALES.en;

  // Restore scroll position when returning back from a tool
  React.useEffect(() => {
    try {
      const lastToolId = sessionStorage.getItem('miftah_last_clicked_tool');
      const savedScroll = sessionStorage.getItem('miftah_home_scroll');

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
  }, []);

  // Save scroll position before unmounting / navigating
  React.useEffect(() => {
    const handleScroll = () => {
      try {
        sessionStorage.setItem('miftah_home_scroll', window.scrollY.toString());
      } catch (_) {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // User's bookmarked favorite tools
  const favoriteTools = TOOLS_LIST.filter(
    (tool) =>
      favorites.some((fav) => fav.id === tool.id || fav.id === tool.slug) ||
      pinnedTools.includes(tool.id)
  );

  return (
    <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 pb-24 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* 1. BOOKMARKED FAVORITES (Conditional on real user saving) */}
      {favoriteTools.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pt-2 max-w-7xl mx-auto space-y-3">
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

      {/* 3. FREQUENT TOOLS / QUICK ACTIONS (Primary Flagship Mobile Hub) */}
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
            const href = def.id === 'workflows' ? '/workflows' : `/tools/${tool?.slug || def.id}`;

            return (
              <Link
                key={def.id}
                href={href}
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

      {/* Middle Native Ad Slot (AdMob in-feed ad) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot placement="in-feed" />
      </section>

      {/* 4. TOOL DIRECTORY GRID (All Tools) */}
      <section id="tools-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {loc.popularTools}
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">{loc.toolsCount(TOOLS_LIST.length)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TOOLS_LIST.slice(0, 32).map((tool, idx) => (
            <React.Fragment key={tool.id}>
              <ToolCard tool={tool} />
              {idx === 7 && <NativeFeedAd />}
              {idx === 19 && <NativeFeedAd />}
            </React.Fragment>
          ))}
        </div>

        {TOOLS_LIST.length > 32 && (
          <div className="text-center pt-4">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:border-brand-500 shadow-xs active:scale-95 transition-all"
            >
              <span>{loc.exploreDirectory(TOOLS_LIST.length)}</span>
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
