import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '220+ Free Online Digital Tools Directory | Miftah Tools',
  description:
    'Browse all 220+ free online tools for PDF, documents, image conversion, video downloading, OCR, compression, dev utilities, and calculators on Miftah Tools. 100% private in-browser processing.',
  alternates: {
    canonical: 'https://miftahtools.com/tools/',
  },
  openGraph: {
    title: '220+ Free Online Tools Directory | Miftah Tools',
    description: 'Browse all 220+ free online tools with 100% private in-browser processing.',
    url: 'https://miftahtools.com/tools/',
    siteName: 'Miftah Tools',
    images: [{ url: 'https://miftahtools.com/icon-512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '220+ Free Online Tools Directory | Miftah Tools',
    description: 'Browse all 220+ free online tools with 100% private in-browser processing.',
    images: ['https://miftahtools.com/icon-512.png'],
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
