import { describe, it, expect, beforeEach, vi } from "vitest";
import { EngagementService } from "@/post/application/engagement.service";
import { NotificationService } from "@/notifications/application/notification.service";
import { ChatGateway } from "@/websocket/presentation/chat.gateway";

describe("EngagementService", () => {
  let service: EngagementService;
  let mockEngagementRepo: {
    like: ReturnType<typeof vi.fn>;
    unlike: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    unsave: ReturnType<typeof vi.fn>;
    isLiked: ReturnType<typeof vi.fn>;
    isSaved: ReturnType<typeof vi.fn>;
    getEngagementCounts: ReturnType<typeof vi.fn>;
  };
  let mockPostRepo: {
    getPostById: ReturnType<typeof vi.fn>;
  };
  let mockNotificationService: {
    upsertLike: ReturnType<typeof vi.fn>;
    deleteLike: ReturnType<typeof vi.fn>;
  };
  let mockChatGateway: {
    emitNotification: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockEngagementRepo = {
      like: vi.fn().mockResolvedValue(true),
      unlike: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(true),
      unsave: vi.fn().mockResolvedValue(true),
      isLiked: vi.fn().mockResolvedValue(false),
      isSaved: vi.fn().mockResolvedValue(false),
      getEngagementCounts: vi
        .fn()
        .mockResolvedValue({ likeCount: 1, commentCount: 0, saveCount: 0 }),
    };

    mockPostRepo = {
      getPostById: vi.fn().mockResolvedValue({
        post_id: "post-1",
        user_id: "author-1",
        created_at: new Date(),
        caption: "Test post",
        type: "IMAGE",
        media_urls: [],
        location: null,
        cover_url: null,
      }),
    };

    mockNotificationService = {
      upsertLike: vi.fn().mockResolvedValue(null),
      deleteLike: vi.fn().mockResolvedValue(false),
    };

    mockChatGateway = {
      emitNotification: vi.fn(),
    };

    service = new EngagementService(
      mockEngagementRepo as never,
      mockPostRepo as never,
      mockNotificationService as never,
      mockChatGateway as never,
    );
  });

  describe("like", () => {
    it("should throw NotFoundException when post not found", async () => {
      mockPostRepo.getPostById.mockResolvedValue(null);

      await expect(service.like("user-1", "non-existent")).rejects.toThrow();
    });

    it("should return already liked state when post is already liked", async () => {
      mockEngagementRepo.isLiked.mockResolvedValue(true);

      const result = await service.like("user-1", "post-1");

      expect(result.isLiked).toBe(true);
      expect(result.likeCount).toBe(1);
    });

    it("should like post and create notification", async () => {
      mockEngagementRepo.isLiked.mockResolvedValue(false);

      const result = await service.like("user-1", "post-1");

      expect(mockEngagementRepo.like).toHaveBeenCalledWith("user-1", "post-1");
      expect(result.isLiked).toBe(true);
    });

    it("should not create notification when liking own post", async () => {
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
      mockEngagementRepo.isLiked.mockResolvedValue(false);

      await service.like("user-1", "post-1");

      expect(mockNotificationService.upsertLike).not.toHaveBeenCalled();
    });
  });

  describe("unlike", () => {
    it("should throw NotFoundException when post not found", async () => {
      mockPostRepo.getPostById.mockResolvedValue(null);

      await expect(service.unlike("user-1", "non-existent")).rejects.toThrow();
    });

    it("should unlike post and delete notification", async () => {
      const result = await service.unlike("user-1", "post-1");

      expect(mockEngagementRepo.unlike).toHaveBeenCalledWith(
        "user-1",
        "post-1",
      );
      expect(mockNotificationService.deleteLike).toHaveBeenCalledWith(
        "user-1",
        "post-1",
      );
      expect(result.isLiked).toBe(false);
    });
  });

  describe("save", () => {
    it("should throw NotFoundException when post not found", async () => {
      mockPostRepo.getPostById.mockResolvedValue(null);

      await expect(service.save("user-1", "non-existent")).rejects.toThrow();
    });

    it("should return already saved state when post is already saved", async () => {
      mockEngagementRepo.isSaved.mockResolvedValue(true);

      const result = await service.save("user-1", "post-1");

      expect(result.isSaved).toBe(true);
    });

    it("should save post", async () => {
      mockEngagementRepo.isSaved.mockResolvedValue(false);

      const result = await service.save("user-1", "post-1");

      expect(mockEngagementRepo.save).toHaveBeenCalledWith("user-1", "post-1");
      expect(result.isSaved).toBe(true);
    });
  });

  describe("unsave", () => {
    it("should throw NotFoundException when post not found", async () => {
      mockPostRepo.getPostById.mockResolvedValue(null);

      await expect(service.unsave("user-1", "non-existent")).rejects.toThrow();
    });

    it("should unsave post", async () => {
      const result = await service.unsave("user-1", "post-1");

      expect(mockEngagementRepo.unsave).toHaveBeenCalledWith(
        "user-1",
        "post-1",
      );
      expect(result.isSaved).toBe(false);
    });
  });

  describe("getEngagementCounts", () => {
    it("should return engagement counts", async () => {
      const result = await service.getEngagementCounts("post-1");

      expect(mockEngagementRepo.getEngagementCounts).toHaveBeenCalledWith(
        "post-1",
      );
      expect(result).toEqual({ likeCount: 1, commentCount: 0, saveCount: 0 });
    });
  });

  describe("isLiked", () => {
    it("should return like status", async () => {
      mockEngagementRepo.isLiked.mockResolvedValue(true);

      const result = await service.isLiked("user-1", "post-1");

      expect(mockEngagementRepo.isLiked).toHaveBeenCalledWith(
        "user-1",
        "post-1",
      );
      expect(result).toBe(true);
    });
  });

  describe("isSaved", () => {
    it("should return save status", async () => {
      mockEngagementRepo.isSaved.mockResolvedValue(true);

      const result = await service.isSaved("user-1", "post-1");

      expect(mockEngagementRepo.isSaved).toHaveBeenCalledWith(
        "user-1",
        "post-1",
      );
      expect(result).toBe(true);
    });
  });
});
