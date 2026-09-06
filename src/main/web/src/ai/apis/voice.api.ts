import type { ApiClient } from "@/auth/api-client";

export const VoiceGenTargetLanguages = {
  Auto: "auto",
  Zh: "zh",
  En: "en",
} as const;

export type VoiceGenTargetLanguage =
  (typeof VoiceGenTargetLanguages)[keyof typeof VoiceGenTargetLanguages];

export const VoiceTranslateTargetLanguages = {
  Zh: "zh",
  En: "en",
} as const;

export type VoiceTranslateTargetLanguage =
  (typeof VoiceTranslateTargetLanguages)[keyof typeof VoiceTranslateTargetLanguages];

export interface VoiceGenerateResponse {
  audioUrl: string;
  text?: string;
}

export interface VoiceTranslateResponse {
  translatedText: string;
}

export type VoiceTargetLang = VoiceGenTargetLanguage;

export class VoiceApi {
  constructor(private apiClient: ApiClient) {}

  async generate(
    prompt: string,
    targetLang?: VoiceGenTargetLanguage,
  ): Promise<VoiceGenerateResponse> {
    return this.apiClient.post<VoiceGenerateResponse>("/voice/generate", {
      prompt,
      ...(targetLang != null && { targetLang }),
    });
  }

  async translate(
    text: string,
    targetLang: VoiceTranslateTargetLanguage,
  ): Promise<VoiceTranslateResponse> {
    return this.apiClient.post<VoiceTranslateResponse>("/voice/translate", {
      text,
      targetLang,
    });
  }
}
