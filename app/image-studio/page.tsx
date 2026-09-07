import React from 'react';
import { Metadata } from 'next';
import { UnifiedImageStudio } from '@/components/image/UnifiedImageStudio';

export const metadata: Metadata = {
  title: 'Unified Image & Photo Studio — Miftah Tools',
  description: 'All-in-one image studio: apply live HD filters, resize dimensions, convert to WebP/PNG/JPG, and compress to exact KB limits in 1 click.',
};

export default function ImageStudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <UnifiedImageStudio />
    </div>
  );
}
