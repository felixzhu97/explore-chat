import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "@/core/database/database.module";
import { KafkaModule } from "@/core/messaging/kafka.module";
import { ConfigService } from "@/core/config/config.service";
import { AuthModule } from "@/auth/presentation/auth.module";
import { HealthModule } from "@/health/presentation/health.module";
import { WebSocketModule } from "@/websocket/presentation/websocket.module";
import { UsersModule } from "@/users/presentation/users.module";
import { MessagesModule } from "@/messages/presentation/messages.module";
import { ChatsModule } from "@/chats/presentation/chats.module";
import { GroupsModule } from "@/groups/presentation/groups.module";
import { CallsModule } from "@/calls/presentation/calls.module";
import { StatusModule } from "@/status/presentation/status.module";
import { AdminModule } from "@/admin/presentation/admin.module";
import { AnalyticsModule } from "@/analytics/presentation/analytics.module";
import { AiModule } from "@/ai/presentation/ai.module";
import { VideoModule } from "@/ai/presentation/video.module";
import { ImageModule } from "@/ai/presentation/image.module";
import { VisionModule } from "@/ai/presentation/vision.module";
import { VoiceModule } from "@/ai/presentation/voice.module";
import { PostModule } from "@/post/presentation/post.module";
import { MediaModule } from "@/media/presentation/media.module";
import { CommentsModule } from "@/comments/presentation/comments.module";
import { SearchModule } from "@/search/presentation/search.module";
import { FollowModule } from "@/follow/presentation/follow.module";
import { GraphqlModule } from "@/graphql/graphql.module";
import { NotificationsModule } from "@/notifications/presentation/notifications.module";
import { AdsModule } from "@/ads/presentation/ads.module";

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ConfigService.loadConfig],
      validate: (config: Record<string, any>) =>
        ConfigService.validateConfig(config),
    }),
    // Rate limiting module
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      },
    ]),
    // Database module
    DatabaseModule,
    KafkaModule,
    AuthModule,
    HealthModule,
    WebSocketModule,
    UsersModule,
    MessagesModule,
    ChatsModule,
    GroupsModule,
    CallsModule,
    StatusModule,
    AdminModule,
    AnalyticsModule,
    AiModule,
    VideoModule,
    ImageModule,
    VisionModule,
    VoiceModule,
    PostModule,
    MediaModule,
    CommentsModule,
    SearchModule,
    FollowModule,
    GraphqlModule,
    NotificationsModule,
    AdsModule,
  ],
})
export class AppModule {}
