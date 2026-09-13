export interface AdConfig {
  enabled: boolean;
  provider: 'adsense' | 'admob' | 'hybrid';
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
}

export const adConfig: AdConfig = {
  enabled: true,
  provider: 'hybrid',
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
    // Official AdMob IDs for Miftah Tools
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
};


