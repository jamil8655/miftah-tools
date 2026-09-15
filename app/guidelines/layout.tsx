import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Guidelines & Privacy Best Practices – Miftah Tools',
  description:
    'Best practices and guidelines for document security, offline tool usage, batch operations, and image optimization on Miftah Tools.',
  alternates: {
    canonical: 'https://miftahtools.com/guidelines',
  },
  openGraph: {
    title: 'User Guidelines & Privacy Best Practices – Miftah Tools',
    description: 'Guidelines and best practices for using Miftah Tools.',
    url: 'https://miftahtools.com/guidelines',
    siteName: 'Miftah Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User Guidelines & Privacy Best Practices – Miftah Tools',
    description: 'Guidelines and best practices for using Miftah Tools.',
  },
};

export default function GuidelinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
