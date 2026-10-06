import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Guidelines & Ethics',
  description: 'Community and usage guidelines for Miftah Tools users, educators, and developers.',
};

export default function GuidelinesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
