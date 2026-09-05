import { Module } from "@nestjs/common";
import { PostController } from "./controller/post.controller";
import { PostService } from "@/post/service/post.service";
import { FeedService } from "@/post/service/feed.service";
import { EngagementService } from "@/post/service/engagement.service";
import { ExploreService } from "@/post/service/explore.service";
import { RecommendationService } from "@/post/service/recommendation.service";
import { ExperimentService } from "@/analytics/service/experiment.service";
import { AdService } from "@/ads/service/ad.service";
import { AdTargetingService } from "@/ads/service/ad-targeting.service";
import { AdPacingService } from "@/ads/service/ad-pacing.service";
import { AdCreativeService } from "@/ads/service/ad-creative.service";
import { FeedSeenService } from "@/post/service/feed-seen.service";
import { KafkaModule } from "@/core/messaging/kafka.module";
import { UsersModule } from "@/users/users.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { WebSocketModule } from "@/websocket/websocket.module";
import { AiModule } from "@/ai/ai.module";
import { VisionModule } from "@/ai/vision.module";
import { SearchModule } from "@/search/search.module";
import { FeedFanoutService } from "@/post/service/feed-fanout.service";

@Module({
  imports: [
    KafkaModule,
    UsersModule,
    NotificationsModule,
    WebSocketModule,
    AiModule,
    VisionModule,
    SearchModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    FeedService,
    FeedSeenService,
    FeedFanoutService,
    EngagementService,
    ExploreService,
    RecommendationService,
    ExperimentService,
    AdService,
    AdTargetingService,
    AdPacingService,
    AdCreativeService,
  ],
  exports: [
    PostService,
    FeedService,
    FeedSeenService,
    FeedFanoutService,
    EngagementService,
    ExploreService,
    RecommendationService,
    ExperimentService,
    AdService,
    AdTargetingService,
    AdPacingService,
    AdCreativeService,
  ],
})
export class PostModule {}
