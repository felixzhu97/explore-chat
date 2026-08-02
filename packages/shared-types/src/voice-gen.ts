/**
 * Voice Gen target languages (Glossary: Voice Gen).
 */
export const VoiceGenTargetLanguages = {
  Auto: "auto",
  Zh: "zh",
  En: "en",
} as const;

export type VoiceGenTargetLanguage =
  (typeof VoiceGenTargetLanguages)[keyof typeof VoiceGenTargetLanguages];

/**
 * Voice translate accepts zh/en only (no auto).
 */
export const VoiceTranslateTargetLanguages = {
  Zh: "zh",
  En: "en",
} as const;

export type VoiceTranslateTargetLanguage =
  (typeof VoiceTranslateTargetLanguages)[keyof typeof VoiceTranslateTargetLanguages];
