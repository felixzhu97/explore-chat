import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import type {
  VoiceGenTargetLanguage,
  VoiceTranslateTargetLanguage,
} from "@whatschat/shared-types";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { VoiceService } from "@/ai/service/voice.service";

@ApiTags("voice")
@Controller("voice")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Generate voice from prompt" })
  async generate(
    @Body() body: { prompt: string; targetLang?: VoiceGenTargetLanguage },
  ) {
    return this.voiceService.generate({
      prompt: body.prompt,
      ...(body.targetLang != null && { targetLang: body.targetLang }),
    });
  }

  @Post("translate")
  @ApiOperation({ summary: "Translate text" })
  async translate(
    @Body() body: { text: string; targetLang: VoiceTranslateTargetLanguage },
  ) {
    const translatedText = await this.voiceService.translate({
      text: body.text,
      targetLang: body.targetLang,
    });
    return { translatedText };
  }
}
