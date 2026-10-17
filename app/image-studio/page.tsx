import React from 'react';
import { Metadata } from 'next';
import { UnifiedImageStudio } from '@/components/image/UnifiedImageStudio';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';

export const metadata: Metadata = {
  title: 'Unified Image & Photo Studio',
  description: 'All-in-one image studio: apply live HD filters, resize dimensions, convert to WebP/PNG/JPG, and compress to exact KB limits in 1 click.',
};

export default function ImageStudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Image Studio' }]}
        rightAction={<AddToHomeButton toolId="image-studio" toolName="Image Studio" category="image" variant="pill" directNavigate={true} />}
      />
      <UnifiedImageStudio />
    </div>
  );
}
