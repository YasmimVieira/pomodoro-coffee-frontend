import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const unitId = __DEV__
  ? TestIds.INTERSTITIAL
  : (process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TestIds.INTERSTITIAL);

const ad = InterstitialAd.createForAdRequest(unitId, {
  requestNonPersonalizedAdsOnly: true,
});

// Pré-carrega o próximo anúncio assim que o atual fecha
ad.addEventListenerOnce(AdEventType.CLOSED, () => {
  ad.load();
});

// Carrega o primeiro anúncio ao iniciar
ad.load();

export const interstitial = {
  show: () => {
    if (ad.loaded) {
      ad.show();
    } else {
      // Tenta carregar para a próxima vez
      ad.load();
    }
  },
};
