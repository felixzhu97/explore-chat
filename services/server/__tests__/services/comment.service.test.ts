import { describe, it, expect, beforeEach, vi } from "vitest";
import { CommentService } from "@/comments/service/comment.service";
import { NotificationService } from "@/notifications/service/notification.service";
import { ChatGateway } from "@/websocket/presentation/chat.gateway";

describe("CommentService", () => {
  let service: CommentService;
  let mockCommentRepo: {
    insert: ReturnType<typeof vi.fn>;
    findByPostId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };
  let mockEngagementRepo: {
    incrementCommentCount: ReturnType<typeof vi.fn>;
    decrementCommentCount: ReturnType<typeof vi.fn>;
  };
  let mockPostRepo: {
    getPostById: ReturnType<typeof vi.fn>;
  };
  let mockKafka: {
    sendCommentCreated: ReturnType<typeof vi.fn>;
  };
  let mockNotificationService: {
    insertComment: ReturnType<typeof vi.fn>;
    deleteByCommentId: ReturnType<typeof vi.fn>;
  };
  let mockChatGateway: {
    emitNotification: ReturnType<typeof vi.fn>;
  };
  let mockAiService: {
    moderateText: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommentRepo = {
      insert: vi.fn().mockResolvedValue("comment-1"),
      findByPostId: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      deleteOne: vi.fn().mockResolvedValue(true),
    };

    mockEngagementRepo = {
      incrementCommentCount: vi.fn().mockResolvedValue(undefined),
      decrementCommentCount: vi.fn().mockResolvedValue(undefined),
    };

    mockPostRepo = {
      getPostById: vi.fn().mockResolvedValue(null),
    };

    mockKafka = {
      sendCommentCreated: vi.fn().mockResolvedValue(undefined),
    };

    mockNotificationService = {
      insertComment: vi.fn().mockResolvedValue(null),
      deleteByCommentId: vi.fn().mockResolvedValue(false),
    };

    mockChatGateway = {
      emitNotification: vi.fn(),
    };

    mockAiService = {
      moderateText: vi.fn().mockResolvedValue({ safe: true }),
    };

    service = new CommentService(
      mockCommentRepo as never,
      mockEngagementRepo as never,
      mockPostRepo as never,
      mockKafka as never,
      mockNotificationService as never,
      mockChatGateway as never,
      mockAiService as never,
    );
  });

  describe("create", () => {
    it("should throw BadRequestException when content violates guidelines", async () => {
      mockAiService.moderateText.mockResolvedValue({ safe: false });

      await expect(
        service.create("post-1", "user-1", "Bad content"),
      ).rejects.toThrow();
    });

    it("should create comment successfully", async () => {
      const result = await service.create("post-1", "user-1", "Great post!");

      expect(mockAiService.moderateText).toHaveBeenCalledWith("Great post!");
      expect(mockCommentRepo.insert).toHaveBeenCalled();
      expect(mockKafka.sendCommentCreated).toHaveBeenCalled();
      expect(mockEngagementRepo.incrementCommentCount).toHaveBeenCalledWith(
        "post-1",
      );
      expect(result.id).toBe("comment-1");
      expect(result.content).toBe("Great post!");
    });

    it("should create reply with parentId", async () => {
      const result = await service.create(
        "post-1",
        "user-1",
        "Reply content",
        "parent-comment-1",
      );

      expect(mockCommentRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: "parent-comment-1" }),
      );
    });

    it("should send notification when commenting on other's post", async () => {
      mockPostRepo.getPostById.mockResolvedValue({
        post_id: "post-1",
        user_id: "author-1",
        created_at: new Date(),
        caption: "Test",
        type: "IMAGE",
        media_urls: [],
        location: null,
        cover_url: null,
      });

      await service.create("post-1", "user-1", "Great!");

      expect(mockNotificationService.insertComment).toHaveBeenCalled();
    });

    it("should not send notification when commenting on own post", async () => {
      mockPostRepo.getPostById.mockResolvedValue({
        post_id: "post-1",
        user_id: "user-1",
        created_at: new Date(),
        caption: "My post",
        type: "IMAGE",
        media_urls: [],
        location: null,
        cover_url: null,
      });

      await service.create("post-1", "user-1", "My comment");

      expect(mockNotificationService.insertComment).not.toHaveBeenCalled();
    });
  });

  describe("findByPostId", () => {
    it("should return paginated comments", async () => {
      const mockComments = [
        {
          _id: "comment-1",
          postId: "post-1",
          userId: "user-1",
          content: "Comment 1",
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCommentRepo.findByPostId.mockResolvedValue(mockComments);

      const result = await service.findByPostId("post-1", 1, 10);

      expect(mockCommentRepo.findByPostId).toHaveBeenCalledWith(
        "post-1",
        10,
        0,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("comment-1");
    });

    it("should calculate correct skip value", async () => {
      await service.findByPostId("post-1", 3, 10);

      expect(mockCommentRepo.findByPostId).toHaveBeenCalledWith(
        "post-1",
        10,
        20,
      );
    });
  });

  describe("delete", () => {
    it("should throw NotFoundException when comment not found", async () => {
      mockCommentRepo.findById.mockResolvedValue(null);

      await expect(service.delete("non-existent", "user-1")).rejects.toThrow();
    });

    it("should throw NotFoundException when delete fails", async () => {
      mockCommentRepo.findById.mockResolvedValue({
        _id: "comment-1",
        postId: "post-1",
        userId: "user-1",
        content: "Comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCommentRepo.deleteOne.mockResolvedValue(false);

      await expect(service.delete("comment-1", "user-1")).rejects.toThrow();
    });

    it("should delete comment successfully", async () => {
      mockCommentRepo.findById.mockResolvedValue({
        _id: "comment-1",
        postId: "post-1",
        userId: "user-1",
        content: "Comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCommentRepo.deleteOne.mockResolvedValue(true);

      const result = await service.delete("comment-1", "user-1");

      expect(mockEngagementRepo.decrementCommentCount).toHaveBeenCalledWith(
        "post-1",
      );
      expect(mockNotificationService.deleteByCommentId).toHaveBeenCalledWith(
        "comment-1",
      );
      expect(result.deleted).toBe(true);
    });
  });
});
