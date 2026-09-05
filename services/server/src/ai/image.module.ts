import { Module } from "@nestjs/common";
import { ImageController } from "./controller/image.controller";
import { ImageService } from "@/ai/service/image.service";
import { AiModule } from "@/ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
