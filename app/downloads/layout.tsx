import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download History – Miftah Tools',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
