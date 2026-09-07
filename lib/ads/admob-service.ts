'use client';

import { adConfig } from '@/config/ads';

export class AdMobManager {
  private static isInitialized = false;

  /**
   * Initialize AdMob SDK in Android Capacitor environment
   */
  public static async initialize() {
    if (this.isInitialized) return;
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
        console.log('[AdMob] Native platform detected. Initializing AdMob with Test App ID:', adConfig.admob.appIdAndroid);
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('[AdMob] Initialization failed:', e);
    }
  }

  /**
   * Show App Open Ad on App Cold Start or Resume
   */
  public static async showAppOpenAd(): Promise<boolean> {
    if (!adConfig.enabled) return false;
    console.log('[AdMob Test] Triggering App Open Ad:', adConfig.admob.appOpenId);
    return true;
  }

  /**
   * Show Interstitial Ad (e.g. after successful PDF conversion or download click)
   */
  public static async showInterstitial(): Promise<boolean> {
    if (!adConfig.enabled) return false;
    console.log('[AdMob Test] Triggering Interstitial Ad:', adConfig.admob.interstitialId);
    return true;
  }

  /**
   * Show Rewarded Video Ad (e.g. to unlock batch mode or extra file limits)
   */
  public static async showRewardedAd(onRewardEarned: () => void): Promise<boolean> {
    if (!adConfig.enabled) return false;
    console.log('[AdMob Test] Triggering Rewarded Video Ad:', adConfig.admob.rewardedId);
    setTimeout(() => {
      onRewardEarned();
    }, 500);
    return true;
  }

  /**
   * Get Active Ad Unit for Specific Placement
   */
  public static getAdUnit(type: keyof typeof adConfig.admob): string {
    return adConfig.admob[type] || '';
  }
}
