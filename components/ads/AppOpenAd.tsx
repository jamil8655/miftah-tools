'use client';

import { useEffect } from 'react';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';

export function AppOpenAd() {
  useEffect(() => {
    if (!adConfig.enabled) return;

    // Check if native Capacitor environment
    if (adManager.isNativeEnvironment()) {
      // 15-second debounce between launches in the same session
      const lastShown = sessionStorage.getItem('miftah_app_open_last');
      const now = Date.now();
      if (lastShown && now - parseInt(lastShown, 10) < 15000) {
        return;
      }

      sessionStorage.setItem('miftah_app_open_last', Date.now().toString());

      // Trigger native AdMob App Open Ad via AdManager
      adManager.showAppOpenAd().catch((e) => {
        console.warn('[AdMob] Native App Open Ad skipped:', e);
      });
    }
  }, []);

  // AdMob App Open is a native full-screen overlay managed by Google Mobile Ads SDK.
  // Never render simulated HTML modals or countdowns in the DOM.
  return null;
}

