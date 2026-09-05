module.exports = {
  expo: {
    name: 'WhatsChat',
    slug: 'whatschat',
    scheme: 'whatschat',
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
          photosPermission: 'Allow WhatsChat to access your photos to update profile avatar and post media.',
        },
      ],
    ],
    ios: {
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          'Allow WhatsChat to access your photos to update profile avatar and post media.',
        NSPhotoLibraryAddUsageDescription:
          'Allow WhatsChat to save generated media to your photo library when needed.',
      },
    },
  },
};
