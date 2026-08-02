import { Module } from "@nestjs/common";
import { VisionController } from "./vision.controller";
import { VisionClientService } from "@/ai/application/vision-client.service";

@Module({
  controllers: [VisionController],
  providers: [VisionClientService],
  exports: [VisionClientService],
})
export class VisionModule {}
