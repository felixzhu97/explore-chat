import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationService } from "@/notifications/service/notification.service";
import {
  USER_DOMAIN,
  BOUNDARY,
  STRING_VALUES,
} from "@whatschat/shared-types/test-utils/domain-values";

// =============================================================================
// MOCK FACTORIES
// =============================================================================

/**
 * Creates a mock notification repository with default implementations
 */
const createMockNotificationRepo = (overrides = {}) => ({
  findByRecipient: vi
    .fn()
    .mockResolvedValue({ items: [], nextCursor: undefined }),
  markRead: vi.fn().mockResolvedValue(true),
  markReadMany: vi.fn().mockResolvedValue(5),
  markAllRead: vi.fn().mockResolvedValue(10),
  upsertLike: vi.fn().mockResolvedValue({ id: "notif_like_1" }),
  deleteLike: vi.fn().mockResolvedValue(true),
  insertComment: vi.fn().mockResolvedValue({ id: "notif_comment_1" }),
  deleteByCommentId: vi.fn().mockResolvedValue(true),
  ...overrides,
});

// =============================================================================
// TEST DATA - Using domain values
// =============================================================================

const TEST_RECIPIENT_ID = USER_DOMAIN.VALID.id;
const TEST_ACTOR_ID = "actor_1234567890";
const TEST_POST_ID = "post_test_123";
const TEST_COMMENT_ID = "comment_1234567890";

describe("NotificationService", () => {
  let service: NotificationService;

  describe("list", () => {
    it("should list notifications with default limit", async () => {
      const mockRepo = createMockNotificationRepo();
      service = new NotificationService(mockRepo as any);

      await service.list(TEST_RECIPIENT_ID, 20);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        20,
        undefined,
      );
    });

    describe("limit boundary tests", () => {
      it.each([
        { input: 0, expected: 1, label: "zero limit" },
        { input: -1, expected: 1, label: "negative limit" },
        { input: -100, expected: 1, label: "large negative limit" },
      ])(
        "should enforce minimum limit of 1 for $label",
        async ({ input, expected }) => {
          const mockRepo = createMockNotificationRepo();
          service = new NotificationService(mockRepo as any);

          await service.list(TEST_RECIPIENT_ID, input);

          expect(mockRepo.findByRecipient).toHaveBeenCalledWith(
            TEST_RECIPIENT_ID,
            expected,
            undefined,
          );
        },
      );

      it.each([
        { input: 51, expected: 50, label: "just over max" },
        { input: 100, expected: 50, label: "double max" },
        { input: 1000, expected: 50, label: "large value" },
      ])("should cap limit at 50 for $label", async ({ input, expected }) => {
        const mockRepo = createMockNotificationRepo();
        service = new NotificationService(mockRepo as any);

        await service.list(TEST_RECIPIENT_ID, input);

        expect(mockRepo.findByRecipient).toHaveBeenCalledWith(
          TEST_RECIPIENT_ID,
          expected,
          undefined,
        );
      });

      it.each([
        { input: 1, label: "minimum valid" },
        { input: 25, label: "middle value" },
        { input: 50, label: "maximum valid" },
      ])("should pass through valid limit ($label)", async ({ input }) => {
        const mockRepo = createMockNotificationRepo();
        service = new NotificationService(mockRepo as any);

        await service.list(TEST_RECIPIENT_ID, input);

        expect(mockRepo.findByRecipient).toHaveBeenCalledWith(
          TEST_RECIPIENT_ID,
          input,
          undefined,
        );
      });
    });

    it("should pass cursor to repository", async () => {
      const mockRepo = createMockNotificationRepo();
      service = new NotificationService(mockRepo as any);
      const cursor = "base64encodedcursor";

      await service.list(TEST_RECIPIENT_ID, 20, cursor);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        20,
        cursor,
      );
    });
  });

  describe("markRead", () => {
    it("should mark notification as read", async () => {
      const mockRepo = createMockNotificationRepo({
        markRead: vi.fn().mockResolvedValue(true),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.markRead(TEST_RECIPIENT_ID, "notif-1");

      expect(mockRepo.markRead).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        "notif-1",
      );
      expect(result).toEqual({ success: true });
    });

    it("should return success false when markRead fails", async () => {
      const mockRepo = createMockNotificationRepo({
        markRead: vi.fn().mockResolvedValue(false),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.markRead(TEST_RECIPIENT_ID, "notif-1");

      expect(result).toEqual({ success: false });
    });
  });

  describe("markReadMany", () => {
    it("should mark multiple notifications as read", async () => {
      const mockRepo = createMockNotificationRepo({
        markReadMany: vi.fn().mockResolvedValue(3),
      });
      service = new NotificationService(mockRepo as any);
      const ids = ["notif-1", "notif-2", "notif-3"];

      const result = await service.markReadMany(TEST_RECIPIENT_ID, ids);

      expect(mockRepo.markReadMany).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        ids,
      );
      expect(result).toEqual({ success: true, modified: 3 });
    });

    it("should handle empty ids array", async () => {
      const mockRepo = createMockNotificationRepo({
        markReadMany: vi.fn().mockResolvedValue(0),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.markReadMany(TEST_RECIPIENT_ID, []);

      expect(result).toEqual({ success: true, modified: 0 });
    });
  });

  describe("markAllRead", () => {
    it("should mark all notifications as read", async () => {
      const mockRepo = createMockNotificationRepo({
        markAllRead: vi.fn().mockResolvedValue(25),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.markAllRead(TEST_RECIPIENT_ID);

      expect(mockRepo.markAllRead).toHaveBeenCalledWith(TEST_RECIPIENT_ID);
      expect(result).toEqual({ success: true, modified: 25 });
    });

    it("should return zero modified when no notifications exist", async () => {
      const mockRepo = createMockNotificationRepo({
        markAllRead: vi.fn().mockResolvedValue(0),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.markAllRead(TEST_RECIPIENT_ID);

      expect(result).toEqual({ success: true, modified: 0 });
    });
  });

  describe("upsertLike", () => {
    it("should upsert like notification", async () => {
      const mockRepo = createMockNotificationRepo({
        upsertLike: vi.fn().mockResolvedValue({ id: "notif_like_123" }),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.upsertLike(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
      );

      expect(mockRepo.upsertLike).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
      );
      expect(result).toEqual({ id: "notif_like_123" });
    });

    it("should return null when upsert fails", async () => {
      const mockRepo = createMockNotificationRepo({
        upsertLike: vi.fn().mockResolvedValue(null),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.upsertLike(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
      );

      expect(result).toBeNull();
    });
  });

  describe("deleteLike", () => {
    it("should delete like notification", async () => {
      const mockRepo = createMockNotificationRepo({
        deleteLike: vi.fn().mockResolvedValue(true),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.deleteLike(TEST_ACTOR_ID, TEST_POST_ID);

      expect(mockRepo.deleteLike).toHaveBeenCalledWith(
        TEST_ACTOR_ID,
        TEST_POST_ID,
      );
      expect(result).toBe(true);
    });

    it("should return false when delete fails", async () => {
      const mockRepo = createMockNotificationRepo({
        deleteLike: vi.fn().mockResolvedValue(false),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.deleteLike(TEST_ACTOR_ID, TEST_POST_ID);

      expect(result).toBe(false);
    });
  });

  describe("insertComment", () => {
    it("should insert comment notification", async () => {
      const mockRepo = createMockNotificationRepo({
        insertComment: vi.fn().mockResolvedValue({ id: TEST_COMMENT_ID }),
      });
      service = new NotificationService(mockRepo as any);
      const content = "Great post!";

      const result = await service.insertComment(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        content,
      );

      expect(mockRepo.insertComment).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        content,
      );
      expect(result).toEqual({ id: TEST_COMMENT_ID });
    });

    describe("content truncation", () => {
      it.each([
        { length: 120, shouldTruncate: false, label: "exactly at limit" },
        { length: 121, shouldTruncate: true, label: "one over limit" },
        { length: 200, shouldTruncate: true, label: "well over limit" },
        { length: 1000, shouldTruncate: true, label: "very long content" },
      ])(
        "should $shouldTruncate ? 'truncate' : 'preserve' content of length $length",
        async ({ length, shouldTruncate }) => {
          const longContent = "a".repeat(length);
          const expectedContent = shouldTruncate
            ? "a".repeat(120)
            : longContent;
          const mockRepo = createMockNotificationRepo({
            insertComment: vi.fn().mockResolvedValue({ id: "notif_1" }),
          });
          service = new NotificationService(mockRepo as any);

          await service.insertComment(
            TEST_RECIPIENT_ID,
            TEST_ACTOR_ID,
            TEST_POST_ID,
            TEST_COMMENT_ID,
            longContent,
          );

          expect(mockRepo.insertComment).toHaveBeenCalledWith(
            TEST_RECIPIENT_ID,
            TEST_ACTOR_ID,
            TEST_POST_ID,
            TEST_COMMENT_ID,
            expectedContent,
          );
        },
      );
    });

    it("should handle undefined content", async () => {
      const mockRepo = createMockNotificationRepo({
        insertComment: vi.fn().mockResolvedValue({ id: TEST_COMMENT_ID }),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.insertComment(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        undefined,
      );

      expect(mockRepo.insertComment).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        undefined,
      );
      expect(result).toEqual({ id: TEST_COMMENT_ID });
    });

    it("should handle empty content", async () => {
      const mockRepo = createMockNotificationRepo({
        insertComment: vi.fn().mockResolvedValue({ id: TEST_COMMENT_ID }),
      });
      service = new NotificationService(mockRepo as any);

      await service.insertComment(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        STRING_VALUES.EMPTY,
      );

      expect(mockRepo.insertComment).toHaveBeenCalledWith(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        STRING_VALUES.EMPTY,
      );
    });

    it("should preserve unicode in truncated content", async () => {
      const unicodeContent = STRING_VALUES.UNICODE_EMOJI + "a".repeat(115);
      const mockRepo = createMockNotificationRepo({
        insertComment: vi.fn().mockResolvedValue({ id: "notif_1" }),
      });
      service = new NotificationService(mockRepo as any);

      await service.insertComment(
        TEST_RECIPIENT_ID,
        TEST_ACTOR_ID,
        TEST_POST_ID,
        TEST_COMMENT_ID,
        unicodeContent,
      );

      expect(mockRepo.insertComment).toHaveBeenCalled();
    });
  });

  describe("deleteByCommentId", () => {
    it("should delete comment notification", async () => {
      const mockRepo = createMockNotificationRepo({
        deleteByCommentId: vi.fn().mockResolvedValue(true),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.deleteByCommentId(TEST_COMMENT_ID);

      expect(mockRepo.deleteByCommentId).toHaveBeenCalledWith(TEST_COMMENT_ID);
      expect(result).toBe(true);
    });

    it("should return false when delete fails", async () => {
      const mockRepo = createMockNotificationRepo({
        deleteByCommentId: vi.fn().mockResolvedValue(false),
      });
      service = new NotificationService(mockRepo as any);

      const result = await service.deleteByCommentId(TEST_COMMENT_ID);

      expect(result).toBe(false);
    });
  });
});
