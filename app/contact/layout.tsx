import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us – Miftah Tools Support & Partnerships',
  description:
    'Get in touch with the Miftah Tools team for technical support, feature requests, bug reports, questions, and partnership opportunities.',
  alternates: {
    canonical: 'https://miftahtools.com/contact/',
  },
  openGraph: {
    title: 'Contact Us – Miftah Tools',
    description: 'Get in touch with the Miftah Tools team for support and inquiries.',
    url: 'https://miftahtools.com/contact/',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us – Miftah Tools',
    description: 'Get in touch with the Miftah Tools team for support and inquiries.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
