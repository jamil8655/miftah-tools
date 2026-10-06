import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description: 'Everything you need to know about Miftah Tools 220+ free tools, 100% on-device privacy guarantees, courses, and offline PWA capabilities.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
