import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeContext';
import { I18nProvider } from '@/lib/i18n/i18n-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { UserStoreProvider } from '@/lib/user/user-store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { PwaInstallBanner } from '@/components/shared/PwaInstallBanner';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';
import { NativeAndroidRuntime } from '@/components/layout/NativeAndroidRuntime';
import { StickyBottomAd } from '@/components/ads/StickyBottomAd';
import { AppOpenAd } from '@/components/ads/AppOpenAd';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { siteConfig } from '@/config/site';
import { adConfig } from '@/config/ads';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#0284c7',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://miftahtools.com'),
  title: {
    default: 'Miftah Tools – 220+ Free Online Digital Tools',
    template: '%s | Miftah Tools',
  },
  description: 'Use 220+ useful online tools for PDF, documents, images, text, conversion and everyday digital tasks with Miftah Tools. 100% private in-browser processing.',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'miftah tools',
    'free online tools',
    'pdf tools',
    'compress pdf',
    'merge pdf',
    'pdf to word ocr',
    'image compression',
    'video downloader',
    'developer tools',
    'json formatter',
    'password generator',
    'ocr image to text',
    'qr code generator',
  ],
  authors: [{ name: 'Miftah Tools', url: 'https://miftahtools.com' }],
  creator: 'Miftah Tools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://miftahtools.com',
    title: 'Miftah Tools – 220+ Free Online Digital Tools',
    description: 'Use 220+ useful online tools for PDF, documents, images, text, and media with 100% private in-browser processing.',
    siteName: 'Miftah Tools',
    images: [
      {
        url: 'https://miftahtools.com/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Miftah Tools Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miftah Tools – 220+ Free Online Digital Tools',
    description: 'Use 220+ useful online tools for PDF, documents, images, text, and media with 100% private in-browser processing.',
    images: ['https://miftahtools.com/icon-512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Miftah Tools',
        url: 'https://miftahtools.com/',
        logo: 'https://miftahtools.com/icon-512.png',
        sameAs: ['https://github.com/jamil8655/miftah-tools'],
      },
      {
        '@type': 'WebSite',
        name: 'Miftah Tools',
        url: 'https://miftahtools.com/',
        description: '220+ free high-performance client-side digital utilities and document tools.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://miftahtools.com/tools?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        name: 'Miftah Tools Suite',
        url: 'https://miftahtools.com/',
        description: '220+ free online digital tools for PDF, images, documents, audio, and coding with local WebAssembly processing.',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All (Web, Android, iOS, Windows, macOS, Linux)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0284c7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Miftah Tools" />

        {/* Global Multi-script Typography (Noto Sans Arabic for Urdu/Arabic, Devanagari Hindi, Inter/Plus Jakarta Sans) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&family=Noto+Kufi+Arabic:wght@400;600;700;800;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Google Analytics 4 (GA4) with SPA Route Tracking */}
        <GoogleAnalytics />

        {adConfig.enabled && adConfig.adsense.client && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsense.client}`}
            crossOrigin="anonymous"
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-brand-500 selection:text-white w-full max-w-full overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>
              <UserStoreProvider>
                <Header />
                <NativeAndroidRuntime />
                <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
                <Footer />
                <MobileNav />
                <PwaInstallBanner />
                <ServiceWorkerRegister />
                <StickyBottomAd />
                <AppOpenAd />
              </UserStoreProvider>
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
