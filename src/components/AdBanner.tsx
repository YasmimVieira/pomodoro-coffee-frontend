import React, { useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';

const BANNER_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // ID de teste oficial do Google
  : Platform.OS === 'android'
  ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ?? ''
  : process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ?? '';

// Importação dinâmica: retorna null se o pacote não estiver instalado
let Ads: any = null;
try {
  Ads = require('react-native-google-mobile-ads');
} catch {}

export function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  if (!Ads) return null;

  const { BannerAd, BannerAdSize } = Ads;

  return (
    <View style={[styles.wrap, !loaded && styles.hidden]}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
