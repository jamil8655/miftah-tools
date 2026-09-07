import React from 'react';
import { Metadata } from 'next';
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder';

export const metadata: Metadata = {
  title: 'Smart Workflow Pipelines — Miftah Tools',
  description: 'Automate multi-step file processing pipelines: remove backgrounds, resize, compress, stamp watermarks, and export in 1 click.',
};

export default function WorkflowsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <WorkflowBuilder />
    </div>
  );
}
