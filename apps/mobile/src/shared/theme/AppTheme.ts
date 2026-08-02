export const AppTheme = {
  primaryGreen: "#1877F2",
  primaryGreenDark: "#0F5FCC",
  lightGreen: "#1877F2",
  accentBlue: "#1877F2",

  iosBlue: "#007AFF",
  iosGreen: "#34C759",
  iosRed: "#FF3B30",
  iosOrange: "#FF9500",
  iosPurple: "#AF52DE",
  iosYellow: "#FFCC00",
  iosPink: "#FF2D92",
  iosTeal: "#5AC8FA",

  // 背景色 - iOS 风格
  lightBackground: "#F2F2F7",
  darkBackground: "#000000",
  lightSecondaryBackground: "#FFFFFF",
  darkSecondaryBackground: "#1C1C1E",
  lightTertiaryBackground: "#F2F2F7",
  darkTertiaryBackground: "#2C2C2E",

  // 聊天背景
  chatBackground: "#FFFFFF",
  darkChatBackground: "#000000",

  myMessageBubble: "#EFEFEF",
  otherMessageBubble: "#FFFFFF",
  darkMyMessageBubble: "#1877F2",
  darkOtherMessageBubble: "#3A3A3C",

  // 文本颜色 - iOS 风格
  lightPrimaryText: "#000000",
  darkPrimaryText: "#FFFFFF",
  lightSecondaryText: "#8E8E93",
  darkSecondaryText: "#8E8E93",
  lightTertiaryText: "#8E8E93",
  darkTertiaryText: "#8E8E93",

  // 分割线颜色
  lightSeparator: "#C6C6C8",
  darkSeparator: "#38383A",

  // 在线状态颜色
  onlineGreen: "#34C759",
  lastSeenGrey: "#8E8E93",

  // 通知和状态颜色
  unreadRed: "#FF3B30",
  typingGreen: "#1877F2",
  deliveredBlue: "#1877F2",
  readBlue: "#1877F2",
  buttonPrimaryBlue: "#1877F2",
  buttonOutlineBlue: "#1877F2",
} as const;

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  // Primary colors
  primaryGreen: string;
  primaryGreenDark: string;
  lightGreen: string;
  accentBlue: string;

  // iOS system colors
  iosBlue: string;
  iosGreen: string;
  iosRed: string;
  iosOrange: string;
  iosPurple: string;
  iosYellow: string;
  iosPink: string;
  iosTeal: string;

  // Background colors
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  chatBackground: string;

  // Message bubble colors
  myMessageBubble: string;
  otherMessageBubble: string;

  // Text colors
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;

  // Other colors
  separator: string;
  onlineColor: string;
  lastSeenGrey: string;
  unreadColor: string;
  typingGreen: string;
  deliveredColor: string;
  readColor: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonOutline: string;
  buttonOutlineText: string;
}

export const lightThemeColors: ThemeColors = {
  primaryGreen: AppTheme.primaryGreen,
  primaryGreenDark: AppTheme.primaryGreenDark,
  lightGreen: AppTheme.lightGreen,
  accentBlue: AppTheme.accentBlue,
  iosBlue: AppTheme.iosBlue,
  iosGreen: AppTheme.iosGreen,
  iosRed: AppTheme.iosRed,
  iosOrange: AppTheme.iosOrange,
  iosPurple: AppTheme.iosPurple,
  iosYellow: AppTheme.iosYellow,
  iosPink: AppTheme.iosPink,
  iosTeal: AppTheme.iosTeal,
  background: AppTheme.lightBackground,
  secondaryBackground: AppTheme.lightSecondaryBackground,
  tertiaryBackground: AppTheme.lightTertiaryBackground,
  chatBackground: AppTheme.chatBackground,
  myMessageBubble: AppTheme.myMessageBubble,
  otherMessageBubble: AppTheme.otherMessageBubble,
  primaryText: AppTheme.lightPrimaryText,
  secondaryText: AppTheme.lightSecondaryText,
  tertiaryText: AppTheme.lightTertiaryText,
  separator: AppTheme.lightSeparator,
  onlineColor: AppTheme.onlineGreen,
  lastSeenGrey: AppTheme.lastSeenGrey,
  unreadColor: AppTheme.unreadRed,
  typingGreen: AppTheme.typingGreen,
  deliveredColor: AppTheme.deliveredBlue,
  readColor: AppTheme.readBlue,
  buttonPrimary: AppTheme.buttonPrimaryBlue,
  buttonPrimaryText: "#FFFFFF",
  buttonOutline: AppTheme.buttonOutlineBlue,
  buttonOutlineText: AppTheme.buttonOutlineBlue,
};

export const darkThemeColors: ThemeColors = {
  primaryGreen: AppTheme.primaryGreen,
  primaryGreenDark: AppTheme.primaryGreenDark,
  lightGreen: AppTheme.lightGreen,
  accentBlue: AppTheme.accentBlue,
  iosBlue: AppTheme.iosBlue,
  iosGreen: AppTheme.iosGreen,
  iosRed: AppTheme.iosRed,
  iosOrange: AppTheme.iosOrange,
  iosPurple: AppTheme.iosPurple,
  iosYellow: AppTheme.iosYellow,
  iosPink: AppTheme.iosPink,
  iosTeal: AppTheme.iosTeal,
  background: AppTheme.darkBackground,
  secondaryBackground: AppTheme.darkSecondaryBackground,
  tertiaryBackground: AppTheme.darkTertiaryBackground,
  chatBackground: AppTheme.darkChatBackground,
  myMessageBubble: AppTheme.darkMyMessageBubble,
  otherMessageBubble: AppTheme.darkOtherMessageBubble,
  primaryText: AppTheme.darkPrimaryText,
  secondaryText: AppTheme.darkSecondaryText,
  tertiaryText: AppTheme.darkTertiaryText,
  separator: AppTheme.darkSeparator,
  onlineColor: AppTheme.onlineGreen,
  lastSeenGrey: AppTheme.lastSeenGrey,
  unreadColor: AppTheme.unreadRed,
  typingGreen: AppTheme.typingGreen,
  deliveredColor: AppTheme.deliveredBlue,
  readColor: AppTheme.readBlue,
  buttonPrimary: AppTheme.buttonPrimaryBlue,
  buttonPrimaryText: "#FFFFFF",
  buttonOutline: AppTheme.buttonOutlineBlue,
  buttonOutlineText: AppTheme.buttonOutlineBlue,
};

export interface Typography {
  fontSize: {
    large: number;
    medium: number;
    small: number;
    xsmall: number;
  };
  fontWeight: {
    bold: string;
    semibold: string;
    medium: string;
    regular: string;
  };
  lineHeight: {
    large: number;
    medium: number;
    small: number;
  };
}

export const typography: Typography = {
  fontSize: {
    large: 34,
    medium: 17,
    small: 15,
    xsmall: 13,
  },
  fontWeight: {
    bold: "700",
    semibold: "600",
    medium: "500",
    regular: "400",
  },
  lineHeight: {
    large: 34,
    medium: 24,
    small: 20,
  },
};
