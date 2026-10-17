'use client';

import React from 'react';
import { MediaDownloaderStudio } from '@/components/media/MediaDownloaderStudio';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';

export default function VideoDownloaderPage() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Video Downloader' }]}
        rightAction={<AddToHomeButton toolId="video-downloader" toolName="Video Downloader" category="media" variant="pill" directNavigate={true} />}
      />
      <MediaDownloaderStudio />
    </div>
  );
}
