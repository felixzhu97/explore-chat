import { Module } from "@nestjs/common";
import { VoiceController } from "./controller/voice.controller";
import { VoiceService } from "@/ai/service/voice.service";
import { AiModule } from "@/ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
