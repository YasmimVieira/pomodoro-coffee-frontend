import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const prodId = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
  : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;

const unitId = __DEV__ ? TestIds.BANNER : (prodId ?? TestIds.BANNER);

export function AdBanner() {
  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 12,
  },
});
