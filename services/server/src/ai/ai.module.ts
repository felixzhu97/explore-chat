import { Module } from "@nestjs/common";
import { AiController } from "./controller/ai.controller";
import { ExploreAiController } from "./controller/explore-ai.controller";
import { AiService } from "@/ai/service/ai.service";
import { ExploreAiClientService } from "@/ai/service/explore-ai-client.service";

@Module({
  controllers: [AiController, ExploreAiController],
  providers: [AiService, ExploreAiClientService],
  exports: [AiService, ExploreAiClientService],
})
export class AiModule {}
