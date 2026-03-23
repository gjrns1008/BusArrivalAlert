import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  MobileAds,
} from 'react-native-google-mobile-ads';

import { useAppPreferences } from '../context/AppPreferencesContext';

const BANNER_AD_UNIT_ID = 'ca-app-pub-1993045619117041/4176978028';

export default function AdBanner() {
  const { settings } = useAppPreferences();

  useEffect(() => {
    MobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob initialized');
      });
  }, []);

  if (settings.premiumEnabled) {
    return (
      <View style={[styles.container, styles.premiumContainer]}>
        <Text style={styles.premiumText}>
          프리미엄 모드로 광고가 숨겨졌습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        onAdLoaded={() => undefined}
        onAdFailedToLoad={(error: Error) =>
          console.log('Ad failed to load:', error.message)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  premiumContainer: {
    height: 44,
    backgroundColor: '#EEF7F1',
  },
  premiumText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
