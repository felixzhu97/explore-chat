import { Module } from "@nestjs/common";
import { VideoController } from "./controller/video.controller";
import { VideoService } from "@/ai/service/video.service";

@Module({
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
