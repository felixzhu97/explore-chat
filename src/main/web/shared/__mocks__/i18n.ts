import { en } from "@/shared/locales/en";
import { zh } from "@/shared/locales/zh";

// This mock allows i18n to initialize with the locale resources
export default {
  t: (key: string) => key,
  language: "zh",
};
export const LANG_STORAGE_KEY = "whatschat_web_lang";
export const setStoredLocale = () => {};
export const getLocale = () => "zh" as const;
export const useTranslation = () => ({
  t: (key: string) => key,
});
