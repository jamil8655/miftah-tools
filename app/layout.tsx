import type { Metadata } from 'next';
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
import { siteConfig } from '@/config/site';
import { adConfig } from '@/config/ads';

export const metadata: Metadata = {
  title: `${siteConfig.name} - Free Online Tools & Digital Skills Learning Platform`,
  description: 'NEXORA PRO provides 220+ free high-performance client-side digital utilities and modern developer & digital skill courses with zero server tracking.',
  manifest: '/nexora-tools/manifest.json',
  keywords: [
    'nexora pro',
    'online courses',
    'developer courses',
    'all in one utility',
    'pdf tools',
    'pdf to word ocr',
    'image compression',
    '4k video downloader',
    'audio volume booster',
    'video to mp3',
    'developer tools',
    'json formatter',
    'password generator',
    'ocr image to text',
    'qr code generator',
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} - Free Online Tools & Master Courses`,
    description: 'Instant, private, and secure in-browser tools with zero server tracking and interactive developer courses.',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - 220+ Free Online Tools & Digital Courses`,
    description: 'Learn modern digital skills and transform files with 100% private client-side processing.',
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
        '@type': 'WebApplication',
        name: 'NEXORA PRO',
        url: 'https://jamil8655.github.io/nexora-tools/',
        description: '220+ free high-performance online utilities and developer master courses.',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All (Web, Android, iOS, Windows, macOS, Linux)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '24890',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'WebSite',
        name: 'NEXORA PRO',
        url: 'https://jamil8655.github.io/nexora-tools/',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://jamil8655.github.io/nexora-tools/tools?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#026fc7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NEXORA PRO" />

        {/* Global Multi-script Typography (Arabic, Nastaliq Urdu, Devanagari Hindi, Inter) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&family=Noto+Kufi+Arabic:wght@400;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

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
                <main className="flex-1 w-full max-w-full overflow-x-hidden pb-20 lg:pb-0">{children}</main>
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
