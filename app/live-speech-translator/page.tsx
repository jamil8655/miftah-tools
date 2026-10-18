import React from 'react';
import { Metadata } from 'next';
import { LiveSpeechTranslator } from '@/components/translator/LiveSpeechTranslator';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { AddToHomeButton } from '@/components/shared/AddToHomeButton';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { ToolActionHeader } from '@/components/shared/ToolActionHeader';

export const metadata: Metadata = {
  title: 'Live Speech Translator – Free Real-Time Voice Translation | Miftah Tools',
  description:
    'Translate spoken language in real time with Miftah Tools. Speak naturally into your microphone, detect or select languages, and get continuous voice translations with optional audio playback.',
  keywords: [
    'live speech translator',
    'voice translator',
    'real time speech translation',
    'urdu to english voice translator',
    'arabic voice translator',
    'hindi speech translation',
    'free voice translator online',
    'miftah tools translator',
  ],
  openGraph: {
    title: 'Live Speech Translator – Real-Time Voice Translation | Miftah Tools',
    description:
      'Translate spoken words in real time with instant speech recognition, automatic language detection, and live voice playback.',
    url: 'https://miftahtools.com/live-speech-translator',
    siteName: 'Miftah Tools',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Speech Translator — Miftah Tools',
    description: 'Free, fast, real-time live voice translation across Urdu, Arabic, English, Hindi and 20+ languages.',
  },
};

export default function LiveSpeechTranslatorPage() {
  return (
    <div className="w-full bg-[#FAFBFC] dark:bg-[#121820] min-h-screen py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 mb-4 space-y-3">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Live Speech Translator' }]}
          rightAction={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FavoriteButton toolId="live-speech-translator" />
              <AddToHomeButton toolId="live-speech-translator" toolName="Live Speech Translator" category="media" variant="pill" />
            </div>
          }
        />
        <div className="text-center space-y-1">
          <ToolActionHeader toolId="live-speech-translator" toolName="Live Speech Translator" category="media" slug="live-speech-translator" />
        </div>
      </div>
      <LiveSpeechTranslator />
    </div>
  );
}
