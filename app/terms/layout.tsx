import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service – Miftah Tools',
  description:
    'Review the official terms of service and conditions for using Miftah Tools online utilities, file processors, and developer resources.',
  alternates: {
    canonical: 'https://miftahtools.com/terms',
  },
  openGraph: {
    title: 'Terms of Service – Miftah Tools',
    description: 'Terms of service and usage conditions for Miftah Tools.',
    url: 'https://miftahtools.com/terms',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service – Miftah Tools',
    description: 'Terms of service and usage conditions for Miftah Tools.',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
