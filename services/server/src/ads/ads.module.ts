import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/database.module";
import { AdsController } from "./controller/ads.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [AdsController],
})
export class AdsModule {}
