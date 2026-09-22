import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Globe2,
  HelpCircle,
  FileCheck,
  Lock,
  ArrowRight,
  Wrench,
  Layers,
  FileText,
  Info,
} from 'lucide-react';
import { ToolDefinition } from '@/lib/types';
import { getCompleteToolSeo } from '@/lib/seo/seo-engine';

interface ToolSeoContentProps {
  tool: ToolDefinition;
}

export function ToolSeoContent({ tool }: ToolSeoContentProps) {
  const seo = getCompleteToolSeo(tool);

  if (!seo.relatedTools || seo.relatedTools.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6 text-slate-800 dark:text-slate-200">
      {/* Related Tools & Internal Linking - Clean & Compact */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 text-left rtl:text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-[11px] font-bold border border-brand-200/60 dark:border-brand-800/60">
              <Layers className="w-3 h-3" />
              <span>Related Tools</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Related {tool.category.toUpperCase()} Tools
            </h2>
          </div>
          <Link
            href="/tools/"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center"
          >
            <span>Explore All 220+ Tools</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* Horizontal Swipeable Card Carousel (Left to Right) */}
        <div className="flex flex-row items-stretch gap-3 overflow-x-auto no-scrollbar pb-1.5 pt-0.5 scroll-smooth snap-x">
          {seo.relatedTools.map((rel) => (
            <Link
              key={rel.id}
              href={`/tools/${rel.slug}/`}
              className="shrink-0 w-64 sm:w-72 p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/90 shadow-xs hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md hover:bg-white dark:hover:bg-slate-900 transition-all group flex flex-col justify-between space-y-2 snap-start"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    {rel.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase shrink-0">
                    {rel.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {rel.shortDesc}
                </p>
              </div>

              <div className="pt-0.5 flex items-center text-[10px] font-bold text-brand-600 dark:text-brand-400 gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>Open Tool</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
