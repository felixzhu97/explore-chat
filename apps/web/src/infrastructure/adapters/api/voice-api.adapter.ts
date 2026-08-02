import type {
  VoiceGenTargetLanguage,
  VoiceTranslateTargetLanguage,
} from "@whatschat/shared-types";
import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import type { ApiResponse } from "@/domain/dto/api-response.dto";

export interface VoiceGenerateResponse {
  audioUrl: string;
  text?: string;
}

export interface VoiceTranslateResponse {
  translatedText: string;
}

/** @deprecated Prefer VoiceGenTargetLanguage from @whatschat/shared-types */
export type VoiceTargetLang = VoiceGenTargetLanguage;

export class VoiceApiAdapter {
  constructor(private apiClient: IApiClient) {}

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
