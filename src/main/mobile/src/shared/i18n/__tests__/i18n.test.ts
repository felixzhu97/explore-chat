const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

const mockI18next = {
  changeLanguage: jest.fn().mockResolvedValue(undefined),
};

jest.mock("i18next", () => ({
  __esModule: true,
  default: {
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
    changeLanguage: mockI18next.changeLanguage,
  },
}));

jest.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty" },
}));

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

jest.mock("@/shared/i18n/locales/en", () => ({}));
jest.mock("@/shared/i18n/locales/zh", () => ({}));

describe("i18n storage utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getStoredLanguage", () => {
    it("should return en when stored value is en", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("en");
      const { getStoredLanguage } = require("../i18n");

      const result = await getStoredLanguage();

      expect(result).toBe("en");
    });

    it("should return zh when stored value is zh", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("zh");
      const { getStoredLanguage } = require("../i18n");

      const result = await getStoredLanguage();

      expect(result).toBe("zh");
    });

    it("should return null for unknown language values", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("fr");
      const { getStoredLanguage } = require("../i18n");

      const result = await getStoredLanguage();

      expect(result).toBeNull();
    });

    it("should return null when no value is stored", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const { getStoredLanguage } = require("../i18n");

      const result = await getStoredLanguage();

      expect(result).toBeNull();
    });
  });

  describe("setStoredLanguage", () => {
    it("should save en language", async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      const { setStoredLanguage } = require("../i18n");

      await setStoredLanguage("en");

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@whatschat_language",
        "en",
      );
    });

    it("should save zh language", async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      const { setStoredLanguage } = require("../i18n");

      await setStoredLanguage("zh");

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@whatschat_language",
        "zh",
      );
    });
  });

  describe("applyStoredLanguage", () => {
    it("should change i18n language when stored language exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("zh");
      const { applyStoredLanguage } = require("../i18n");

      await applyStoredLanguage();

      expect(mockI18next.changeLanguage).toHaveBeenCalledWith("zh");
    });

    it("should not change language when no stored language", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const { applyStoredLanguage } = require("../i18n");

      await applyStoredLanguage();

      expect(mockI18next.changeLanguage).not.toHaveBeenCalled();
    });
  });

  describe("LANG_STORAGE_KEY", () => {
    it("should export correct storage key", () => {
      const { LANG_STORAGE_KEY } = require("../i18n");
      expect(LANG_STORAGE_KEY).toBe("@whatschat_language");
    });
  });
});
