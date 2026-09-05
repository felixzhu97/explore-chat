import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationRepositoryImpl } from "@/notifications/infra/notification-repository.adapter";
import { MongoNotificationRepository } from "@/core/database/mongo-notification.repository";

describe("NotificationRepositoryImpl", () => {
  let adapter: NotificationRepositoryImpl;
  let mockImpl: ReturnType<typeof vi.mocked<MongoNotificationRepository>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockImpl = {
      upsertLike: vi.fn().mockResolvedValue(null),
      deleteLike: vi.fn().mockResolvedValue(false),
      insertComment: vi.fn().mockResolvedValue(null),
      deleteByCommentId: vi.fn().mockResolvedValue(false),
      findByRecipient: vi.fn().mockResolvedValue({ items: [] }),
      markRead: vi.fn().mockResolvedValue(false),
      markReadMany: vi.fn().mockResolvedValue(0),
      markAllRead: vi.fn().mockResolvedValue(0),
    } as never;
    adapter = new NotificationRepositoryImpl(mockImpl);
  });

  describe("upsertLike", () => {
    it("should delegate to implementation", async () => {
      const notification = {
        id: "notification-1",
        recipientId: "recipient-1",
        actorId: "actor-1",
        type: "like" as const,
        postId: "post-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockImpl.upsertLike.mockResolvedValue(notification);

      const result = await adapter.upsertLike(
        "recipient-1",
        "actor-1",
        "post-1",
      );

      expect(mockImpl.upsertLike).toHaveBeenCalledWith(
        "recipient-1",
        "actor-1",
        "post-1",
      );
      expect(result).toEqual(notification);
    });
  });

  describe("deleteLike", () => {
    it("should delegate to implementation", async () => {
      mockImpl.deleteLike.mockResolvedValue(true);

      const result = await adapter.deleteLike("actor-1", "post-1");

      expect(mockImpl.deleteLike).toHaveBeenCalledWith("actor-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("insertComment", () => {
    it("should delegate to implementation", async () => {
      const notification = {
        id: "notification-1",
        recipientId: "recipient-1",
        actorId: "actor-1",
        type: "comment" as const,
        postId: "post-1",
        commentId: "comment-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockImpl.insertComment.mockResolvedValue(notification);

      const result = await adapter.insertComment(
        "recipient-1",
        "actor-1",
        "post-1",
        "comment-1",
        "Great!",
      );

      expect(mockImpl.insertComment).toHaveBeenCalledWith(
        "recipient-1",
        "actor-1",
        "post-1",
        "comment-1",
        "Great!",
      );
      expect(result).toEqual(notification);
    });
  });

  describe("deleteByCommentId", () => {
    it("should delegate to implementation", async () => {
      mockImpl.deleteByCommentId.mockResolvedValue(true);

      const result = await adapter.deleteByCommentId("comment-1");

      expect(mockImpl.deleteByCommentId).toHaveBeenCalledWith("comment-1");
      expect(result).toBe(true);
    });
  });

  describe("findByRecipient", () => {
    it("should delegate to implementation", async () => {
      const result = await adapter.findByRecipient("recipient-1", 10);

      expect(mockImpl.findByRecipient).toHaveBeenCalledWith(
        "recipient-1",
        10,
        undefined,
      );
    });

    it("should pass cursor when provided", async () => {
      await adapter.findByRecipient("recipient-1", 10, "cursor");

      expect(mockImpl.findByRecipient).toHaveBeenCalledWith(
        "recipient-1",
        10,
        "cursor",
      );
    });
  });

  describe("markRead", () => {
    it("should delegate to implementation", async () => {
      mockImpl.markRead.mockResolvedValue(true);

      const result = await adapter.markRead("recipient-1", "notification-1");

      expect(mockImpl.markRead).toHaveBeenCalledWith(
        "recipient-1",
        "notification-1",
      );
      expect(result).toBe(true);
    });
  });

  describe("markReadMany", () => {
    it("should delegate to implementation", async () => {
      mockImpl.markReadMany.mockResolvedValue(5);

      const result = await adapter.markReadMany("recipient-1", [
        "id-1",
        "id-2",
      ]);

      expect(mockImpl.markReadMany).toHaveBeenCalledWith("recipient-1", [
        "id-1",
        "id-2",
      ]);
      expect(result).toBe(5);
    });
  });

  describe("markAllRead", () => {
    it("should delegate to implementation", async () => {
      mockImpl.markAllRead.mockResolvedValue(10);

      const result = await adapter.markAllRead("recipient-1");

      expect(mockImpl.markAllRead).toHaveBeenCalledWith("recipient-1");
      expect(result).toBe(10);
    });
  });
});
