import type {
  VoiceGenTargetLanguage,
  VoiceTranslateTargetLanguage,
} from "@whatschat/shared-types";
import type { ApiClient } from "@/core/api-client";
import type { ApiResponse } from "@/core/api-response.model";

export interface VoiceGenerateResponse {
  audioUrl: string;
  text?: string;
}

export interface VoiceTranslateResponse {
  translatedText: string;
}

/** @deprecated Prefer VoiceGenTargetLanguage from @whatschat/shared-types */
export type VoiceTargetLang = VoiceGenTargetLanguage;

export class VoiceApi {
  constructor(private apiClient: ApiClient) {}

  async generate(
    prompt: string,
    targetLang?: VoiceGenTargetLanguage,
  ): Promise<ApiResponse<VoiceGenerateResponse>> {
    return this.apiClient.post<VoiceGenerateResponse>("/voice/generate", {
      prompt,
      ...(targetLang != null && { targetLang }),
    });
  }

  async translate(
    text: string,
    targetLang: VoiceTranslateTargetLanguage,
  ): Promise<ApiResponse<VoiceTranslateResponse>> {
    return this.apiClient.post<VoiceTranslateResponse>("/voice/translate", {
      text,
      targetLang,
    });
  }
}
