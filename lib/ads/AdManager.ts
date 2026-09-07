'use client';

import { adConfig } from '@/config/ads';

export interface AdManagerOptions {
  isPremiumUser?: boolean;
}

export class AdManager {
  private static instance: AdManager | null = null;
  private isInitialized = false;
  private isNative = false;
  private isAdMobAvailable = false;
  private lastInterstitialTime = 0;
  private readonly INTERSTITIAL_COOLDOWN_MS = 60000; // 60s cooldown to prevent disruptive ads
  private isInterstitialLoading = false;
  private isRewardedLoading = false;
  private isPremium = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    }
  }

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * 1. Initialize AdMob and Google Consent Platform (UMP)
   */
  public async initialize(options?: AdManagerOptions): Promise<void> {
    if (this.isInitialized) return;
    if (options?.isPremiumUser) {
      this.isPremium = true;
      console.log('[AdMob] Premium user detected. Ads disabled.');
      this.isInitialized = true;
      return;
    }

    if (!adConfig.enabled) {
      this.isInitialized = true;
      return;
    }

    try {
      if (this.isNative) {
        const { AdMob, BannerAdPluginEvents, InterstitialAdPluginEvents, RewardAdPluginEvents } = await import('@capacitor-community/admob');
        this.isAdMobAvailable = true;

        // Initialize Google Mobile Ads SDK
        await AdMob.initialize({
          testingDevices: ['EMULATOR'],
          initializeForTesting: process.env.NODE_ENV !== 'production',
        });

        // Setup User Messaging Platform (UMP) Consent if available
        try {
          const consentInfo = await AdMob.requestConsentInfo();
          if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
            await AdMob.showConsentForm();
          }
        } catch (consentError) {
          console.warn('[AdMob UMP] Consent check skipped or failed:', consentError);
        }

        // Register Global Listeners for Lifecycle Monitoring
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          console.log('[AdMob] Interstitial dismissed. Resuming app flow.');
          this.preloadInterstitial();
        });

        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          console.log('[AdMob] Rewarded Ad dismissed.');
          this.preloadRewarded();
        });

        // Preload initial interstitial & rewarded ads asynchronously
        this.preloadInterstitial();
        this.preloadRewarded();
      }

      this.isInitialized = true;
      console.log('[AdMob] AdManager initialized successfully.');
    } catch (e) {
      console.warn('[AdMob] Native initialization failed or web fallback active:', e);
      this.isInitialized = true;
    }
  }

  /**
   * Set Premium / Ad-Free entitlement status
   */
  public setPremiumStatus(isPremium: boolean): void {
    this.isPremium = isPremium;
    if (isPremium && this.isNative && this.isAdMobAvailable) {
      this.hideBanner();
    }
  }

  /**
   * 2. BANNER ADS: Show adaptive banner at bottom of non-critical screens
   */
  public async showBanner(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNative || !this.isAdMobAvailable) return;

    try {
      const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
      const adId = process.env.NODE_ENV === 'production' && !adConfig.admob.adaptiveBannerId.includes('3940256099942544')
        ? adConfig.admob.adaptiveBannerId
        : 'ca-app-pub-3940256099942544/9214589741';

      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      console.warn('[AdMob] Banner show failed:', e);
    }
  }

  /**
   * Hide Banner (e.g. during full-screen viewer, reading, media playback)
   */
  public async hideBanner(): Promise<void> {
    if (!this.isNative || !this.isAdMobAvailable) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
    } catch (e) {
      console.warn('[AdMob] Banner hide failed:', e);
    }
  }

  /**
   * Preload Interstitial Ad asynchronously
   */
  public async preloadInterstitial(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNative || !this.isAdMobAvailable || this.isInterstitialLoading) return;

    this.isInterstitialLoading = true;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const adId = process.env.NODE_ENV === 'production' && !adConfig.admob.interstitialId.includes('3940256099942544')
        ? adConfig.admob.interstitialId
        : 'ca-app-pub-3940256099942544/1033173712';

      await AdMob.prepareInterstitial({
        adId,
        isTesting: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      console.warn('[AdMob] Interstitial preload failed:', e);
    } finally {
      this.isInterstitialLoading = false;
    }
  }

  /**
   * 3. INTERSTITIAL ADS: Show at natural transition points with strict cooldown
   */
  public async showInterstitial(): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) return false;

    // Check frequency cooldown (at least 60 seconds between interstitials)
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN_MS) {
      console.log('[AdMob] Interstitial skipped due to frequency cooldown.');
      return false;
    }

    if (this.isNative && this.isAdMobAvailable) {
      try {
        const { AdMob } = await import('@capacitor-community/admob');
        await AdMob.showInterstitial();
        this.lastInterstitialTime = Date.now();
        return true;
      } catch (e) {
        console.warn('[AdMob] Failed to show native interstitial. Continuing navigation:', e);
        this.preloadInterstitial();
        return false;
      }
    }

    return false;
  }

  /**
   * Preload Rewarded Ad asynchronously
   */
  public async preloadRewarded(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNative || !this.isAdMobAvailable || this.isRewardedLoading) return;

    this.isRewardedLoading = true;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const adId = process.env.NODE_ENV === 'production' && !adConfig.admob.rewardedId.includes('3940256099942544')
        ? adConfig.admob.rewardedId
        : 'ca-app-pub-3940256099942544/5224354917';

      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      console.warn('[AdMob] Rewarded Ad preload failed:', e);
    } finally {
      this.isRewardedLoading = false;
    }
  }

  /**
   * 4. REWARDED ADS: Show only for legitimate reward features and grant reward strictly upon verified callback
   */
  public async showRewardedAd(onRewardVerified: (rewardItem: { type: string; amount: number }) => void): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) {
      // If user is premium or ads disabled, grant perk directly
      onRewardVerified({ type: 'batch_unlocked', amount: 1 });
      return true;
    }

    if (this.isNative && this.isAdMobAvailable) {
      try {
        const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

        let rewardGranted = false;
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          rewardGranted = true;
          console.log('[AdMob] Reward confirmed by Google Mobile Ads SDK:', reward);
          onRewardVerified({ type: reward.type || 'reward_points', amount: reward.amount || 1 });
        });

        await AdMob.showRewardVideoAd();

        // Remove listener after presentation
        setTimeout(() => {
          rewardListener.remove();
        }, 30000);

        return true;
      } catch (e) {
        console.warn('[AdMob] Rewarded ad failed to show:', e);
        this.preloadRewarded();
        return false;
      }
    }

    return false;
  }
}

export const adManager = AdManager.getInstance();
