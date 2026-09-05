import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "@/core/database/database.module";
import { KafkaModule } from "@/core/messaging/kafka.module";
import { ConfigService } from "@/core/config/config.service";
import { AuthModule } from "@/auth/auth.module";
import { HealthModule } from "@/health/health.module";
import { WebSocketModule } from "@/websocket/websocket.module";
import { UsersModule } from "@/users/users.module";
import { MessagesModule } from "@/messages/messages.module";
import { ChatsModule } from "@/chats/chats.module";
import { GroupsModule } from "@/groups/groups.module";
import { CallsModule } from "@/calls/calls.module";
import { StatusModule } from "@/status/status.module";
import { AdminModule } from "@/admin/admin.module";
import { AnalyticsModule } from "@/analytics/analytics.module";
import { AiModule } from "@/ai/ai.module";
import { VideoModule } from "@/ai/video.module";
import { ImageModule } from "@/ai/image.module";
import { VisionModule } from "@/ai/vision.module";
import { VoiceModule } from "@/ai/voice.module";
import { PostModule } from "@/post/post.module";
import { MediaModule } from "@/media/media.module";
import { CommentsModule } from "@/comments/comments.module";
import { SearchModule } from "@/search/search.module";
import { FollowModule } from "@/follow/follow.module";
import { GraphqlModule } from "@/graphql/graphql.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { AdsModule } from "@/ads/ads.module";

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
