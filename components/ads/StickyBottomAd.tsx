'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';

export function StickyBottomAd() {
  const pathname = usePathname();

  useEffect(() => {
    if (!adConfig.enabled) return;

    if (adManager.isNativeEnvironment()) {
      const isSafe = adManager.isRouteAdSafe(pathname);
      if (isSafe) {
        // Show native bottom adaptive banner
        adManager.showBanner().catch((e) => {
          console.warn('[AdMob] Native Banner show skipped:', e);
        });
      } else {
        // Hide native banner on sensitive/editing screens (e.g. PDF editor, Quiz, Settings)
        adManager.hideBanner().catch((e) => {
          console.warn('[AdMob] Native Banner hide skipped:', e);
        });
      }
    }
  }, [pathname]);

  // Native banner is rendered directly by Google Mobile Ads SDK on native platform.
  // On web, we avoid floating fixed dummy bars over navigation for compliance and UX.
  return null;
}

