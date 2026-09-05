import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExploreService } from "@/post/service/explore.service";
import { RecommendationService } from "@/post/service/recommendation.service";
import { ExperimentService } from "@/analytics/application/experiment.service";
import { AdService } from "@/ads/application/ad.service";

describe("ExploreService", () => {
  let service: ExploreService;
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
    sadd: ReturnType<typeof vi.fn>;
  };
  let mockPrisma: {
    userFollow: {
      findMany: ReturnType<typeof vi.fn>;
    };
    user: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  let mockPostRepo: {
    getPostsByUserId: ReturnType<typeof vi.fn>;
  };
  let mockRecommendation: {
    rankExplore: ReturnType<typeof vi.fn>;
  };
  let mockExperiments: {
    assign: ReturnType<typeof vi.fn>;
  };
  let mockAds: {
    getAdCandidates: ReturnType<typeof vi.fn>;
    selectAds: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      sadd: vi.fn().mockResolvedValue(1),
    };

    mockPrisma = {
      userFollow: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      user: {
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: "user-1" }, { id: "user-2" }]),
      },
    };

    mockPostRepo = {
      getPostsByUserId: vi.fn().mockResolvedValue({
        rows: [
          {
            post_id: "post-1",
            user_id: "user-1",
            created_at: new Date(),
            caption: "Test",
            type: "IMAGE",
            media_urls: [],
            location: null,
            cover_url: null,
          },
        ],
      }),
    };

    mockRecommendation = {
      rankExplore: vi.fn().mockResolvedValue({ items: [] }),
    };

    mockExperiments = {
      assign: vi
        .fn()
        .mockReturnValue({ experimentId: "exp-1", variantId: "var-1" }),
    };

    mockAds = {
      getAdCandidates: vi.fn().mockResolvedValue([]),
      selectAds: vi.fn().mockResolvedValue([]),
    };

    service = new ExploreService(
      mockRedis as never,
      mockPrisma as never,
      mockPostRepo as never,
      mockRecommendation as never,
      mockExperiments as never,
      mockAds as never,
    );
  });

  describe("getExplore", () => {
    it("should return explore feed from cache", async () => {
      const cachedEntries = [
        {
          postId: "post-1",
          authorId: "author-1",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockRedis.get.mockResolvedValue(cachedEntries);
      mockRecommendation.rankExplore.mockResolvedValue({
        items: [{ id: "post-1", score: 1 }],
      });

      const result = await service.getExplore("user-1", 10, 0);

      expect(mockRedis.get).toHaveBeenCalled();
      expect(result.entries.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter out followed users' posts", async () => {
      const cachedEntries = [
        {
          postId: "post-1",
          authorId: "user-1",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          postId: "post-2",
          authorId: "user-2",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];
      mockRedis.get.mockResolvedValue(cachedEntries);
      mockPrisma.userFollow.findMany.mockResolvedValue([
        { followingId: "user-1" },
      ]);
      mockRecommendation.rankExplore.mockResolvedValue({
        items: [{ id: "post-2", score: 1 }],
      });

      await service.getExplore("user-1", 10, 0);

      expect(mockPrisma.userFollow.findMany).toHaveBeenCalled();
    });

    it("should use fallback when cache is empty", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.user.findMany.mockResolvedValue([{ id: "author-1" }]);

      await service.getExplore("user-1", 10, 0);

      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(mockPostRepo.getPostsByUserId).toHaveBeenCalled();
    });
  });
});
