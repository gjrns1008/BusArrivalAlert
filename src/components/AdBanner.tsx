import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BannerAd, BannerAdSize, MobileAds } from 'react-native-google-mobile-ads';

const BANNER_AD_UNIT_ID = 'ca-app-pub-1993045619117041/4176978028';

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    MobileAds().initialize().then(() => {
      console.log('AdMob initialized');
    });
  }, []);

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={(error: Error) => console.log('Ad failed to load:', error.message)}
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
});
