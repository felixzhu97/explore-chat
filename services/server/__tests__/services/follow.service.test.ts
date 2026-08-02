import { describe, it, expect, beforeEach, vi } from "vitest";
import { FollowService } from "@/follow/application/follow.service";

describe("FollowService", () => {
  let service: FollowService;
  let mockPrisma: {
    userFollow: {
      upsert: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    user: { findMany: ReturnType<typeof vi.fn> };
  };
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      userFollow: {
        upsert: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(10),
      },
      user: { findMany: vi.fn().mockResolvedValue([]) },
    };

    mockRedis = {
      get: vi.fn().mockResolvedValue(null),
    };

    service = new FollowService(mockPrisma as never, mockRedis as never);
  });

  describe("follow", () => {
    it("should throw error when trying to follow self", async () => {
      await expect(service.follow("user-1", "user-1")).rejects.toThrow();
    });

    it("should follow user successfully", async () => {
      const result = await service.follow("user-1", "user-2");

      expect(result.isFollowing).toBe(true);
      expect(mockPrisma.userFollow.upsert).toHaveBeenCalled();
    });
  });

  describe("unfollow", () => {
    it("should unfollow user successfully", async () => {
      const result = await service.unfollow("user-1", "user-2");

      expect(result.isFollowing).toBe(false);
      expect(mockPrisma.userFollow.deleteMany).toHaveBeenCalled();
    });
  });

  describe("checkFollowing", () => {
    it("should return empty set for empty array", async () => {
      const result = await service.checkFollowing("user-1", []);

      expect(result.size).toBe(0);
    });

    it("should return empty set for non-array input", async () => {
      const result = await service.checkFollowing("user-1", null as any);

      expect(result.size).toBe(0);
    });

    it("should return following set", async () => {
      mockPrisma.userFollow.findMany.mockResolvedValue([
        { followingId: "user-2" },
        { followingId: "user-3" },
      ]);

      const result = await service.checkFollowing("user-1", [
        "user-2",
        "user-3",
      ]);

      expect(result.has("user-2")).toBe(true);
      expect(result.has("user-3")).toBe(true);
    });
  });

  describe("getFollowersCount", () => {
    it("should return followers count", async () => {
      mockPrisma.userFollow.count.mockResolvedValue(100);

      const result = await service.getFollowersCount("user-1");

      expect(result).toBe(100);
    });
  });

  describe("getFollowingCount", () => {
    it("should return following count", async () => {
      mockPrisma.userFollow.count.mockResolvedValue(50);

      const result = await service.getFollowingCount("user-1");

      expect(result).toBe(50);
    });
  });

  describe("getFollowers", () => {
    it("should return empty list when no followers", async () => {
      mockPrisma.userFollow.count.mockResolvedValue(0);
      mockPrisma.userFollow.findMany.mockResolvedValue([]);

      const result = await service.getFollowers("user-1");

      expect(result.list).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return paginated followers", async () => {
      mockPrisma.userFollow.count.mockResolvedValue(1);
      mockPrisma.userFollow.findMany.mockResolvedValue([
        { followerId: "user-2" },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
      ]);

      const result = await service.getFollowers("user-1");

      expect(result.list).toHaveLength(1);
    });
  });

  describe("getFollowing", () => {
    it("should return empty list when not following anyone", async () => {
      mockPrisma.userFollow.count.mockResolvedValue(0);
      mockPrisma.userFollow.findMany.mockResolvedValue([]);

      const result = await service.getFollowing("user-1");

      expect(result.list).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
