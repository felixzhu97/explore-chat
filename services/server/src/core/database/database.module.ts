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
import { PostRepositoryAdapter } from "@/post/infrastructure/post-repository.adapter";
import { EngagementRepositoryAdapter } from "@/post/infrastructure/engagement-repository.adapter";
import { CommentRepositoryAdapter } from "@/comments/infrastructure/comment-repository.adapter";
import { NotificationRepositoryAdapter } from "@/notifications/infrastructure/notification-repository.adapter";
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
    PostRepositoryAdapter,
    EngagementRepositoryAdapter,
    CommentRepositoryAdapter,
    NotificationRepositoryAdapter,
    { provide: "IPostRepository", useExisting: PostRepositoryAdapter },
    {
      provide: "IEngagementRepository",
      useExisting: EngagementRepositoryAdapter,
    },
    { provide: "ICommentRepository", useExisting: CommentRepositoryAdapter },
    {
      provide: "INotificationRepository",
      useExisting: NotificationRepositoryAdapter,
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
    PostRepositoryAdapter,
    EngagementRepositoryAdapter,
    CommentRepositoryAdapter,
    NotificationRepositoryAdapter,
    "IPostRepository",
    "IEngagementRepository",
    "ICommentRepository",
    "INotificationRepository",
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
