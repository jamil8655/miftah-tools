export interface AdConfig {
  enabled: boolean;
  provider: 'adsense' | 'admob' | 'hybrid';
  adsense: {
    client: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
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
  enabled: true, // Set to true to display responsive ad slots & test banners
  provider: 'hybrid',
  adsense: {
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXX',
    slots: {
      headerBanner: '1234567890',
      inFeedCard: '2345678901',
      toolBottom: '3456789012',
      resultPage: '4567890123',
    },
  },
  admob: {
    // Google AdMob Production IDs
    appIdAndroid: 'ca-app-pub-3660764533582226~6406066130',
    appOpenId: 'ca-app-pub-3940256099942544/9257395921',
    adaptiveBannerId: 'ca-app-pub-3660764533582226/7382282057',
    fixedBannerId: 'ca-app-pub-3660764533582226/7382282057',
    interstitialId: 'ca-app-pub-3660764533582226/8769822246',
    rewardedId: 'ca-app-pub-3940256099942544/5224354917',
    rewardedInterstitialId: 'ca-app-pub-3940256099942544/5354046379',
    nativeId: 'ca-app-pub-3940256099942544/2247696110',
    nativeVideoId: 'ca-app-pub-3940256099942544/1044960115',
  },
};

