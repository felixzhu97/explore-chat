import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { ExploreAiController } from "./explore-ai.controller";
import { AiService } from "@/application/services/ai.service";
import { ExploreAiClientService } from "@/application/services/explore-ai-client.service";

@Module({
  controllers: [AiController, ExploreAiController],
  providers: [AiService, ExploreAiClientService],
  exports: [AiService, ExploreAiClientService],
})
export class AiModule {}
