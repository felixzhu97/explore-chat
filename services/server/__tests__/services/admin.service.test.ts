import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdminService } from "@/admin/service/admin.service";

describe("AdminService", () => {
  let service: AdminService;
  let mockPrisma: {
    user: {
      count: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    chat: {
      count: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    group: { count: ReturnType<typeof vi.fn> };
    message: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
  };
  let mockElasticsearch: {
    getClient: ReturnType<typeof vi.fn>;
    indexUser: ReturnType<typeof vi.fn>;
  };
  let mockPostRepo: {
    getPostById: ReturnType<typeof vi.fn>;
    getPostsByUserId: ReturnType<typeof vi.fn>;
    deletePost: ReturnType<typeof vi.fn>;
  };
  let mockEngagementRepo: {
    getEngagementCounts: ReturnType<typeof vi.fn>;
  };
  let mockCommentRepo: {
    findById: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };
  let mockVisionClient: {
    moderateFromUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      user: {
        count: vi.fn().mockResolvedValue(100),
        findMany: vi.fn().mockResolvedValue([]),
      },
      chat: {
        count: vi.fn().mockResolvedValue(50),
        findMany: vi.fn().mockResolvedValue([]),
      },
      group: { count: vi.fn().mockResolvedValue(25) },
      message: {
        count: vi.fn().mockResolvedValue(1000),
        groupBy: vi.fn().mockResolvedValue([]),
      },
    };

    mockElasticsearch = {
      getClient: vi.fn().mockReturnValue(null),
      indexUser: vi.fn().mockResolvedValue(undefined),
    };

    mockPostRepo = {
      getPostById: vi.fn().mockResolvedValue(null),
      getPostsByUserId: vi.fn().mockResolvedValue({ rows: [] }),
      deletePost: vi.fn().mockResolvedValue(undefined),
    };

    mockEngagementRepo = {
      getEngagementCounts: vi
        .fn()
        .mockResolvedValue({ likeCount: 0, commentCount: 0, saveCount: 0 }),
    };

    mockCommentRepo = {
      findById: vi.fn().mockResolvedValue(null),
      deleteOne: vi.fn().mockResolvedValue(false),
    };

    mockVisionClient = {
      moderateFromUrl: vi
        .fn()
        .mockResolvedValue({ safe: true, categories: [] }),
    };

    service = new AdminService(
      mockPrisma as never,
      mockElasticsearch as never,
      mockPostRepo as never,
      mockEngagementRepo as never,
      mockCommentRepo as never,
      mockVisionClient as never,
    );
  });

  describe("getStats", () => {
    it("should return statistics", async () => {
      mockPrisma.message.groupBy.mockResolvedValue([
        { type: "TEXT", _count: { id: 500 } },
      ]);

      const result = await service.getStats();

      expect(result.totalUsers).toBe(100);
      expect(result.totalChats).toBe(50);
      expect(result.totalGroups).toBe(25);
      expect(result.totalMessages).toBe(1000);
    });
  });

  describe("getAllChats", () => {
    it("should return paginated chats", async () => {
      mockPrisma.chat.findMany.mockResolvedValue([]);

      const result = await service.getAllChats();

      expect(result.data).toEqual([]);
    });

    it("should search chats by name", async () => {
      mockPrisma.chat.findMany.mockResolvedValue([]);

      await service.getAllChats(1, 20, "test");

      expect(mockPrisma.chat.findMany).toHaveBeenCalled();
    });
  });
});
