import { Module } from "@nestjs/common";
import { VoiceController } from "./voice.controller";
import { VoiceService } from "@/ai/application/voice.service";
import { AiModule } from "@/ai/presentation/ai.module";

@Module({
  imports: [AiModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
