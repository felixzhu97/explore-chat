import { Module } from "@nestjs/common";
import { ImageController } from "./image.controller";
import { ImageService } from "@/ai/application/image.service";
import { AiModule } from "@/ai/presentation/ai.module";

@Module({
  imports: [AiModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
