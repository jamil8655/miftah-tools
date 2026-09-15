import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Control Center – Miftah Tools',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
