'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { adConfig } from '@/config/ads';
import { adManager } from '@/lib/ads/AdManager';

interface AdSlotProps {
  placement?: 'header' | 'in-feed' | 'tool-bottom' | 'result-page';
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical' | 'fluid';
  slotId?: string;
}

export function AdSlot({
  placement = 'tool-bottom',
  className = '',
  format = 'auto',
  slotId,
}: AdSlotProps) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement | null>(null);
  const [adFailed, setAdFailed] = useState(false);

  const isSafeRoute = adManager.isRouteAdSafe(pathname);

  // Determine slot ID
  const effectiveSlot =
    slotId ||
    (placement === 'header'
      ? adConfig.adsense.slots.headerBanner
      : placement === 'in-feed'
      ? adConfig.adsense.slots.inFeedCard
      : placement === 'result-page'
      ? adConfig.adsense.slots.resultPage
      : adConfig.adsense.slots.toolBottom);

  useEffect(() => {
    // If ads are disabled, unsafe route, or native app (native uses AdMob SDK), do not render AdSense
    if (!adConfig.enabled || !isSafeRoute || !adConfig.adsense.client || !effectiveSlot) {
      return;
    }

    if (adManager.isNativeEnvironment()) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (e) {
      console.warn('[AdSense] Slot push failed or blocked:', e);
      setAdFailed(true);
    }
  }, [pathname, isSafeRoute, effectiveSlot]);

  // If native, disabled, unsafe route, or no client/slot, collapse cleanly to 0px
  if (
    !adConfig.enabled ||
    !isSafeRoute ||
    !adConfig.adsense.client ||
    !effectiveSlot ||
    adManager.isNativeEnvironment() ||
    adFailed
  ) {
    return null;
  }

  return (
    <div
      className={`relative w-full overflow-hidden text-center transition-all duration-300 ${className}`}
      aria-label="Advertisement"
    >
      <div className="flex justify-center my-2">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '60px' }}
          data-ad-client={adConfig.adsense.client}
          data-ad-slot={effectiveSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

