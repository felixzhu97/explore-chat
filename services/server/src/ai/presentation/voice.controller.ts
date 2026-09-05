import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import type {
  VoiceGenTargetLanguage,
  VoiceTranslateTargetLanguage,
} from "@whatschat/shared-types";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { VoiceService } from "@/ai/application/voice.service";

@ApiTags("语音生成")
@Controller("voice")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post("generate")
  @ApiOperation({ summary: "根据提示词生成语音（大模型生成文本后 TTS）" })
  async generate(
    @Body() body: { prompt: string; targetLang?: VoiceGenTargetLanguage },
  ) {
    const result = await this.voiceService.generate({
      prompt: body.prompt,
      ...(body.targetLang != null && { targetLang: body.targetLang }),
    });
    return { success: true, data: result };
  }

  @Post("translate")
  @ApiOperation({ summary: "翻译文本" })
  async translate(
    @Body() body: { text: string; targetLang: VoiceTranslateTargetLanguage },
  ) {
    const translatedText = await this.voiceService.translate({
      text: body.text,
      targetLang: body.targetLang,
    });
    return { success: true, data: { translatedText } };
  }
}
