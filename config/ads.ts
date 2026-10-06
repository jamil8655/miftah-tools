export interface AdConfig {
  enabled: boolean;
  isTesting: boolean;
  provider: 'adsense' | 'admob' | 'hybrid';
  cooldowns: {
    interstitialMs: number;
    appOpenMs: number;
    minBackgroundTimeForAppOpenMs: number;
  };
  adsense: {
    client: string;
    slots: {
      headerBanner?: string;
      inFeedCard?: string;
      toolBottom?: string;
      resultPage?: string;
    };
  };
  admob: {
    appIdAndroid: string;
    appOpenId: string;
    adaptiveBannerId: string;
    fixedBannerId: string;
    interstitialId: string;
    rewardedId: string;
    rewardedInterstitialId: string;
    nativeId: string;
    nativeVideoId: string;
  };
  testAdmob: {
    appOpenId: string;
    bannerId: string;
    interstitialId: string;
    rewardedId: string;
  };
}

export const adConfig: AdConfig = {
  enabled: true,
  isTesting: false,
  provider: 'hybrid',
  cooldowns: {
    interstitialMs: 30000, // 30s cooldown between interstitials
    appOpenMs: 45000, // 45s cooldown between app open ads
    minBackgroundTimeForAppOpenMs: 30000, // App must be in background for at least 30s before showing app open ad
  },
  adsense: {
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-3660764533582226',
    slots: {
      headerBanner: '1234567890',
      inFeedCard: '2345678901',
      toolBottom: '3456789012',
      resultPage: '4567890123',
    },
  },
  admob: {
    // Official Real Production AdMob IDs for Miftah Tools
    appIdAndroid: 'ca-app-pub-3660764533582226~6406066130',
    appOpenId: 'ca-app-pub-3660764533582226/1916156788',
    adaptiveBannerId: 'ca-app-pub-3660764533582226/7382282057',
    fixedBannerId: 'ca-app-pub-3660764533582226/7382282057',
    interstitialId: 'ca-app-pub-3660764533582226/8769822246',
    rewardedId: 'ca-app-pub-3660764533582226/4639005542',
    rewardedInterstitialId: 'ca-app-pub-3660764533582226/4639005542',
    nativeId: 'ca-app-pub-3660764533582226/7382282057',
    nativeVideoId: 'ca-app-pub-3660764533582226/8769822246',
  },
  testAdmob: {
    // Google Official Sample Test IDs (100% Guaranteed Fill)
    appOpenId: 'ca-app-pub-3940256099942544/9257390922',
    bannerId: 'ca-app-pub-3940256099942544/6300978111',
    interstitialId: 'ca-app-pub-3940256099942544/1033173712',
    rewardedId: 'ca-app-pub-3940256099942544/5224354917',
  },
};
