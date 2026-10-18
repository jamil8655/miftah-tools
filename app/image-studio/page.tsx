import React from 'react';
import { Metadata } from 'next';
import { UnifiedImageStudio } from '@/components/image/UnifiedImageStudio';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { ToolActionHeader } from '@/components/shared/ToolActionHeader';

export const metadata: Metadata = {
  title: 'Unified Image & Photo Studio',
  description: 'All-in-one image studio: apply live HD filters, resize dimensions, convert to WebP/PNG/JPG, and compress to exact KB limits in 1 click.',
};

export default function ImageStudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Image Studio' }]}
        rightAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FavoriteButton toolId="image-studio" />
            <AddToHomeButton toolId="image-studio" toolName="Image Studio" category="image" variant="pill" />
          </div>
        }
      />
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Unified Image & Photo Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          Apply live HD filters, resize dimensions, convert formats, and compress to exact KB targets.
        </p>
        <ToolActionHeader toolId="image-studio" toolName="Image Studio" category="image" slug="image-studio" />
      </div>
      <UnifiedImageStudio />
    </div>
  );
}
