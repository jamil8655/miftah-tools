import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usage Terms & Access Policy – Miftah Tools',
  description:
    'Learn about Miftah Tools open access model. All 220+ digital tools and master resources are 100% free with no charges or subscription fees.',
  alternates: {
    canonical: 'https://miftahtools.com/refund/',
  },
  openGraph: {
    title: 'Usage Terms & Access Policy – Miftah Tools',
    description: 'Learn about Miftah Tools open access policy and free utilities.',
    url: 'https://miftahtools.com/refund/',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Usage Terms & Access Policy – Miftah Tools',
    description: 'Learn about Miftah Tools open access policy and free utilities.',
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
