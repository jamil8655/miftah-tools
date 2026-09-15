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

  return (
    <div className="mt-12 space-y-10 text-slate-800 dark:text-slate-200">
      {/* 1. How to Use Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-1 text-left rtl:text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200/60 dark:border-brand-800/60">
            <Wrench className="w-3.5 h-3.5" />
            <span>Step-by-Step Guide</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            How to Use {tool.name} Online
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Follow these simple steps to process your files securely in seconds:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {seo.howToSteps.map((step) => (
            <div
              key={step.step}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2 relative group hover:border-brand-500/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                {step.step}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Key Features & Benefits */}
      <section className="space-y-4 text-left rtl:text-right">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Key Features of {tool.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Engineered with modern WebAssembly and client-side processing for peak performance and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">100% In-Browser Privacy</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Files are processed entirely within your device memory. Zero files are uploaded to any server.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200/60 dark:border-brand-800/60">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Hardware-Accelerated Speed</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Eliminates internet upload waiting times with lightning-fast local execution.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">No Watermark & No Limits</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export high-fidelity, clean documents without added watermarks or hidden daily quotas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Universal Compatibility</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Works seamlessly across Chrome, Safari, Edge, Firefox on mobile, desktop, and tablets.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Technical Specifications Table */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 text-left rtl:text-right">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {tool.name} Specifications & Format Support
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accepted Inputs</span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{seo.specifications.acceptedFormats}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Output Format</span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{seo.specifications.outputFormat}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max File Size</span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{seo.specifications.maxFileSize}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batch Capacity</span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{seo.specifications.maxFiles}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Processing Engine & Privacy</span>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{seo.specifications.executionType} ({seo.specifications.privacy})</p>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-5 text-left rtl:text-right">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Frequently Asked Questions about {tool.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seo.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs"
            >
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                <span className="text-brand-600 dark:text-brand-400 font-black">Q.</span>
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5 rtl:pl-0 rtl:pr-5">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Related Tools & Internal Linking Hierarchy */}
      <section className="space-y-4 text-left rtl:text-right">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Related Digital Tools & Utilities
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discover more free tools in the {tool.category.toUpperCase()} category on Miftah Tools:
            </p>
          </div>
          <Link
            href="/tools/"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>All 220+ Tools</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {seo.relatedTools.map((rel) => (
            <Link
              key={rel.id}
              href={`/tools/${rel.slug}/`}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {rel.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                    {rel.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {rel.shortDesc}
                </p>
              </div>

              <div className="pt-1 flex items-center text-[11px] font-bold text-brand-600 dark:text-brand-400 gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>Use Tool Online</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
