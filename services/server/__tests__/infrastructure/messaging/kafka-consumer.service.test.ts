import { describe, it, expect, beforeEach, vi } from "vitest";
import { KafkaConsumerService } from "@/core/messaging/kafka-consumer.service";
import { RedisService } from "@/core/database/redis.service";
import { CassandraFeedRepository } from "@/core/database/cassandra-feed.repository";
import { CacheService } from "@/core/cache/cache.service";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      kafka: {
        brokers: [],
        topicOfflineMessages: "offline-messages",
        topicPostCreated: "post.created",
        topicPostDeleted: "post.deleted",
        topicFeedFanout: "feed.fanout",
        topicCommentCreated: "comment.created",
        topicAnalyticsEvents: "analytics.events",
      },
      vision: {
        enabled: false,
        serviceUrl: "http://localhost:8001",
        timeoutMs: 15000,
        maxImagesPerPost: 3,
        moderationEnabled: false,
      },
      redis: {
        url: "redis://localhost:6379",
        password: undefined,
        cacheTtlSeconds: 300,
      },
    })),
  },
}));

describe("KafkaConsumerService", () => {
  let service: KafkaConsumerService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create service instance with mocked dependencies", () => {
      const mockRedisService = {
        getClient: vi.fn().mockReturnValue(null),
        rpush: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockPrismaService = {
        userFollow: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      } as never;
      const mockFeedRepo = {
        insertFeedEntry: vi.fn(),
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const mockCacheService = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockElasticsearchService = {
        getClient: vi.fn().mockReturnValue(null),
        index: vi.fn(),
      } as never;
      const mockPostRepo = {
        getPostById: vi.fn().mockResolvedValue(null),
      } as never;
      const mockVisionClient = {
        predictFromUrl: vi.fn().mockResolvedValue([]),
        moderateFromUrl: vi
          .fn()
          .mockResolvedValue({ safe: true, categories: [] }),
      } as never;

      service = new KafkaConsumerService(
        mockRedisService,
        mockPrismaService,
        mockFeedRepo,
        mockCacheService,
        mockElasticsearchService,
        mockPostRepo,
        mockVisionClient,
      );

      expect(service).toBeDefined();
    });
  });

  describe("onModuleInit", () => {
    it("should not connect when kafka is disabled (no brokers)", async () => {
      const mockRedisService = {
        getClient: vi.fn().mockReturnValue(null),
        rpush: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockPrismaService = {
        userFollow: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      } as never;
      const mockFeedRepo = {
        insertFeedEntry: vi.fn(),
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const mockCacheService = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockElasticsearchService = {
        getClient: vi.fn().mockReturnValue(null),
        index: vi.fn(),
      } as never;
      const mockPostRepo = {
        getPostById: vi.fn().mockResolvedValue(null),
      } as never;
      const mockVisionClient = {
        predictFromUrl: vi.fn().mockResolvedValue([]),
        moderateFromUrl: vi
          .fn()
          .mockResolvedValue({ safe: true, categories: [] }),
      } as never;

      service = new KafkaConsumerService(
        mockRedisService,
        mockPrismaService,
        mockFeedRepo,
        mockCacheService,
        mockElasticsearchService,
        mockPostRepo,
        mockVisionClient,
      );

      await service.onModuleInit();
    });
  });

  describe("onModuleDestroy", () => {
    it("should clean up resources without error", async () => {
      const mockRedisService = {
        getClient: vi.fn().mockReturnValue(null),
        rpush: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockPrismaService = {
        userFollow: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      } as never;
      const mockFeedRepo = {
        insertFeedEntry: vi.fn(),
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const mockCacheService = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockElasticsearchService = {
        getClient: vi.fn().mockReturnValue(null),
        index: vi.fn(),
      } as never;
      const mockPostRepo = {
        getPostById: vi.fn().mockResolvedValue(null),
      } as never;
      const mockVisionClient = {
        predictFromUrl: vi.fn().mockResolvedValue([]),
        moderateFromUrl: vi
          .fn()
          .mockResolvedValue({ safe: true, categories: [] }),
      } as never;

      service = new KafkaConsumerService(
        mockRedisService,
        mockPrismaService,
        mockFeedRepo,
        mockCacheService,
        mockElasticsearchService,
        mockPostRepo,
        mockVisionClient,
      );

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
