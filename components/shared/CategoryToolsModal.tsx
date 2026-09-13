'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  FileCheck,
  Image as ImageIcon,
  ScanText,
  Type,
  Minimize2,
  ShieldCheck,
  Video,
  Calculator,
  Terminal,
  QrCode,
  Brain,
  ExternalLink,
} from 'lucide-react';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import { ToolDefinition } from '@/lib/types';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedCategory, getLocalizedTool } from '@/lib/i18n/catalog-translations';
import { ToolIcon } from './ToolIcon';
import { FavoriteButton } from './FavoriteButton';
import { triggerHaptic } from '@/lib/motion/motion-system';

interface CategoryToolsModalProps {
  categoryId: string | null;
  onClose: () => void;
}

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

const categoryColorMap: Record<string, { gradient: string; text: string; bg: string }> = {
  pdf: { gradient: 'from-rose-600 to-red-600', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  document: { gradient: 'from-indigo-600 to-violet-600', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50' },
  image: { gradient: 'from-blue-600 to-cyan-600', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50' },
  ocr: { gradient: 'from-fuchsia-600 to-pink-600', text: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50' },
  text: { gradient: 'from-emerald-600 to-teal-600', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
  compress: { gradient: 'from-amber-500 to-orange-600', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
  security: { gradient: 'from-orange-600 to-amber-600', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50' },
  media: { gradient: 'from-purple-600 to-indigo-600', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50' },
  calculator: { gradient: 'from-cyan-600 to-blue-600', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50' },
  dev: { gradient: 'from-violet-600 to-purple-600', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50' },
  qr: { gradient: 'from-teal-600 to-emerald-600', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/50' },
  ai: { gradient: 'from-sky-500 to-indigo-600', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50' },
};

const MODAL_LOCALES = {
  en: {
    searchInCat: (cat: string) => `Search in ${cat}...`,
    totalCount: (count: number) => `${count} available tools`,
    openTool: 'Open Tool',
    viewAllInDirectory: 'Open Full Directory Page →',
    noMatches: 'No tools match your search.',
    clearSearch: 'Clear search',
    close: 'Close',
  },
  ur: {
    searchInCat: (cat: string) => `${cat} کے اندر تلاش کریں...`,
    totalCount: (count: number) => `${count} دستیاب ٹولز`,
    openTool: 'ٹول کھولیں',
    viewAllInDirectory: 'مکمل ڈائرکٹری صفحہ کھولیں ←',
    noMatches: 'کوئی ٹول تلاش کے مطابق نہیں ملا۔',
    clearSearch: 'تلاش صاف کریں',
    close: 'بند کریں',
  },
  ar: {
    searchInCat: (cat: string) => `بحث في ${cat}...`,
    totalCount: (count: number) => `${count} أداة متاحة`,
    openTool: 'فتح الأداة',
    viewAllInDirectory: 'عرض في الدليل الشامل ←',
    noMatches: 'لم يتم العثور على أدوات تطابق البحث.',
    clearSearch: 'مسح البحث',
    close: 'إغلاق',
  },
  hi: {
    searchInCat: (cat: string) => `${cat} में खोजें...`,
    totalCount: (count: number) => `${count} उपलब्ध टूल्स`,
    openTool: 'टूल खोलें',
    viewAllInDirectory: 'पूरी डायरेक्टरी पेज खोलें →',
    noMatches: 'आपकी खोज से कोई टूल मेल नहीं खाता।',
    clearSearch: 'खोज साफ़ करें',
    close: 'बंद करें',
  },
};

export function CategoryToolsModal({ categoryId, onClose }: CategoryToolsModalProps) {
  const { language, isRTL } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const loc = MODAL_LOCALES[language] || MODAL_LOCALES.en;

  const categoryTools = useMemo(() => {
    if (!categoryId) return [];
    return TOOLS_LIST.filter((t) => t.category === categoryId);
  }, [categoryId]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return categoryTools;
    const q = searchQuery.toLowerCase();
    return categoryTools.filter((tool) => {
      const localized = getLocalizedTool(tool, language);
      return (
        localized.name.toLowerCase().includes(q) ||
        localized.shortDesc.toLowerCase().includes(q) ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [categoryTools, searchQuery, language]);

  if (!categoryId) return null;

  const categoryConfig = CATEGORIES_CONFIG.find((c) => c.id === categoryId);
  const localizedCategoryName = getLocalizedCategory(categoryId, language);
  const Icon = categoryIconMap[categoryId] || Layers;
  const colors = categoryColorMap[categoryId] || {
    gradient: 'from-brand-600 to-indigo-600',
    text: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-950/50',
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[82vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 safe-bottom"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${colors.gradient} text-white flex items-center justify-center shadow-md shadow-brand-500/10 shrink-0`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {localizedCategoryName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
                  {categoryTools.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {loc.totalCount(categoryTools.length)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all shrink-0"
            aria-label={loc.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Filter Search Input */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search
              className={`absolute ${
                isRTL ? 'right-3.5' : 'left-3.5'
              } top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={loc.searchInCat(localizedCategoryName)}
              autoFocus
              className={`w-full ${
                isRTL ? 'pr-10 pl-8' : 'pl-10 pr-8'
              } py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/30 transition-all`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`absolute ${
                  isRTL ? 'left-3' : 'right-3'
                } top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Tools List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 max-h-[55vh]">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{loc.noMatches}</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {loc.clearSearch}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredTools.map((tool) => {
                const localized = getLocalizedTool(tool, language);
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug || tool.id}`}
                    onClick={() => {
                      triggerHaptic('light');
                      try {
                        sessionStorage.setItem('miftah_last_clicked_tool', tool.id);
                        sessionStorage.setItem('miftah_home_category', categoryId);
                      } catch (_) {}
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-50/70 hover:bg-brand-50/50 dark:bg-slate-950/60 dark:hover:bg-brand-950/30 border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-800/80 transition-all flex items-center justify-between gap-3 group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                        <ToolIcon name={tool.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {localized.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {localized.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <FavoriteButton toolId={tool.id} />
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 text-slate-400 group-hover:text-brand-600 flex items-center justify-center shadow-2xs">
                        <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 flex items-center justify-between gap-2 shrink-0">
          <Link
            href={`/tools?cat=${categoryId}`}
            onClick={onClose}
            className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
          >
            <span>{loc.viewAllInDirectory}</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold active:scale-95 transition-all"
          >
            {loc.close}
          </button>
        </div>
      </div>
    </div>
  );
}
