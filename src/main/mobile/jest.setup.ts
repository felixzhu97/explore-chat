process.env.TZ = 'Asia/Shanghai';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        'chats.activeNow': 'Active now',
        'chats.yesterday': 'Yesterday',
        'chats.sentDaysAgo': '{count} days ago',
        'chats.sentLastWeek': 'Last week',
        'chats.sentLastMonth': 'Last month',
        'feed.likeLabel': 'likes',
        'feed.follow': 'Follow',
        'feed.unfollow': 'Unfollow',
        'feed.copyLink': 'Copy Link',
        'feed.report': 'Report',
        'common.cancel': 'Cancel',
      };
      const template = translations[key] || key;
      return options?.count
        ? template.replace('{count}', String(options.count))
        : template;
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

