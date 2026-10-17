'use client';

import React from 'react';
import { VoiceToTextStudio } from '@/components/voice/VoiceToTextStudio';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';

export default function VoiceToTextPage() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Voice to Text (AI)' }]}
        rightAction={<AddToHomeButton toolId="voice-to-text" toolName="Voice to Text (AI)" category="media" variant="pill" directNavigate={true} />}
      />
      <VoiceToTextStudio />
    </div>
  );
}
