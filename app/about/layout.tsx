import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Miftah Tools, our 100% on-device client-side privacy architecture, WebAssembly conversion engine, and open practical developer education.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
