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
  return TOOLS_LIST.find((t) => t.id === resolvedId || t.slug === resolvedId || t.id === identifier || t.slug === identifier);
}

export function generateStaticParams() {
  const directParams = TOOLS_LIST.flatMap((tool) => [
    { toolId: tool.id },
    { toolId: tool.slug },
  ]);
  const aliasParams = Object.keys(TOOL_ALIASES).map((alias) => ({ toolId: alias }));
  return [...directParams, ...aliasParams];
}

import { getCompleteToolSeo } from '@/lib/seo/seo-engine';

export async function generateMetadata({ params }: { params: { toolId: string } }): Promise<Metadata> {
  const tool = resolveTool(params.toolId);
  if (!tool) {
    return {
      title: 'Tool Not Found — MiftahTools',
    };
  }

  const title = `${tool.name} Online Free — ${tool.shortDesc} | MiftahTools`;
  let description = (tool.fullDesc || tool.shortDesc || `Use ${tool.name} free online with MiftahTools.`).trim();
  if (description.length < 140) {
    description = `${description} 100% free with private client-side processing on MiftahTools.`;
  }
  if (description.length > 160) {
    description = description.slice(0, 157) + '...';
  }

  const canonicalUrl = `https://miftahtools.com/tools/${tool.slug}/`;

  return {
    title,
    description,
    keywords: tool.tags?.join(', ') || `${tool.name.toLowerCase()}, online tools, free utility, miftah tools`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'MiftahTools',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ToolPage({ params }: { params: { toolId: string } }) {
  const tool = resolveTool(params.toolId);
  if (!tool) notFound();

  const seo = getCompleteToolSeo(tool);

  return (
    <>
      {seo.jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ToolPageClient tool={tool} />
    </>
  );
}

