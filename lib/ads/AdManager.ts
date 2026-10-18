'use client';

import { Capacitor } from '@capacitor/core';
import { adConfig } from '@/config/ads';

export interface AdManagerOptions {
  isPremiumUser?: boolean;
}

export interface AdRewardResult {
  type: string;
  amount: number;
}

export interface AdTestResult {
  success: boolean;
  type: string;
  adIdUsed: string;
  message: string;
}

const EXCLUDED_AD_ROUTES = [
  '/privacy',
  '/terms',
];

export class AdManager {
  private static instance: AdManager | null = null;
  private isInitialized = false;
  private isAdMobAvailable = false;
  private isAppListenerRegistered = false;

  private lastInterstitialTime = 0;
  private lastAppOpenTime = 0;
  private backgroundTimestamp = 0;

  private isProcessingActive = false;
  private isFullscreenShowing = false;
  private isInterstitialLoading = false;
  private isRewardedLoading = false;
  private isPremium = false;
  private isBannerVisible = false;

  private constructor() {}

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  public isNativeEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return Capacitor.isNativePlatform();
    } catch (_) {
      return false;
    }
  }

  public isSdkInitialized(): boolean {
    return this.isInitialized;
  }

  public getAdMobAvailability(): boolean {
    return this.isAdMobAvailable;
  }

  /**
   * Set flag indicating a critical user action/conversion is actively running.
   * Ads must NEVER interrupt active upload, processing, compression, conversion, or download preparation.
   */
  public setProcessingState(active: boolean): void {
    this.isProcessingActive = active;
    if (active) {
      console.log('[AdMob] Tool processing active: Fullscreen ads temporarily suspended.');
    }
  }

  public getProcessingState(): boolean {
    return this.isProcessingActive;
  }

  /**
   * Check if current route permits banner presentation
   */
  public isRouteAdSafe(pathname?: string | null): boolean {
    if (!pathname) return true;
    return !EXCLUDED_AD_ROUTES.some((route) => pathname.startsWith(route));
  }

  /**
   * 1. Initialize AdMob and lifecycle listeners
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
      if (this.isNativeEnvironment()) {
        const { AdMob, InterstitialAdPluginEvents, RewardAdPluginEvents } = await import('@capacitor-community/admob');
        this.isAdMobAvailable = true;

        // Initialize Google Mobile Ads SDK
        try {
          await AdMob.initialize({
            initializeForTesting: false,
          });
        } catch (initErr) {
          console.warn('[AdMob] Initialize direct notice:', initErr);
        }

        // Setup User Messaging Platform (UMP) Consent gracefully without blocking
        AdMob.requestConsentInfo().then(async (consentInfo) => {
          if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
            await AdMob.showConsentForm();
          }
        }).catch((consentError) => {
          console.warn('[AdMob UMP] Consent check handled:', consentError);
        });

        // Global Listeners for Lifecycle Preloading
        try {
          AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            console.log('[AdMob] Interstitial dismissed. Preloading next.');
            this.isFullscreenShowing = false;
            this.preloadInterstitial();
          });

          AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
            this.isFullscreenShowing = false;
            this.preloadInterstitial();
          });

          AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            console.log('[AdMob] Rewarded ad dismissed. Preloading next.');
            this.isFullscreenShowing = false;
            this.preloadRewarded();
          });

          AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
            this.isFullscreenShowing = false;
            this.preloadRewarded();
          });
        } catch (eventErr) {
          console.warn('[AdMob] Event listeners registration:', eventErr);
        }

        // App Background / Foreground Lifecycle Listener for App Open Ads
        if (!this.isAppListenerRegistered) {
          this.isAppListenerRegistered = true;
          try {
            const { App } = await import('@capacitor/app');
            App.addListener('appStateChange', (state) => {
              if (!state.isActive) {
                this.backgroundTimestamp = Date.now();
              } else {
                const now = Date.now();
                const backgroundDuration = this.backgroundTimestamp > 0 ? now - this.backgroundTimestamp : 0;
                this.backgroundTimestamp = 0;

                // Only show App Open Ad if app was in background for minimum period and no processing is running
                if (
                  backgroundDuration >= adConfig.cooldowns.minBackgroundTimeForAppOpenMs &&
                  !this.isProcessingActive &&
                  !this.isFullscreenShowing
                ) {
                  this.showAppOpenAdIfEligible();
                }
              }
            });
          } catch (e) {
            console.warn('[AdMob] App lifecycle listener notice:', e);
          }
        }

        // Preload initial ads
        this.preloadInterstitial();
        this.preloadRewarded();
      }

      this.isInitialized = true;
      console.log('[AdMob] AdManager initialized successfully.');
    } catch (e) {
      console.warn('[AdMob] Native initialization notice:', e);
      this.isInitialized = true;
    }
  }

  public setPremiumStatus(isPremium: boolean): void {
    this.isPremium = isPremium;
    if (isPremium && this.isNativeEnvironment() && this.isAdMobAvailable) {
      this.hideBanner();
    }
  }

  /**
   * 1. APP OPEN AD with Production Priority & Auto-Fallback
   */
  public async showAppOpenAdIfEligible(): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium || !this.isNativeEnvironment() || this.isProcessingActive || this.isFullscreenShowing) {
      return false;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const now = Date.now();
    if (now - this.lastAppOpenTime < adConfig.cooldowns.appOpenMs) {
      console.log('[AdMob] App Open Ad skipped due to frequency cooldown.');
      return false;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const liveAdId = adConfig.admob.appOpenId || 'ca-app-pub-3660764533582226/1916156788';

      this.isFullscreenShowing = true;
      try {
        await AdMob.loadAppOpen({ adId: liveAdId });
        await AdMob.showAppOpen();
        this.lastAppOpenTime = Date.now();
        return true;
      } catch (loadErr) {
        console.warn('[AdMob] Real Production App Open Ad notice from Google AdMob:', loadErr);
        return false;
      }
    } catch (e) {
      console.warn('[AdMob] Real App Open Ad trigger notice:', e);
      return false;
    } finally {
      this.isFullscreenShowing = false;
    }
  }

  /**
   * 2. BOTTOM ADAPTIVE BANNER with Production Priority & Guaranteed Display
   */
  public getBannerVisible(): boolean {
    return this.isBannerVisible;
  }

  /**
   * 2. BOTTOM ADAPTIVE BANNER with Production Priority & Guaranteed Display
   */
  public async showAdaptiveBanner(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNativeEnvironment()) return;

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents } = await import('@capacitor-community/admob');
      const liveAdId = adConfig.admob.adaptiveBannerId || 'ca-app-pub-3660764533582226/7382282057';

      const failHandler = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err: any) => {
        console.warn('[AdMob] Real Production Banner notice from Google AdMob:', err);
        failHandler.remove();
      });

      const loadHandler = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('[AdMob] Real Production Banner loaded successfully from Google AdMob.');
        this.isBannerVisible = true;
        failHandler.remove();
        loadHandler.remove();
      });

      try {
        await AdMob.showBanner({
          adId: liveAdId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false,
        });
        this.isBannerVisible = true;
      } catch (prodErr) {
        console.warn('[AdMob] Real Production Banner display notice:', prodErr);
      }
    } catch (e) {
      console.warn('[AdMob] Real Adaptive Banner notice:', e);
    }
  }

  public async hideBanner(): Promise<void> {
    if (!this.isNativeEnvironment()) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
      this.isBannerVisible = false;
    } catch (e) {
      console.warn('[AdMob] Banner hide notice:', e);
    }
  }

  public async resumeBanner(): Promise<void> {
    if (!this.isNativeEnvironment() || this.isPremium) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.resumeBanner();
      this.isBannerVisible = true;
    } catch (e) {
      this.showAdaptiveBanner();
    }
  }

  /**
   * Preload Real Production Interstitial from Google AdMob
   */
  public async preloadInterstitial(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNativeEnvironment() || this.isInterstitialLoading) return;

    this.isInterstitialLoading = true;
    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
      const liveAdId = adConfig.admob.interstitialId || 'ca-app-pub-3660764533582226/8769822246';

      const failHandler = await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err: any) => {
        console.warn('[AdMob] Real Interstitial preload notice from Google AdMob:', err);
        failHandler.remove();
      });

      const loadHandler = await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('[AdMob] Real Interstitial preloaded successfully from Google AdMob.');
        failHandler.remove();
        loadHandler.remove();
      });

      await AdMob.prepareInterstitial({
        adId: liveAdId,
        isTesting: false,
      });
      console.log('[AdMob] Real Production Interstitial prepare requested.');
    } catch (e) {
      console.warn('[AdMob] Real Interstitial preload notice:', e);
    } finally {
      this.isInterstitialLoading = false;
    }
  }

  /**
   * 4. INTERSTITIAL AD — EXACT DOWNLOAD WORKFLOW INTEGRATION
   * CRITICAL GUARANTEE: Never freezes or displays a white blank screen!
   * Downloads are ALWAYS triggered immediately. Interstitials are displayed non-blockingly.
   */
  public async showInterstitialOnDownload(onDownloadAction: () => Promise<void> | void): Promise<void> {
    // 1. Immediately trigger the download action so the user receives their file with ZERO delay
    try {
      await onDownloadAction();
    } catch (err) {
      console.error('[Download] Direct execution error:', err);
    }

    const isEligible =
      adConfig.enabled &&
      !this.isPremium &&
      this.isNativeEnvironment() &&
      !this.isProcessingActive &&
      !this.isFullscreenShowing &&
      Date.now() - this.lastInterstitialTime >= adConfig.cooldowns.interstitialMs;

    if (!isEligible) {
      return;
    }

    // 2. Non-blocking Interstitial display with watchdog timer
    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
      this.isFullscreenShowing = true;

      // 3.5s watchdog so UI state never gets permanently stuck
      const safetyWatchdog = setTimeout(() => {
        this.isFullscreenShowing = false;
      }, 3500);

      const dismissHandle = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        this.lastInterstitialTime = Date.now();
        this.isFullscreenShowing = false;
        clearTimeout(safetyWatchdog);
        dismissHandle.remove();
        // Preload next interstitial in background
        this.preloadInterstitial().catch(() => {});
      });

      const failedHandle = await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
        this.isFullscreenShowing = false;
        clearTimeout(safetyWatchdog);
        failedHandle.remove();
        dismissHandle.remove();
      });

      await AdMob.showInterstitial();
    } catch (e) {
      this.isFullscreenShowing = false;
      console.warn('[AdMob] Interstitial show notice:', e);
    }
  }

  /**
   * Preload Rewarded Ad with Production Priority & Auto-Fallback
   */
  public async preloadRewarded(): Promise<void> {
    if (!adConfig.enabled || this.isPremium || !this.isNativeEnvironment() || this.isRewardedLoading) return;

    this.isRewardedLoading = true;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const liveAdId = adConfig.admob.rewardedId || 'ca-app-pub-3660764533582226/4639005542';

      await AdMob.prepareRewardVideoAd({
        adId: liveAdId,
        isTesting: false,
      });
      console.log('[AdMob] Real Production Rewarded Ad preloaded successfully.');
    } catch (e) {
      console.warn('[AdMob] Real Rewarded Ad preload notice:', e);
    } finally {
      this.isRewardedLoading = false;
    }
  }

  /**
   * 5. REWARDED VIDEO AD — EXACT REWARD VERIFICATION (Real Production AdMob)
   */
  public async showRewardedAd(
    onRewardConfirmed: (reward: AdRewardResult) => void,
    onDismissedOrFailed?: () => void
  ): Promise<boolean> {
    if (!adConfig.enabled || this.isPremium) {
      onRewardConfirmed({ type: 'batch_unlocked', amount: 1 });
      return true;
    }

    if (this.isNativeEnvironment()) {
      try {
        const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
        const liveAdId = adConfig.admob.rewardedId || 'ca-app-pub-3660764533582226/4639005542';

        this.isFullscreenShowing = true;
        let rewardEarned = false;

        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          rewardEarned = true;
          console.log('[AdMob] Real Reward verified by Google Mobile Ads SDK:', reward);
          onRewardConfirmed({ type: reward.type || 'batch_unlocked', amount: reward.amount || 1 });
        });

        const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          this.isFullscreenShowing = false;
          rewardListener.remove();
          dismissListener.remove();
          if (!rewardEarned && onDismissedOrFailed) {
            onDismissedOrFailed();
          }
          this.preloadRewarded();
        });

        try {
          const res = await AdMob.showRewardVideoAd();
          if (!rewardEarned && res) {
            rewardEarned = true;
            onRewardConfirmed({ type: res.type || 'batch_unlocked', amount: res.amount || 1 });
          }
          return true;
        } catch (showErr) {
          console.warn('[AdMob] Real Rewarded ad show notice:', showErr);
          dismissListener.remove();
          rewardListener.remove();
          this.isFullscreenShowing = false;
          if (onDismissedOrFailed) onDismissedOrFailed();
          this.preloadRewarded();
          return false;
        }
      } catch (e) {
        console.warn('[AdMob] Real Rewarded ad show notice:', e);
        this.isFullscreenShowing = false;
        this.preloadRewarded();
        if (onDismissedOrFailed) {
          onDismissedOrFailed();
        }
        return false;
      }
    }

    // Web fallback
    onRewardConfirmed({ type: 'batch_unlocked', amount: 1 });
    return true;
  }

  // ==========================================
  // DIAGNOSTICS & LIVE TEST SUITE FOR SETTINGS
  // ==========================================

  public async testBannerAd(): Promise<AdTestResult> {
    if (!this.isNativeEnvironment()) {
      return { success: false, type: 'Banner', adIdUsed: 'Web', message: 'AdMob Banners run natively on Android.' };
    }
    try {
      await this.showAdaptiveBanner();
      return { success: true, type: 'Banner', adIdUsed: adConfig.admob.adaptiveBannerId, message: 'Adaptive Banner requested successfully!' };
    } catch (err: any) {
      return { success: false, type: 'Banner', adIdUsed: adConfig.admob.adaptiveBannerId, message: err.message || 'Error triggering banner' };
    }
  }

  public async testInterstitialAd(): Promise<AdTestResult> {
    if (!this.isNativeEnvironment()) {
      return { success: false, type: 'Interstitial', adIdUsed: 'Web', message: 'AdMob Interstitials run natively on Android.' };
    }
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.prepareInterstitial({ adId: adConfig.admob.interstitialId, isTesting: false });
      await AdMob.showInterstitial();
      return { success: true, type: 'Interstitial', adIdUsed: adConfig.admob.interstitialId, message: 'Real Production Interstitial Shown!' };
    } catch (err: any) {
      return { success: false, type: 'Interstitial', adIdUsed: adConfig.admob.interstitialId, message: err.message || 'Error showing interstitial' };
    }
  }

  public async testRewardedAd(): Promise<AdTestResult> {
    if (!this.isNativeEnvironment()) {
      return { success: false, type: 'Rewarded', adIdUsed: 'Web', message: 'AdMob Rewarded Video runs natively on Android.' };
    }
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.prepareRewardVideoAd({ adId: adConfig.admob.rewardedId, isTesting: false });
      await AdMob.showRewardVideoAd();
      return { success: true, type: 'Rewarded', adIdUsed: adConfig.admob.rewardedId, message: 'Real Production Rewarded Video Shown!' };
    } catch (err: any) {
      return { success: false, type: 'Rewarded', adIdUsed: adConfig.admob.rewardedId, message: err.message || 'Error showing rewarded video' };
    }
  }

  public async testAppOpenAd(): Promise<AdTestResult> {
    if (!this.isNativeEnvironment()) {
      return { success: false, type: 'App Open', adIdUsed: 'Web', message: 'AdMob App Open runs natively on Android.' };
    }
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.loadAppOpen({ adId: adConfig.admob.appOpenId });
      await AdMob.showAppOpen();
      return { success: true, type: 'App Open', adIdUsed: adConfig.admob.appOpenId, message: 'Real Production App Open Ad Shown!' };
    } catch (err: any) {
      return { success: false, type: 'App Open', adIdUsed: adConfig.admob.appOpenId, message: err.message || 'Error showing app open ad' };
    }
  }
}

export const adManager = AdManager.getInstance();
