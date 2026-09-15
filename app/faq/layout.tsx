import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) – Miftah Tools',
  description:
    'Find answers to common questions about file security, supported formats, offline PWA access, zero server tracking, and browser compatibility on Miftah Tools.',
  alternates: {
    canonical: 'https://miftahtools.com/faq/',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) – Miftah Tools',
    description: 'Frequently asked questions and answers about Miftah Tools.',
    url: 'https://miftahtools.com/faq/',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions (FAQ) – Miftah Tools',
    description: 'Frequently asked questions and answers about Miftah Tools.',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
