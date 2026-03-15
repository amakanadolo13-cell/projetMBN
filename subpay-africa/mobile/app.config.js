const IS_PROD = process.env.APP_ENV === 'production';

module.exports = {
  expo: {
    name: IS_PROD ? 'SubPay Africa' : 'SubPay Africa (Dev)',
    slug: 'subpay-africa',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.subpay.africa',
      infoPlist: {
        LSApplicationQueriesSchemes: [
          'nflx',
          'spotify',
          'itms-apps',
          'com.playstation.remoteplay',
          'com.playstation.mobileshop',
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      package: 'com.subpay.africa',
      intentFilters: [
        {
          action: 'VIEW',
          data: [{ scheme: 'subpay' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      'expo-secure-store',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#000000',
        },
      ],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || '',
      },
    },
  },
};
