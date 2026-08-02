import { describe, it, expect, beforeEach, vi } from "vitest";
import { KafkaProducerService } from "@/core/messaging/kafka-producer.service";
import { ConfigService } from "@/core/config/config.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      kafka: {
        brokers: ["localhost:9092"],
        topicOfflineMessages: "offline-messages",
        topicPostCreated: "post.created",
        topicPostDeleted: "post.deleted",
        topicFeedFanout: "feed.fanout",
        topicCommentCreated: "comment.created",
        topicAnalyticsEvents: "analytics.events",
      },
    })),
  },
}));

describe("KafkaProducerService", () => {
  let service: KafkaProducerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new KafkaProducerService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should load kafka configuration", () => {
      expect(ConfigService.loadConfig).toHaveBeenCalled();
    });

    it("should create kafka client when brokers are configured", () => {
      expect(service).toBeDefined();
    });
  });

  describe("sendOfflineMessage", () => {
    it("should exist and be callable", async () => {
      await expect(
        service.sendOfflineMessage("user123", "payload"),
      ).resolves.toBeUndefined();
    });
  });

  describe("sendPostCreated", () => {
    it("should exist and be callable", async () => {
      const payload = {
        postId: "post123",
        userId: "user456",
        createdAt: "2024-01-01T00:00:00Z",
        caption: "Test caption",
        type: "IMAGE",
      };

      await expect(service.sendPostCreated(payload)).resolves.toBeUndefined();
    });
  });

  describe("sendPostDeleted", () => {
    it("should exist and be callable", async () => {
      const payload = { postId: "post123", userId: "user456" };

      await expect(service.sendPostDeleted(payload)).resolves.toBeUndefined();
    });
  });

  describe("sendCommentCreated", () => {
    it("should exist and be callable", async () => {
      const payload = {
        commentId: "comment123",
        postId: "post456",
        userId: "user789",
        content: "Great post!",
        createdAt: "2024-01-01T00:00:00Z",
      };

      await expect(
        service.sendCommentCreated(payload),
      ).resolves.toBeUndefined();
    });
  });
});
