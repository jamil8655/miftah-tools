'use client';

import { useEffect } from 'react';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';

export function AppOpenAd() {
  useEffect(() => {
    if (!adConfig.enabled) return;

    if (adManager.isNativeEnvironment()) {
      adManager.showAppOpenAdIfEligible().catch((e) => {
        console.warn('[AdMob] App Open Ad skipped:', e);
      });
    }
  }, []);

  // AdMob App Open is a native full-screen overlay managed by Google Mobile Ads SDK.
  // Never render simulated HTML modals or countdowns in the DOM.
  return null;
}

