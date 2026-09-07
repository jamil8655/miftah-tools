import React from 'react';
import { Metadata } from 'next';
import { PrivacyCenter } from '@/components/privacy/PrivacyCenter';

export const metadata: Metadata = {
  title: 'Privacy & Security Center — Miftah Tools',
  description: 'Learn about our 100% in-browser client-side privacy architecture, clean photo EXIF & GPS metadata, and manage offline data storage.',
};

export default function PrivacyCenterPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PrivacyCenter />
    </div>
  );
}
