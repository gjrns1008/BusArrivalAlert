const { jest: jestObject } = require('@jest/globals');

jestObject.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jestObject.mock('react-native-google-mobile-ads', () => ({
  BannerAd: 'BannerAd',
  BannerAdSize: {
    BANNER: 'BANNER',
  },
  MobileAds: () => ({
    initialize: jestObject.fn().mockResolvedValue(undefined),
  }),
}));
