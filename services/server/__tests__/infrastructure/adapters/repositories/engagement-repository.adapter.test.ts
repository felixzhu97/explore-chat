import { describe, it, expect, beforeEach, vi } from "vitest";
import { EngagementRepositoryImpl } from "@/post/infra/engagement-repository.adapter";
import { CassandraEngagementRepository } from "@/core/database/cassandra-engagement.repository";

describe("EngagementRepositoryImpl", () => {
  let adapter: EngagementRepositoryImpl;
  let mockImpl: ReturnType<typeof vi.mocked<CassandraEngagementRepository>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockImpl = {
      like: vi.fn().mockResolvedValue(true),
      unlike: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(true),
      unsave: vi.fn().mockResolvedValue(true),
      isLiked: vi.fn().mockResolvedValue(false),
      isSaved: vi.fn().mockResolvedValue(false),
      getEngagementCounts: vi
        .fn()
        .mockResolvedValue({ likeCount: 0, commentCount: 0, saveCount: 0 }),
      getEngagementCountsBatch: vi.fn().mockResolvedValue(new Map()),
      incrementCommentCount: vi.fn().mockResolvedValue(undefined),
      decrementCommentCount: vi.fn().mockResolvedValue(undefined),
    } as never;
    adapter = new EngagementRepositoryImpl(mockImpl);
  });

  describe("like", () => {
    it("should delegate to implementation", async () => {
      const result = await adapter.like("user-1", "post-1");

      expect(mockImpl.like).toHaveBeenCalledWith("user-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("unlike", () => {
    it("should delegate to implementation", async () => {
      const result = await adapter.unlike("user-1", "post-1");

      expect(mockImpl.unlike).toHaveBeenCalledWith("user-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("save", () => {
    it("should delegate to implementation", async () => {
      const result = await adapter.save("user-1", "post-1");

      expect(mockImpl.save).toHaveBeenCalledWith("user-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("unsave", () => {
    it("should delegate to implementation", async () => {
      const result = await adapter.unsave("user-1", "post-1");

      expect(mockImpl.unsave).toHaveBeenCalledWith("user-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("isLiked", () => {
    it("should delegate to implementation", async () => {
      mockImpl.isLiked.mockResolvedValue(true);

      const result = await adapter.isLiked("user-1", "post-1");

      expect(mockImpl.isLiked).toHaveBeenCalledWith("user-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("isSaved", () => {
    it("should delegate to implementation", async () => {
      mockImpl.isSaved.mockResolvedValue(true);

      const result = await adapter.isSaved("user-1", "post-1");

      expect(mockImpl.isSaved).toHaveBeenCalledWith("user-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("getEngagementCounts", () => {
    it("should delegate to implementation", async () => {
      const counts = { likeCount: 10, commentCount: 5, saveCount: 2 };
      mockImpl.getEngagementCounts.mockResolvedValue(counts);

      const result = await adapter.getEngagementCounts("post-1");

      expect(mockImpl.getEngagementCounts).toHaveBeenCalledWith("post-1");
      expect(result).toEqual(counts);
    });
  });

  describe("getEngagementCountsBatch", () => {
    it("should delegate to implementation", async () => {
      const batchResult = new Map([
        ["post-1", { likeCount: 10, commentCount: 5, saveCount: 2 }],
      ]);
      mockImpl.getEngagementCountsBatch.mockResolvedValue(batchResult);

      const result = await adapter.getEngagementCountsBatch([
        "post-1",
        "post-2",
      ]);

      expect(mockImpl.getEngagementCountsBatch).toHaveBeenCalledWith([
        "post-1",
        "post-2",
      ]);
      expect(result).toEqual(batchResult);
    });
  });

  describe("incrementCommentCount", () => {
    it("should delegate to implementation", async () => {
      await adapter.incrementCommentCount("post-1");

      expect(mockImpl.incrementCommentCount).toHaveBeenCalledWith("post-1");
    });
  });

  describe("decrementCommentCount", () => {
    it("should delegate to implementation", async () => {
      await adapter.decrementCommentCount("post-1");

      expect(mockImpl.decrementCommentCount).toHaveBeenCalledWith("post-1");
    });
  });
});
