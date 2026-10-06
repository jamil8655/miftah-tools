import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer & Liability Terms',
  description: 'Legal disclaimer and warranty limitations for Miftah Tools web and Android application.',
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
