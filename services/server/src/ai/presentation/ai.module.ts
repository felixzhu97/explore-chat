import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { ExploreAiController } from "./explore-ai.controller";
import { AiService } from "@/ai/application/ai.service";
import { ExploreAiClientService } from "@/ai/application/explore-ai-client.service";

@Module({
  controllers: [AiController, ExploreAiController],
  providers: [AiService, ExploreAiClientService],
  exports: [AiService, ExploreAiClientService],
})
export class AiModule {}
