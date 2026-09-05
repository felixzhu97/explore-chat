import { Module, Global, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { RedisService } from "./redis.service";
import { CacheService } from "../cache/cache.service";
import { FeedCacheService } from "../cache/feed-cache.service";
import { CassandraService } from "./cassandra.service";
import { MongoService } from "./mongo.service";
import { ElasticsearchService } from "./elasticsearch.service";
import { CassandraPostRepository } from "./cassandra-post.repository";
import { CassandraFeedRepository } from "./cassandra-feed.repository";
import { CassandraEngagementRepository } from "./cassandra-engagement.repository";
import { PostRepositoryImpl } from "@/post/infra/post.repository";
import { EngagementRepositoryImpl } from "@/post/infra/engagement.repository";
import { CommentRepositoryImpl } from "@/comments/infra/comment.repository";
import { NotificationRepositoryImpl } from "@/notifications/infra/notification.repository";
import { MongoCommentRepository } from "./mongo-comment.repository";
import { MongoNotificationRepository } from "./mongo-notification.repository";

@Global()
@Module({
  providers: [
    PrismaService,
    RedisService,
    CacheService,
    FeedCacheService,
    CassandraService,
    MongoService,
    ElasticsearchService,
    CassandraPostRepository,
    CassandraFeedRepository,
    CassandraEngagementRepository,
    PostRepositoryImpl,
    EngagementRepositoryImpl,
    CommentRepositoryImpl,
    NotificationRepositoryImpl,
    { provide: "PostRepository", useExisting: PostRepositoryImpl },
    {
      provide: "EngagementRepository",
      useExisting: EngagementRepositoryImpl,
    },
    { provide: "CommentRepository", useExisting: CommentRepositoryImpl },
    {
      provide: "NotificationRepository",
      useExisting: NotificationRepositoryImpl,
    },
    MongoCommentRepository,
    MongoNotificationRepository,
  ],
  exports: [
    PrismaService,
    RedisService,
    CacheService,
    FeedCacheService,
    CassandraService,
    MongoService,
    ElasticsearchService,
    CassandraPostRepository,
    CassandraFeedRepository,
    CassandraEngagementRepository,
    PostRepositoryImpl,
    EngagementRepositoryImpl,
    CommentRepositoryImpl,
    NotificationRepositoryImpl,
    "PostRepository",
    "EngagementRepository",
    "CommentRepository",
    "NotificationRepository",
    MongoCommentRepository,
    MongoNotificationRepository,
  ],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly cassandra: CassandraService,
    private readonly mongo: MongoService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async onModuleInit() {
    if (this.prisma) await this.prisma.onModuleInit();
    if (this.redis) await this.redis.onModuleInit();
    if (this.cassandra) await this.cassandra.onModuleInit();
    if (this.mongo) await this.mongo.onModuleInit();
    if (this.elasticsearch) await this.elasticsearch.onModuleInit();
  }

  async onModuleDestroy() {
    if (this.elasticsearch) await this.elasticsearch.onModuleDestroy();
    if (this.mongo) await this.mongo.onModuleDestroy();
    if (this.cassandra) await this.cassandra.onModuleDestroy();
    if (this.prisma) await this.prisma.onModuleDestroy();
    if (this.redis) await this.redis.onModuleDestroy();
  }
}
