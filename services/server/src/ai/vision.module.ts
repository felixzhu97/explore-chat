import { Module } from "@nestjs/common";
import { VisionController } from "./controller/vision.controller";
import { VisionClientService } from "@/ai/service/vision-client.service";

@Module({
  controllers: [VisionController],
  providers: [VisionClientService],
  exports: [VisionClientService],
})
export class VisionModule {}
