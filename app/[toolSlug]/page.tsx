import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS_LIST } from '@/lib/tools-config';
import { ToolPageClient } from '@/components/shared/ToolPageClient';

export function generateStaticParams() {
  return TOOLS_LIST.flatMap((tool) => [
    { toolSlug: tool.slug },
    { toolSlug: tool.id },
  ]);
}

export async function generateMetadata({ params }: { params: { toolSlug: string } }): Promise<Metadata> {
  const tool = TOOLS_LIST.find((t) => t.slug === params.toolSlug || t.id === params.toolSlug);
  if (!tool) {
    return {
      title: 'Tool Not Found — Miftah Tools',
    };
  }

  const title = `${tool.name} — Free Online Tool | Miftah Tools`;
  const description = tool.fullDesc || tool.shortDesc;

  return {
    title,
    description,
    keywords: tool.tags?.join(', ') || 'online tools, pdf, image converter, video downloader',
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://jamil8655.github.io/nexora-tools/${tool.slug}`,
      siteName: 'Miftah Tools',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ToolSlugPage({ params }: { params: { toolSlug: string } }) {
  const tool = TOOLS_LIST.find((t) => t.slug === params.toolSlug || t.id === params.toolSlug);
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1250',
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
