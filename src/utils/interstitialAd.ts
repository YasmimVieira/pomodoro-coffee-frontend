import { Platform } from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const prodId = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
  : process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID;

const unitId = __DEV__ ? TestIds.INTERSTITIAL : (prodId ?? TestIds.INTERSTITIAL);

const ad = InterstitialAd.createForAdRequest(unitId, {
  requestNonPersonalizedAdsOnly: true,
});

// Pré-carrega o próximo anúncio assim que o atual fecha
ad.addAdEventListener(AdEventType.CLOSED, () => {
  ad.load();
});

// Carrega o primeiro anúncio ao iniciar
ad.load();

export const interstitial = {
  show: () => {
    if (ad.loaded) {
      ad.show();
    } else {
      ad.load();
    }
  },
};
