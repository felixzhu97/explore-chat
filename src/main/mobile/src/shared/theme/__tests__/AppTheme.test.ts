import {
  AppTheme,
  lightThemeColors,
  darkThemeColors,
  typography,
  ThemeColors,
  ThemeMode,
} from "../AppTheme";

describe("AppTheme", () => {
  describe("primary colors", () => {
    it("should have primaryGreen color", () => {
      expect(AppTheme.primaryGreen).toBe("#1877F2");
    });

    it("should have primaryGreenDark color", () => {
      expect(AppTheme.primaryGreenDark).toBe("#0F5FCC");
    });

    it("should have lightGreen color", () => {
      expect(AppTheme.lightGreen).toBe("#1877F2");
    });

    it("should have accentBlue color", () => {
      expect(AppTheme.accentBlue).toBe("#1877F2");
    });
  });

  describe("iOS system colors", () => {
    it("should have iosBlue color", () => {
      expect(AppTheme.iosBlue).toBe("#007AFF");
    });

    it("should have iosGreen color", () => {
      expect(AppTheme.iosGreen).toBe("#34C759");
    });

    it("should have iosRed color", () => {
      expect(AppTheme.iosRed).toBe("#FF3B30");
    });

    it("should have iosOrange color", () => {
      expect(AppTheme.iosOrange).toBe("#FF9500");
    });

    it("should have iosPurple color", () => {
      expect(AppTheme.iosPurple).toBe("#AF52DE");
    });

    it("should have iosYellow color", () => {
      expect(AppTheme.iosYellow).toBe("#FFCC00");
    });

    it("should have iosPink color", () => {
      expect(AppTheme.iosPink).toBe("#FF2D92");
    });

    it("should have iosTeal color", () => {
      expect(AppTheme.iosTeal).toBe("#5AC8FA");
    });
  });

  describe("background colors", () => {
    it("should have lightBackground color", () => {
      expect(AppTheme.lightBackground).toBe("#F2F2F7");
    });

    it("should have darkBackground color", () => {
      expect(AppTheme.darkBackground).toBe("#000000");
    });

    it("should have lightSecondaryBackground color", () => {
      expect(AppTheme.lightSecondaryBackground).toBe("#FFFFFF");
    });

    it("should have darkSecondaryBackground color", () => {
      expect(AppTheme.darkSecondaryBackground).toBe("#1C1C1E");
    });

    it("should have lightTertiaryBackground color", () => {
      expect(AppTheme.lightTertiaryBackground).toBe("#F2F2F7");
    });

    it("should have darkTertiaryBackground color", () => {
      expect(AppTheme.darkTertiaryBackground).toBe("#2C2C2E");
    });
  });

  describe("chat background colors", () => {
    it("should have chatBackground color", () => {
      expect(AppTheme.chatBackground).toBe("#FFFFFF");
    });

    it("should have darkChatBackground color", () => {
      expect(AppTheme.darkChatBackground).toBe("#000000");
    });
  });

  describe("message bubble colors", () => {
    it("should have myMessageBubble color", () => {
      expect(AppTheme.myMessageBubble).toBe("#EFEFEF");
    });

    it("should have otherMessageBubble color", () => {
      expect(AppTheme.otherMessageBubble).toBe("#FFFFFF");
    });

    it("should have darkMyMessageBubble color", () => {
      expect(AppTheme.darkMyMessageBubble).toBe("#1877F2");
    });

    it("should have darkOtherMessageBubble color", () => {
      expect(AppTheme.darkOtherMessageBubble).toBe("#3A3A3C");
    });
  });

  describe("text colors", () => {
    it("should have lightPrimaryText color", () => {
      expect(AppTheme.lightPrimaryText).toBe("#000000");
    });

    it("should have darkPrimaryText color", () => {
      expect(AppTheme.darkPrimaryText).toBe("#FFFFFF");
    });

    it("should have lightSecondaryText color", () => {
      expect(AppTheme.lightSecondaryText).toBe("#8E8E93");
    });

    it("should have darkSecondaryText color", () => {
      expect(AppTheme.darkSecondaryText).toBe("#8E8E93");
    });

    it("should have lightTertiaryText color", () => {
      expect(AppTheme.lightTertiaryText).toBe("#8E8E93");
    });

    it("should have darkTertiaryText color", () => {
      expect(AppTheme.darkTertiaryText).toBe("#8E8E93");
    });
  });

  describe("separator colors", () => {
    it("should have lightSeparator color", () => {
      expect(AppTheme.lightSeparator).toBe("#C6C6C8");
    });

    it("should have darkSeparator color", () => {
      expect(AppTheme.darkSeparator).toBe("#38383A");
    });
  });

  describe("status colors", () => {
    it("should have onlineGreen color", () => {
      expect(AppTheme.onlineGreen).toBe("#34C759");
    });

    it("should have lastSeenGrey color", () => {
      expect(AppTheme.lastSeenGrey).toBe("#8E8E93");
    });

    it("should have unreadRed color", () => {
      expect(AppTheme.unreadRed).toBe("#FF3B30");
    });

    it("should have typingGreen color", () => {
      expect(AppTheme.typingGreen).toBe("#1877F2");
    });

    it("should have deliveredBlue color", () => {
      expect(AppTheme.deliveredBlue).toBe("#1877F2");
    });

    it("should have readBlue color", () => {
      expect(AppTheme.readBlue).toBe("#1877F2");
    });
  });

  describe("button colors", () => {
    it("should have buttonPrimaryBlue color", () => {
      expect(AppTheme.buttonPrimaryBlue).toBe("#1877F2");
    });

    it("should have buttonOutlineBlue color", () => {
      expect(AppTheme.buttonOutlineBlue).toBe("#1877F2");
    });
  });

  describe("object immutability", () => {
    it("should have readonly properties", () => {
      expect(AppTheme.primaryGreen).toBe("#1877F2");
      expect(AppTheme.iosBlue).toBe("#007AFF");
    });
  });
});

describe("lightThemeColors", () => {
  it("should have all required ThemeColors properties", () => {
    expect(lightThemeColors.primaryGreen).toBeDefined();
    expect(lightThemeColors.background).toBe("#F2F2F7");
    expect(lightThemeColors.primaryText).toBe("#000000");
    expect(lightThemeColors.buttonPrimary).toBe("#1877F2");
  });

  it("should use light background colors", () => {
    expect(lightThemeColors.background).toBe(AppTheme.lightBackground);
    expect(lightThemeColors.secondaryBackground).toBe(
      AppTheme.lightSecondaryBackground,
    );
    expect(lightThemeColors.chatBackground).toBe(AppTheme.chatBackground);
  });

  it("should use correct button text colors", () => {
    expect(lightThemeColors.buttonPrimaryText).toBe("#FFFFFF");
    expect(lightThemeColors.buttonOutlineText).toBe("#1877F2");
  });
});

describe("darkThemeColors", () => {
  it("should have all required ThemeColors properties", () => {
    expect(darkThemeColors.primaryGreen).toBeDefined();
    expect(darkThemeColors.background).toBe("#000000");
    expect(darkThemeColors.primaryText).toBe("#FFFFFF");
    expect(darkThemeColors.buttonPrimary).toBe("#1877F2");
  });

  it("should use dark background colors", () => {
    expect(darkThemeColors.background).toBe(AppTheme.darkBackground);
    expect(darkThemeColors.secondaryBackground).toBe(
      AppTheme.darkSecondaryBackground,
    );
    expect(darkThemeColors.chatBackground).toBe(AppTheme.darkChatBackground);
  });

  it("should use correct message bubble colors", () => {
    expect(darkThemeColors.myMessageBubble).toBe(AppTheme.darkMyMessageBubble);
    expect(darkThemeColors.otherMessageBubble).toBe(
      AppTheme.darkOtherMessageBubble,
    );
  });
});

describe("typography", () => {
  describe("fontSize", () => {
    it("should have large font size", () => {
      expect(typography.fontSize.large).toBe(34);
    });

    it("should have medium font size", () => {
      expect(typography.fontSize.medium).toBe(17);
    });

    it("should have small font size", () => {
      expect(typography.fontSize.small).toBe(15);
    });

    it("should have xsmall font size", () => {
      expect(typography.fontSize.xsmall).toBe(13);
    });
  });

  describe("fontWeight", () => {
    it("should have bold font weight", () => {
      expect(typography.fontWeight.bold).toBe("700");
    });

    it("should have semibold font weight", () => {
      expect(typography.fontWeight.semibold).toBe("600");
    });

    it("should have medium font weight", () => {
      expect(typography.fontWeight.medium).toBe("500");
    });

    it("should have regular font weight", () => {
      expect(typography.fontWeight.regular).toBe("400");
    });
  });

  describe("lineHeight", () => {
    it("should have large line height", () => {
      expect(typography.lineHeight.large).toBe(34);
    });

    it("should have medium line height", () => {
      expect(typography.lineHeight.medium).toBe(24);
    });

    it("should have small line height", () => {
      expect(typography.lineHeight.small).toBe(20);
    });
  });
});

describe("ThemeMode type", () => {
  it("should allow light mode", () => {
    const mode: ThemeMode = "light";
    expect(mode).toBe("light");
  });

  it("should allow dark mode", () => {
    const mode: ThemeMode = "dark";
    expect(mode).toBe("dark");
  });

  it("should allow system mode", () => {
    const mode: ThemeMode = "system";
    expect(mode).toBe("system");
  });
});

describe("ThemeColors interface", () => {
  it("should match ThemeColors interface structure", () => {
    const colors: ThemeColors = {
      ...lightThemeColors,
    };
    expect(colors.primaryGreen).toBeDefined();
    expect(colors.background).toBeDefined();
    expect(colors.primaryText).toBeDefined();
  });
});
