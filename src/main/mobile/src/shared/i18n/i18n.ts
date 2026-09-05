import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { en } from "@/shared/i18n/locales/en";
import { zh } from "@/shared/i18n/locales/zh";

export const LANG_STORAGE_KEY = "@chat_language";
export type AppLanguage = "en" | "zh";

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "en";
const deviceLng: AppLanguage = deviceLocale.startsWith("zh") ? "zh" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: deviceLng,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
  if (saved === "en" || saved === "zh") return saved;
  return null;
}

export async function setStoredLanguage(lng: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANG_STORAGE_KEY, lng);
}

export async function applyStoredLanguage(): Promise<void> {
  const stored = await getStoredLanguage();
  if (stored) await i18n.changeLanguage(stored);
}

export default i18n;
