import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Safety',
  description: 'Miftah Tools privacy policy: 100% on-device client-side document processing, zero file uploads, transparent telemetry, and Google Play compliance.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
