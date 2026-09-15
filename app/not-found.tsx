'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, Wrench, Search, ArrowRight, Zap, FileText, Minimize2, Video, ImageIcon } from 'lucide-react';

export default function NotFound() {
  const popularTools = [
    { name: 'Merge PDF', href: '/tools/merge-pdf', icon: FileText, desc: 'Combine multiple PDF files' },
    { name: 'Compress PDF', href: '/tools/compress-pdf', icon: Minimize2, desc: 'Reduce PDF file size' },
    { name: 'Video Downloader', href: '/tools/media-downloader', icon: Video, desc: 'Download HD video & audio' },
    { name: 'Image Studio', href: '/tools/image-resizer', icon: ImageIcon, desc: 'Convert and resize images' },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-300">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-black shadow-xs">
            <FileQuestion className="w-4 h-4" />
            <span>HTTP 404 • Resource Not Found</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Page or Tool Not Found
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Explore our popular tools below or return home.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/tools"
            className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>View All 220+ Tools</span>
          </Link>
        </div>

        {/* Popular Quick Navigation */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4 text-left rtl:text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Popular Utilities on Miftah Tools
            </span>
            <Link href="/tools" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Browse Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-xs transition-all flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200/60 dark:border-brand-800/60 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tool.name}
                    </h2>
                    <p className="text-[10px] text-slate-500 truncate">{tool.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 rtl:rotate-180 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
