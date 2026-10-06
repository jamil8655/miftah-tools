import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and legal agreements governing the use of Miftah Tools free online tools and learning materials.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
