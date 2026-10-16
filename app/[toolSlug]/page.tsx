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
      title: 'Tool Not Found — MiftahTools',
    };
  }

  const canonicalUrl = `https://miftahtools.com/tools/${tool.slug}/`;

  return {
    title: `${tool.name} Online Free — ${tool.shortDesc} | MiftahTools`,
    description: tool.fullDesc || tool.shortDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function ToolSlugPage({ params }: { params: { toolSlug: string } }) {
  const tool = resolveTool(params.toolSlug);
  if (!tool) notFound();

  const canonicalUrl = `https://miftahtools.com/tools/${tool.slug}/`;

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <meta httpEquiv="refresh" content={`0;url=${canonicalUrl}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace("${canonicalUrl}");`,
        }}
      />
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Redirecting to {tool.name}...</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This tool has moved to its permanent URL. If you are not redirected automatically, please{' '}
          <a href={canonicalUrl} className="text-brand-600 dark:text-brand-400 font-bold underline">
            click here to open {tool.name}
          </a>.
        </p>
      </div>
    </>
  );
}
