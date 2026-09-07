import React from 'react';
import { Metadata } from 'next';
import { UnifiedPdfWorkspace } from '@/components/pdf/UnifiedPdfWorkspace';

export const metadata: Metadata = {
  title: 'Unified PDF Document Workspace — Miftah Tools',
  description: 'All-in-one PDF workspace: rotate pages, apply smart compression presets, stamp confidential watermarks, and add header/footer page numbers in a single view.',
};

export default function PdfWorkspacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <UnifiedPdfWorkspace />
    </div>
  );
}
