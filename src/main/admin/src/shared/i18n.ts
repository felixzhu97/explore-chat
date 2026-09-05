import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { zh } from "@/src/locales/zh";
import { en } from "@/src/locales/en";

export type AppLocale = "zh" | "en";

const LANG_STORAGE_KEY = "whatschat_admin_lang";

function getStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  return stored === "en" || stored === "zh" ? stored : null;
}

function getBrowserLocale(): AppLocale {
  if (typeof window === "undefined") return "zh";
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  return lang.startsWith("zh") ? "zh" : "en";
}

const defaultLng = typeof window !== "undefined" ? (getStoredLocale() || getBrowserLocale()) : "zh";

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: defaultLng,
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

export function setStoredLocale(locale: AppLocale): void {
  localStorage.setItem(LANG_STORAGE_KEY, locale);
}

export function getLocale(): AppLocale {
  const current = i18n.language;
  return current.startsWith("zh") ? "zh" : "en";
}
