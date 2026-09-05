import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "@/shared/locales/en";
import { zh } from "@/shared/locales/zh";

export type AppLocale = "en" | "zh";

export const LANG_STORAGE_KEY = "whatschat_web_lang";

function getStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  return stored === "en" || stored === "zh" ? stored : null;
}

const defaultLng: AppLocale =
  typeof window !== "undefined" ? (getStoredLocale() ?? "en") : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: defaultLng,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function setStoredLocale(locale: AppLocale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_STORAGE_KEY, locale);
  }
}

export function getLocale(): AppLocale {
  const current = i18n.language;
  return current.startsWith("zh") ? "zh" : "en";
}

export { useTranslation } from "react-i18next";
