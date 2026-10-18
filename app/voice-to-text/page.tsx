'use client';

import React from 'react';
import { VoiceToTextStudio } from '@/components/voice/VoiceToTextStudio';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { ToolActionHeader } from '@/components/shared/ToolActionHeader';

export default function VoiceToTextPage() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Voice to Text (AI)' }]}
        rightAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FavoriteButton toolId="voice-to-text" />
            <AddToHomeButton toolId="voice-to-text" toolName="Voice to Text (AI)" category="media" variant="pill" />
          </div>
        }
      />
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Voice to Text (AI) Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto line-clamp-1">
          Convert live speech to text with instant offline microphone listening and multi-language support.
        </p>
        <ToolActionHeader toolId="voice-to-text" toolName="Voice to Text (AI)" category="media" slug="voice-to-text" />
      </div>
      <VoiceToTextStudio />
    </div>
  );
}
