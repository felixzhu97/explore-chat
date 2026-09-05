module.exports = {
  expo: {
    name: 'Chat',
    slug: 'chat',
    scheme: 'chat',
    version: '1.0.0',
    plugins: [
      [
        'expo-localization',
        {
          supportedLocales: ['en', 'zh', 'zh-Hans', 'zh-Hant'],
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow Chat to access your photos to update profile avatar and post media.',
        },
      ],
    ],
    ios: {
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          'Allow Chat to access your photos to update profile avatar and post media.',
        NSPhotoLibraryAddUsageDescription:
          'Allow Chat to save generated media to your photo library when needed.',
      },
    },
  },
};
