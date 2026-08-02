import { Module } from "@nestjs/common";
import { VideoController } from "./video.controller";
import { VideoService } from "@/ai/application/video.service";

@Module({
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
