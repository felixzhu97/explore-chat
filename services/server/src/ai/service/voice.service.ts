import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  VoiceGenTargetLanguages,
  type VoiceGenTargetLanguage,
  type VoiceTranslateTargetLanguage,
} from "@whatschat/shared-types";
import { ConfigService } from "@/core/config/config.service";
import { AiService } from "./ai.service";

const VOICE_ZH = "zh-CN-XiaoxiaoNeural";
const VOICE_EN = "en-US-JennyNeural";

export interface VoiceGenerateInput {
  prompt: string;
  targetLang?: VoiceGenTargetLanguage;
}

export interface VoiceGenerateResult {
  audioUrl: string;
  text: string;
}

export interface VoiceTranslateInput {
  text: string;
  targetLang: VoiceTranslateTargetLanguage;
}

export interface VoiceTranslateResult {
  translatedText: string;
}

@Injectable()
export class VoiceService {
  constructor(private readonly aiService: AiService) {}

  private async translateToLang(
    text: string,
    targetLang: VoiceTranslateTargetLanguage,
  ): Promise<string> {
    const system =
      targetLang === VoiceGenTargetLanguages.Zh
        ? "Translate the following text into Chinese. Output only the translation, no explanation."
        : "Translate the following text into English. Output only the translation, no explanation.";
    const res = await this.aiService.chat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
    });
    return res.content?.trim() ?? text;
  }

  async generate(input: VoiceGenerateInput): Promise<VoiceGenerateResult> {
    const cfg = ConfigService.loadConfig().voice;
    if (!cfg?.voiceApiBaseUrl?.trim()) {
      throw new BadRequestException(
        "语音生成未配置。请在 services/server/.env 中设置 VOICE_GENERATION_API_URL",
      );
    }
    let text: string;
    try {
      const res = await this.aiService.chat({
        messages: [{ role: "user", content: input.prompt }],
      });
      text = res.content?.trim() ?? "";
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      throw new HttpException(
        msg || "大模型生成文本失败",
        HttpStatus.BAD_GATEWAY,
      );
    }
    if (!text) {
      throw new BadRequestException("大模型未返回有效文本");
    }
    let voice: string | undefined;
    const targetLang = input.targetLang ?? VoiceGenTargetLanguages.Auto;
    if (targetLang === VoiceGenTargetLanguages.En) {
      try {
        text = await this.translateToLang(text, VoiceGenTargetLanguages.En);
      } catch {
        // keep original on translate failure
      }
      voice = VOICE_EN;
    } else if (targetLang === VoiceGenTargetLanguages.Zh) {
      try {
        text = await this.translateToLang(text, VoiceGenTargetLanguages.Zh);
      } catch {
        // keep original on translate failure
      }
      voice = VOICE_ZH;
    }
    const base = cfg.voiceApiBaseUrl.replace(/\/$/, "");
    const url = `${base}/api/v1/voices:synthesize`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ...(voice && { voice }) }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { audio_url?: string; audioUrl?: string };
      const audioUrl = data?.audio_url ?? data?.audioUrl;
      if (!audioUrl?.trim()) {
        throw new Error("语音服务未返回 audio_url");
      }
      return { audioUrl, text };
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
        throw new HttpException(
          "语音生成服务未启动或未配置 VOICE_GENERATION_API_URL",
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(msg || "语音生成失败", HttpStatus.BAD_GATEWAY);
    }
  }

  async translate(input: VoiceTranslateInput): Promise<VoiceTranslateResult> {
    const translatedText = await this.translateToLang(
      input.text,
      input.targetLang,
    );
    return { translatedText };
  }
}
