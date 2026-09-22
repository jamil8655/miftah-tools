'use client';

import React from 'react';
import { VoiceToTextStudio } from '@/components/voice/VoiceToTextStudio';

export default function VoiceToTextPage() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <VoiceToTextStudio />
    </div>
  );
}
