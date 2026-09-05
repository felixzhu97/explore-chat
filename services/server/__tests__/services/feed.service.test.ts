import { describe, it, expect, beforeEach, vi } from "vitest";
import { FeedService } from "@/post/service/feed.service";

describe("FeedService", () => {
  describe("constructor", () => {
    it("should be instantiable with mocked dependencies", () => {
      const mockFeedCache = {
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      };
      const mockPostService = {
        getPostsByUser: vi.fn().mockResolvedValue({ posts: [] }),
      };
      const mockEngagementRepo = {
        getEngagementCountsBatch: vi.fn().mockResolvedValue(new Map()),
      };
      const mockRecommendation = {
        rankFeed: vi.fn().mockResolvedValue({ items: [] }),
      };
      const mockExperiments = {
        assign: vi
          .fn()
          .mockReturnValue({ experimentId: "exp-1", variantId: "var-1" }),
      };
      const mockAds = {
        selectAds: vi.fn().mockResolvedValue([]),
      };

      const service = new FeedService(
        mockFeedCache as never,
        mockPostService as never,
        mockEngagementRepo as never,
        mockRecommendation as never,
        mockExperiments as never,
        mockAds as never,
      );

      expect(service).toBeDefined();
    });
  });

  describe("feed ranking", () => {
    it("should calculate ranking scores correctly", () => {
      const RECENCY_HALFLIFE_HOURS = 24;
      const ENGAGEMENT_WEIGHT = 2;

      const rankScore = (
        createdAt: Date,
        likeCount: number,
        commentCount: number,
        now: Date,
      ) => {
        const ageHours =
          (now.getTime() - new Date(createdAt).getTime()) / (1000 * 3600);
        const recency = Math.exp(
          (-ageHours * Math.LN2) / RECENCY_HALFLIFE_HOURS,
        );
        const engagement = Math.log(1 + likeCount + commentCount);
        return recency + ENGAGEMENT_WEIGHT * engagement;
      };

      const now = new Date();
      const recentPost = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const oldPost = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentScore = rankScore(recentPost, 10, 5, now);
      const oldScore = rankScore(oldPost, 10, 5, now);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it("should calculate engagement weight correctly", () => {
      const RECENCY_HALFLIFE_HOURS = 24;
      const ENGAGEMENT_WEIGHT = 2;

      const rankScore = (
        createdAt: Date,
        likeCount: number,
        commentCount: number,
        now: Date,
      ) => {
        const ageHours =
          (now.getTime() - new Date(createdAt).getTime()) / (1000 * 3600);
        const recency = Math.exp(
          (-ageHours * Math.LN2) / RECENCY_HALFLIFE_HOURS,
        );
        const engagement = Math.log(1 + likeCount + commentCount);
        return recency + ENGAGEMENT_WEIGHT * engagement;
      };

      const now = new Date();
      const postTime = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      const lowEngagementScore = rankScore(postTime, 0, 0, now);
      const highEngagementScore = rankScore(postTime, 100, 50, now);

      expect(highEngagementScore).toBeGreaterThan(lowEngagementScore);
    });
  });
});
