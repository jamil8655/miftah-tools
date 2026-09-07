'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/layout/ThemeContext';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import {
  Sparkles,
  Download,
  History as HistoryIcon,
  Star,
  Settings as SettingsIcon,
  ShieldCheck,
  Languages,
  Sun,
  Moon,
  Laptop,
  Trash2,
  ChevronRight,
  FileText,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

export default function AccountPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const {
    favorites,
    history,
    downloads,
    clearHistory,
    clearDownloads,
  } = useUserStore();

  const handleClearAllData = () => {
    if (confirm('Clear all local conversion history and downloads list?')) {
      clearHistory();
      clearDownloads();
      localStorage.clear();
      alert('Local workspace cache cleared successfully.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 pb-24 min-w-0">
      {/* 1. TOP HEADER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Miftah Tools Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              100% Free, Offline &amp; Private In-Memory Utility Suite
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            No Login Required
          </span>
        </div>
      </div>

      {/* 2. ACTIVITY & STORAGE SECTION */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Activity &amp; Workspace
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/downloads"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Downloads Storage</h3>
                <p className="text-[11px] text-slate-500">{downloads.length} generated files in local storage</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/history"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conversion History</h3>
                <p className="text-[11px] text-slate-500">{history.length} processed items</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/favorites"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saved &amp; Favorites</h3>
                <p className="text-[11px] text-slate-500">{favorites.length} pinned tools</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 3. SETTINGS & PREFERENCES SHORTCUTS */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Preferences &amp; Customization
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/settings"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">App Settings</h3>
                <p className="text-[11px] text-slate-500">Language, Theme Mode, Notifications &amp; Offline Cache</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 4. LEGAL & PRIVACY */}
      <div className="space-y-2">
        <h2 className="px-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Legal &amp; Privacy
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
          <Link
            href="/privacy"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                <p className="text-[11px] text-slate-500">100% on-device memory privacy declaration</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/terms"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Terms of Service</h3>
                <p className="text-[11px] text-slate-500">Free client-side tool usage terms</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/contact"
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Support &amp; Contact</h3>
                <p className="text-[11px] text-slate-500">Direct developer email: jrahmanansari132@gmail.com</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 5. DATA RESET */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleClearAllData}
          className="w-full p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Local Workspace &amp; Cached Data</span>
        </button>
      </div>
    </div>
  );
}
