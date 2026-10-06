import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Support',
  description: 'Get in touch with the Miftah Tools support and developer team for inquiries, bug reports, feature requests, and partnership.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
