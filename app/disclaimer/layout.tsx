import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer & Responsible Use – Miftah Tools',
  description:
    'Legal disclaimer regarding file transformations, privacy guarantees, third-party media downloading, and software usage on Miftah Tools.',
  alternates: {
    canonical: 'https://miftahtools.com/disclaimer/',
  },
  openGraph: {
    title: 'Disclaimer & Responsible Use – Miftah Tools',
    description: 'Legal disclaimer and responsible use guidelines for Miftah Tools.',
    url: 'https://miftahtools.com/disclaimer/',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer & Responsible Use – Miftah Tools',
    description: 'Legal disclaimer and responsible use guidelines for Miftah Tools.',
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
