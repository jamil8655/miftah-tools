import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS_LIST } from '@/lib/tools-config';
import { ToolPageClient } from '@/components/shared/ToolPageClient';

const TOOL_ALIASES: Record<string, string> = {
  'pdf-to-word': 'pdf-to-docx',
  'pdf-to-word-ocr': 'ocr-to-word',
  'ocr-pdf-to-word': 'ocr-to-word',
  'word-to-pdf': 'docx-to-pdf',
  'ocr-image-to-text': 'ocr-image',
  'qr-code-generator': 'qr-generator',
  'compress-images': 'compress-image',
  'resize-images': 'image-resizer',
  'pdf-to-jpg': 'pdf-to-images',
  'pdf-to-png': 'pdf-to-images',
  'pdf-to-image': 'pdf-to-images',
  'pdf-sign': 'pdf-signer',
  'sign-pdf': 'pdf-signer',
  'scanner': 'camera-scanner',
  'doc-scanner': 'camera-scanner',
  'video-downloader': 'media-downloader',
  'social-video-downloader': 'media-downloader',
  'social-media-video-downloader': 'media-downloader',
  'video-saver': 'media-downloader',
  'voice-to-text': 'voice-to-text',
  'speech-to-text': 'voice-to-text',
  'audio-to-text': 'voice-to-text',
  'speech-translator': 'live-speech-translator',
  'voice-translator': 'live-speech-translator',
  'live-translator': 'live-speech-translator',
};

function resolveTool(identifier: string) {
  const resolvedId = TOOL_ALIASES[identifier] || identifier;
  return TOOLS_LIST.find((t) => t.slug === resolvedId || t.id === resolvedId || t.slug === identifier || t.id === identifier);
}

export function generateStaticParams() {
  const directParams = TOOLS_LIST.flatMap((tool) => [
    { toolSlug: tool.slug },
    { toolSlug: tool.id },
  ]);
  const aliasParams = Object.keys(TOOL_ALIASES).map((alias) => ({ toolSlug: alias }));
  return [...directParams, ...aliasParams];
}

export async function generateMetadata({ params }: { params: { toolSlug: string } }): Promise<Metadata> {
  const tool = resolveTool(params.toolSlug);
  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  const title = `${tool.name} — Free Online Tool`;
  const description = tool.fullDesc || tool.shortDesc;

  return {
    title,
    description,
    keywords: tool.tags?.join(', ') || 'online tools, pdf, image converter, video downloader',
    alternates: {
      canonical: `https://miftahtools.com/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} — Free Online Tool | Miftah Tools`,
      description,
      type: 'website',
      url: `https://miftahtools.com/${tool.slug}`,
      siteName: 'Miftah Tools',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — Free Online Tool | Miftah Tools`,
      description,
    },
  };
}

export default function ToolSlugPage({ params }: { params: { toolSlug: string } }) {
  const tool = resolveTool(params.toolSlug);
  if (!tool) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.fullDesc || tool.shortDesc,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolPageClient tool={tool} />
    </>
  );
}
