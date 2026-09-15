import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Miftah Tools – Fast, Private & Free Online Utilities',
  description:
    'Learn about Miftah Tools, our mission for 100% in-browser client-side privacy, and our modern WebAssembly tool processing ecosystem with zero server uploads.',
  alternates: {
    canonical: 'https://miftahtools.com/about/',
  },
  openGraph: {
    title: 'About Miftah Tools – Fast, Private & Free Online Utilities',
    description: 'Learn about Miftah Tools and our privacy-first digital utility ecosystem.',
    url: 'https://miftahtools.com/about/',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Miftah Tools – Fast, Private & Free Online Utilities',
    description: 'Learn about Miftah Tools and our privacy-first digital utility ecosystem.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
