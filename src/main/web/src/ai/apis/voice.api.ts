import type {
  VoiceGenTargetLanguage,
  VoiceTranslateTargetLanguage,
} from "@chat/shared-types";
import type { ApiClient } from "@/auth/api-client";

export interface VoiceGenerateResponse {
  audioUrl: string;
  text?: string;
}

export interface VoiceTranslateResponse {
  translatedText: string;
}

/** @deprecated Prefer VoiceGenTargetLanguage from @chat/shared-types */
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
