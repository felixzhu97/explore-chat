import { Module } from "@nestjs/common";
import { MediaController } from "@/media/presentation/media.controller";
import { MediaService } from "@/media/application/media.service";
import { MinioService } from "@/core/storage/minio.service";

@Module({
  controllers: [MediaController],
  providers: [MediaService, MinioService],
  exports: [MediaService],
})
export class MediaModule {}
