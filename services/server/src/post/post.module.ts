import { Module } from "@nestjs/common";
import { PostController } from "./controller/post.controller";
import { PostService } from "@/post/service/post.service";
import { FeedService } from "@/post/service/feed.service";
import { EngagementService } from "@/post/service/engagement.service";
import { ExploreService } from "@/post/service/explore.service";
import { RecommendationService } from "@/post/service/recommendation.service";
import { ExperimentService } from "@/analytics/application/experiment.service";
import { AdService } from "@/ads/application/ad.service";
import { AdTargetingService } from "@/ads/application/ad-targeting.service";
import { AdPacingService } from "@/ads/application/ad-pacing.service";
import { AdCreativeService } from "@/ads/application/ad-creative.service";
import { FeedSeenService } from "@/post/service/feed-seen.service";
import { KafkaModule } from "@/core/messaging/kafka.module";
import { UsersModule } from "@/users/users.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { WebSocketModule } from "@/websocket/presentation/websocket.module";
import { AiModule } from "@/ai/presentation/ai.module";
import { VisionModule } from "@/ai/presentation/vision.module";
import { SearchModule } from "@/search/presentation/search.module";
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
