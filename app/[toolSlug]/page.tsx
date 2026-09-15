import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS_LIST } from '@/lib/tools-config';
import { ToolPageClient } from '@/components/shared/ToolPageClient';
import { ToolSeoContent } from '@/components/shared/ToolSeoContent';
import { getCompleteToolSeo, SITE_DOMAIN, SITE_BRAND } from '@/lib/seo/seo-engine';

const TOOL_ALIASES: Record<string, string> = {
  'pdf-to-word': 'pdf-to-docx',
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
      title: `Tool Not Found | ${SITE_BRAND}`,
      robots: { index: false, follow: false },
    };
  }

  const seo = getCompleteToolSeo(tool);

  return {
    title: seo.title,
    description: seo.metaDescription,
    keywords: tool.tags?.join(', ') || 'online tools, pdf, image converter, video downloader',
    alternates: {
      // Primary canonical URL points to official /tools/[slug]
      canonical: seo.canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.metaDescription,
      type: 'website',
      url: seo.canonicalUrl,
      siteName: SITE_BRAND,
      images: [
        {
          url: `${SITE_DOMAIN}/icon-512.png`,
          width: 512,
          height: 512,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.metaDescription,
      images: [`${SITE_DOMAIN}/icon-512.png`],
    },
  };
}

export default function ToolSlugPage({ params }: { params: { toolSlug: string } }) {
  const tool = resolveTool(params.toolSlug);
  if (!tool) notFound();

  const seo = getCompleteToolSeo(tool);

  return (
    <>
      {seo.jsonLd.map((schema, index) => (
        <script
          key={`schema-slug-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="w-full">
        <ToolPageClient tool={tool} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <ToolSeoContent tool={tool} />
        </div>
      </div>
    </>
  );
}
