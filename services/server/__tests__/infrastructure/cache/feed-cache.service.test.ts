import { describe, it, expect, beforeEach, vi } from "vitest";
import { FeedCacheService } from "@/core/cache/feed-cache.service";
import { CacheService } from "@/core/cache/cache.service";
import { CassandraFeedRepository } from "@/core/database/cassandra-feed.repository";

describe("FeedCacheService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create service with cache and feed repository", () => {
      const mockCacheService = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);
      expect(service).toBeDefined();
    });
  });

  describe("getFeedPage", () => {
    it("should return cached feed when available and no pageState", async () => {
      const cachedFeed = {
        entries: [
          { postId: "post-1", authorId: "author-1", createdAt: new Date() },
          { postId: "post-2", authorId: "author-2", createdAt: new Date() },
        ],
        pageState: undefined,
      };
      const mockCacheService = {
        get: vi.fn().mockResolvedValue(cachedFeed),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);

      const result = await service.getFeedPage("user-1", 10);

      expect(result.entries).toHaveLength(2);
      expect(mockCacheService.get).toHaveBeenCalledWith("feed:user-1");
    });

    it("should fetch from repository when no cache and set cache", async () => {
      const mockCacheService = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn().mockResolvedValue({
          entries: [
            {
              post_id: "post-1",
              author_id: "author-1",
              created_at: new Date(),
            },
          ],
        }),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);

      const result = await service.getFeedPage("user-1", 10);

      expect(result.entries).toHaveLength(1);
      expect(mockFeedRepo.getFeedPage).toHaveBeenCalledWith(
        "user-1",
        10,
        undefined,
      );
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it("should skip cache when pageState is provided", async () => {
      const mockCacheService = {
        get: vi.fn(),
        set: vi.fn(),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);

      await service.getFeedPage("user-1", 10, "page-state");

      expect(mockCacheService.get).not.toHaveBeenCalled();
    });

    it("should return empty entries when repository returns empty", async () => {
      const mockCacheService = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn(),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn().mockResolvedValue({ entries: [] }),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);

      const result = await service.getFeedPage("user-1", 10);

      expect(result.entries).toEqual([]);
    });

    it("should include pageState in result", async () => {
      const mockCacheService = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn(),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn().mockResolvedValue({
          entries: [
            {
              post_id: "post-1",
              author_id: "author-1",
              created_at: new Date(),
            },
          ],
          pageState: "next-page",
        }),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);

      const result = await service.getFeedPage("user-1", 10);

      expect(result.pageState).toBe("next-page");
    });
  });

  describe("invalidateFeed", () => {
    it("should delete feed cache key", async () => {
      const mockCacheService = {
        del: vi.fn().mockResolvedValue(undefined),
      } as never;
      const mockFeedRepo = {
        getFeedPage: vi.fn(),
      } as never;
      const service = new FeedCacheService(mockCacheService, mockFeedRepo);

      await service.invalidateFeed("user-1");

      expect(mockCacheService.del).toHaveBeenCalledWith("feed:user-1");
    });
  });
});
