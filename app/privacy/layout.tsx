import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – 100% In-Browser Local Processing | Miftah Tools',
  description:
    'Read the official Miftah Tools privacy policy. We do not store, view, or upload your documents to external servers. Your data stays 100% private on your device.',
  alternates: {
    canonical: 'https://miftahtools.com/privacy/',
  },
  openGraph: {
    title: 'Privacy Policy – 100% In-Browser Local Processing | Miftah Tools',
    description: 'Read the official Miftah Tools privacy policy. Your data stays 100% private on your device.',
    url: 'https://miftahtools.com/privacy/',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy – 100% In-Browser Local Processing | Miftah Tools',
    description: 'Read the official Miftah Tools privacy policy. Your data stays 100% private on your device.',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
