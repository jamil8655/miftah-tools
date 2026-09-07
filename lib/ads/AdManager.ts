'use client';

import { adConfig } from '@/config/ads';

export interface AdManagerOptions {
  isPremiumUser?: boolean;
}

export interface AdRewardResult {
  type: string;
  amount: number;
}

const EXCLUDED_AD_ROUTES = [
  '/pdf-editor',
  '/pdf-workspace',
  '/quiz',
  '/account',
  '/settings',
  '/privacy',
  '/terms',
  '/disclaimer',
];

export class AdManager {
  private static instance: AdManager | null = null;
  private isInitialized = false;
  private isNative = false;
  private isAdMobAvailable = false;
  private lastInterstitialTime = 0;
  private readonly INTERSTITIAL_COOLDOWN_MS = 60000; // Strict 60s cooldown between interstitials
  private isInterstitialLoading = false;
  private isRewardedLoading = false;
  private isRewardedInterstitialLoading = false;
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
   * Check if current route permits ad presentation (guarantees reading/quiz/auth privacy)
   */
  public isRouteAdSafe(pathname?: string | null): boolean {
    if (!pathname) return true;
    return !EXCLUDED_AD_ROUTES.some((route) => pathname.startsWith(route));
  }

  /**
   * 1. Initialize AdMob and Google User Messaging Platform (UMP)
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
        const { AdMob, InterstitialAdPluginEvents, RewardAdPluginEvents } = await import('@capacitor-community/admob');
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
          console.warn('[AdMob UMP] Consent check skipped or handled:', consentError);
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
        this.preloadRewardedInterstitial();
      }

      this.isInitialized = true;
      console.log('[AdMob] AdManager initialized successfully.');
    } catch (e) {
      console.warn('[AdMob] Native initialization fallback to web mock:', e);
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

  public isNativeEnvironment(): boolean {
    return this.isNative;
  }

  /**
   * 1. APP OPEN AD: Trigger native app open ad on app start / resume
   */
  public async showAppOpenAd(): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) return false;

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isNative && this.isAdMobAvailable) {
      try {
        const { AdMob } = await import('@capacitor-community/admob');
        const adId = adConfig.admob.appOpenId || 'ca-app-pub-3660764533582226/1916156788';

        await AdMob.prepareInterstitial({
          adId,
          isTesting: false,
        });
        await AdMob.showInterstitial();
        return true;
      } catch (e) {
        console.warn('[AdMob] App Open Ad failed natively, attempting Interstitial fallback:', e);
        try {
          const { AdMob } = await import('@capacitor-community/admob');
          const fallbackId = adConfig.admob.interstitialId || 'ca-app-pub-3660764533582226/8769822246';
          await AdMob.prepareInterstitial({
            adId: fallbackId,
            isTesting: false,
          });
          await AdMob.showInterstitial();
          return true;
        } catch (err2) {
          console.warn('[AdMob] Interstitial fallback also failed natively:', err2);
          return false;
        }
      }
    }

    return false;
  }

  /**
   * 2. ADAPTIVE BANNER ADS: Show adaptive banner at bottom of suitable browsing screens
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
      console.warn('[AdMob] Adaptive Banner show failed:', e);
    }
  }

  /**
   * 8. FIXED SIZE BANNER: Show fixed size banner only when required
   */
  public async showFixedBanner(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNative || !this.isAdMobAvailable) return;

    try {
      const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
      const adId = process.env.NODE_ENV === 'production' && !adConfig.admob.fixedBannerId.includes('3940256099942544')
        ? adConfig.admob.fixedBannerId
        : 'ca-app-pub-3940256099942544/6300978111';

      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      console.warn('[AdMob] Fixed Banner show failed:', e);
    }
  }

  /**
   * Hide Banner (e.g. during full-screen viewer, reading, media playback, quiz)
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
   * 3. INTERSTITIAL ADS: Show only at natural navigation boundaries with frequency cooldown
   */
  public async showInterstitial(): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) return false;

    // Check frequency cooldown (at least 60 seconds between interstitials)
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN_MS) {
      console.log('[AdMob] Interstitial skipped due to 60s cooldown limit.');
      return false;
    }

    if (this.isNative && this.isAdMobAvailable) {
      try {
        const { AdMob } = await import('@capacitor-community/admob');
        await AdMob.showInterstitial();
        this.lastInterstitialTime = Date.now();
        return true;
      } catch (e) {
        console.warn('[AdMob] Native interstitial unavailable. Continuing navigation gracefully:', e);
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
   * 4. REWARDED ADS: Show only for genuine optional features and grant reward strictly upon verified SDK callback
   */
  public async showRewardedAd(onRewardVerified: (rewardItem: AdRewardResult) => void): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) {
      // If user is premium or ads disabled, grant perk directly
      onRewardVerified({ type: 'batch_unlocked', amount: 1 });
      return true;
    }

    if (this.isNative && this.isAdMobAvailable) {
      try {
        const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          console.log('[AdMob] Verified Rewarded callback from Google Mobile Ads SDK:', reward);
          onRewardVerified({ type: reward.type || 'batch_unlocked', amount: reward.amount || 1 });
        });

        await AdMob.showRewardVideoAd();

        // Cleanup listener after presentation
        setTimeout(() => {
          rewardListener.remove();
        }, 30000);

        return true;
      } catch (e) {
        console.warn('[AdMob] Rewarded ad failed to show. Continuing gracefully:', e);
        this.preloadRewarded();
        return false;
      }
    }

    // Web simulation fallback for testing
    onRewardVerified({ type: 'batch_unlocked', amount: 1 });
    return true;
  }

  /**
   * Preload Rewarded Interstitial Ad asynchronously
   */
  public async preloadRewardedInterstitial(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNative || !this.isAdMobAvailable || this.isRewardedInterstitialLoading) return;

    this.isRewardedInterstitialLoading = true;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const adId = process.env.NODE_ENV === 'production' && !adConfig.admob.rewardedInterstitialId.includes('3940256099942544')
        ? adConfig.admob.rewardedInterstitialId
        : 'ca-app-pub-3940256099942544/5354046379';

      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      console.warn('[AdMob] Rewarded Interstitial preload skipped:', e);
    } finally {
      this.isRewardedInterstitialLoading = false;
    }
  }

  /**
   * 5. REWARDED INTERSTITIAL ADS: Show for heavy processing perk with verified SDK callback
   */
  public async showRewardedInterstitial(onRewardVerified: (rewardItem: AdRewardResult) => void): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) {
      onRewardVerified({ type: 'priority_processing', amount: 1 });
      return true;
    }

    if (this.isNative && this.isAdMobAvailable) {
      try {
        const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          console.log('[AdMob] Verified Rewarded Interstitial callback:', reward);
          onRewardVerified({ type: reward.type || 'priority_processing', amount: reward.amount || 1 });
        });

        await AdMob.showRewardVideoAd();

        setTimeout(() => {
          rewardListener.remove();
        }, 30000);

        return true;
      } catch (e) {
        console.warn('[AdMob] Rewarded Interstitial unavailable:', e);
        this.preloadRewardedInterstitial();
        return false;
      }
    }

    onRewardVerified({ type: 'priority_processing', amount: 1 });
    return true;
  }
}

export const adManager = AdManager.getInstance();
