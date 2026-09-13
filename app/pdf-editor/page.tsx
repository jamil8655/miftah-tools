import React from 'react';
import { VisualPdfEditor } from '@/components/pdf/VisualPdfEditor';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PenTool } from 'lucide-react';

export default function PdfEditorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: 'PDF Tools', href: '/tools?cat=pdf' }, { label: 'PDF Editor' }]} />

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <PenTool className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>PDF Editor & Annotator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          Add custom text, freeform drawing, highlighters, digital signatures, and stamps.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        <VisualPdfEditor />
      </div>
    </div>
  );
}
