import React from 'react';
import { OcrStudio } from '@/components/ocr/OcrStudio';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { ToolActionHeader } from '@/components/shared/ToolActionHeader';
import { ScanText } from 'lucide-react';

export default function OcrPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <Breadcrumbs
        items={[{ label: 'OCR & Text', href: '/tools?cat=ocr' }, { label: 'OCR Text Recognition' }]}
        rightAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FavoriteButton toolId="ocr" />
            <AddToHomeButton toolId="ocr" toolName="OCR Text Recognition" category="ocr" variant="pill" />
          </div>
        }
      />

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center justify-center gap-2">
          <ScanText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>OCR Text Recognition</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          Extract text instantly from scanned documents, receipts, and photos.
        </p>
        <ToolActionHeader toolId="ocr" toolName="OCR Text Recognition" category="ocr" slug="ocr" />
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        <OcrStudio />
      </div>
    </div>
  );
}
