import { Module } from "@nestjs/common";
import { AnalyticsController } from "./controller/analytics.controller";
import { AnalyticsService } from "@/analytics/service/analytics.service";
import { DatabaseModule } from "@/core/database/database.module";
import { FeedSeenService } from "@/post/service/feed-seen.service";

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, FeedSeenService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
