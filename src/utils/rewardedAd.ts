// Rewarded Ad — mostra vídeo voluntário em troca de relatório PDF
// Em __DEV__: pula o anúncio e chama onReward diretamente (para testar)
// Em produção: precisa de google-services.json + IDs reais do AdMob

let ad: any = null;
let adReady = false;

function initAd() {
  if (__DEV__ || ad) return;
  try {
    const {
      RewardedAd,
      RewardedAdEventType,
      TestIds,
    } = require('react-native-google-mobile-ads');

    const { Platform } = require('react-native');
    const androidId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID;
    const iosId     = process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID;
    const unitId    = Platform.OS === 'ios' ? iosId : androidId;

    ad = RewardedAd.createForAdRequest(unitId ?? TestIds.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => { adReady = true; });
    ad.addAdEventListener(RewardedAdEventType.ERROR,  () => { adReady = false; ad.load(); });
    ad.load();
  } catch {
    // react-native-google-mobile-ads não instalado ou sem google-services.json
  }
}

initAd();

export const rewardedAd = {
  preload: () => {
    if (!__DEV__ && ad && !adReady) ad?.load();
  },

  show: (callbacks: { onReward: () => void; onClose?: () => void }) => {
    const { onReward, onClose } = callbacks;

    if (__DEV__) {
      // Modo desenvolvimento: simula recompensa imediata
      setTimeout(() => {
        onReward();
        onClose?.();
      }, 300);
      return;
    }

    if (!ad || !adReady) {
      // Anúncio não carregado: dá a recompensa mesmo assim (UX generosa)
      onReward();
      onClose?.();
      ad?.load();
      return;
    }

    try {
      const { RewardedAdEventType } = require('react-native-google-mobile-ads');
      const unsubReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        onReward();
        unsubReward();
      });
      const unsubClose = ad.addAdEventListener('closed', () => {
        adReady = false;
        ad.load();
        onClose?.();
        unsubClose();
      });
      ad.show();
    } catch {
      onReward();
      onClose?.();
    }
  },
};
