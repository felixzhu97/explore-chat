import { describe, it, expect, beforeEach, vi } from "vitest";
import { FeedSeenService } from "@/post/service/feed-seen.service";
import {
  USER_DOMAIN,
  BOUNDARY,
} from "@whatschat/shared-types/test-utils/domain-values";

// =============================================================================
// MOCK FACTORIES
// =============================================================================

/**
 * Creates a mock Redis client with default implementations
 */
const createMockRedis = (overrides = {}) => ({
  sadd: vi.fn().mockResolvedValue(1),
  lpush: vi.fn().mockResolvedValue(1),
  ltrim: vi.fn().mockResolvedValue("OK"),
  lrange: vi.fn().mockResolvedValue([]),
  smembers: vi.fn().mockResolvedValue([]),
  expire: vi.fn().mockResolvedValue(1),
  del: vi.fn().mockResolvedValue(1),
  ...overrides,
});

// =============================================================================
// TEST DATA - Using domain values
// =============================================================================

const TEST_USER_ID = USER_DOMAIN.VALID.id;
const TEST_POST_ID = "post_test_123";

describe("FeedSeenService", () => {
  let service: FeedSeenService;

  describe("markSeen", () => {
    it.each([
      {
        label: "empty userId",
        userId: BOUNDARY.EMPTY_STRING,
        postId: TEST_POST_ID,
      },
      {
        label: "null userId",
        userId: BOUNDARY.NULL as unknown as string,
        postId: TEST_POST_ID,
      },
      {
        label: "undefined userId",
        userId: BOUNDARY.UNDEFINED as unknown as string,
        postId: TEST_POST_ID,
      },
    ])("should return early for $label", async ({ userId, postId }) => {
      const mockRedis = createMockRedis();
      service = new FeedSeenService(mockRedis);

      await service.markSeen(userId, postId);

      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it.each([
      {
        label: "empty postId",
        userId: TEST_USER_ID,
        postId: BOUNDARY.EMPTY_STRING,
      },
      {
        label: "null postId",
        userId: TEST_USER_ID,
        postId: BOUNDARY.NULL as unknown as string,
      },
      {
        label: "undefined postId",
        userId: TEST_USER_ID,
        postId: BOUNDARY.UNDEFINED as unknown as string,
      },
    ])("should return early for $label", async ({ userId, postId }) => {
      const mockRedis = createMockRedis();
      service = new FeedSeenService(mockRedis);

      await service.markSeen(userId, postId);

      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it("should add post to seen set", async () => {
      const mockRedis = createMockRedis();
      service = new FeedSeenService(mockRedis);

      await service.markSeen(TEST_USER_ID, TEST_POST_ID);

      expect(mockRedis.sadd).toHaveBeenCalledWith(
        `feed:seen:set:${TEST_USER_ID}`,
        TEST_POST_ID,
      );
    });

    it("should add to list when post is newly seen", async () => {
      const mockRedis = createMockRedis({ sadd: vi.fn().mockResolvedValue(1) });
      service = new FeedSeenService(mockRedis);

      await service.markSeen(TEST_USER_ID, TEST_POST_ID);

      expect(mockRedis.lpush).toHaveBeenCalledWith(
        `feed:seen:list:${TEST_USER_ID}`,
        TEST_POST_ID,
      );
      expect(mockRedis.ltrim).toHaveBeenCalled();
    });

    it("should not add to list when post was already seen", async () => {
      const mockRedis = createMockRedis({ sadd: vi.fn().mockResolvedValue(0) });
      service = new FeedSeenService(mockRedis);

      await service.markSeen(TEST_USER_ID, TEST_POST_ID);

      expect(mockRedis.lpush).not.toHaveBeenCalled();
    });

    it("should set TTL on both keys", async () => {
      const mockRedis = createMockRedis({ sadd: vi.fn().mockResolvedValue(1) });
      service = new FeedSeenService(mockRedis);

      await service.markSeen(TEST_USER_ID, TEST_POST_ID);

      expect(mockRedis.expire).toHaveBeenCalledTimes(2);
    });
  });

  describe("getRecentSeenIds", () => {
    it("should return empty array for empty userId", async () => {
      const mockRedis = createMockRedis();
      service = new FeedSeenService(mockRedis);

      const result = await service.getRecentSeenIds(BOUNDARY.EMPTY_STRING);

      expect(result).toEqual([]);
      expect(mockRedis.lrange).not.toHaveBeenCalled();
    });

    it("should return empty array for null userId", async () => {
      const mockRedis = createMockRedis();
      service = new FeedSeenService(mockRedis);

      const result = await service.getRecentSeenIds(
        BOUNDARY.NULL as unknown as string,
      );

      expect(result).toEqual([]);
    });

    it("should return seen post IDs", async () => {
      const seenPosts = ["post-1", "post-2", "post-3"];
      const mockRedis = createMockRedis({
        lrange: vi.fn().mockResolvedValue(seenPosts),
      });
      service = new FeedSeenService(mockRedis);

      const result = await service.getRecentSeenIds(TEST_USER_ID);

      expect(result).toEqual(seenPosts);
    });

    it.each([
      { limit: 1, expectedEnd: 0 },
      { limit: 10, expectedEnd: 9 },
      { limit: 100, expectedEnd: 99 },
    ])(
      "should respect limit parameter (limit: $limit)",
      async ({ limit, expectedEnd }) => {
        const mockRedis = createMockRedis({
          lrange: vi.fn().mockResolvedValue([]),
        });
        service = new FeedSeenService(mockRedis);

        await service.getRecentSeenIds(TEST_USER_ID, limit);

        expect(mockRedis.lrange).toHaveBeenCalledWith(
          `feed:seen:list:${TEST_USER_ID}`,
          0,
          expectedEnd,
        );
      },
    );

    it("should filter out falsy values", async () => {
      const mockRedis = createMockRedis({
        lrange: vi
          .fn()
          .mockResolvedValue([
            "post-1",
            null,
            BOUNDARY.EMPTY_STRING,
            "post-2",
            BOUNDARY.UNDEFINED,
          ]),
      });
      service = new FeedSeenService(mockRedis);

      const result = await service.getRecentSeenIds(TEST_USER_ID);

      expect(result).toEqual(["post-1", "post-2"]);
    });

    it.each([
      { label: "returns null", mockValue: null },
      { label: "returns undefined", mockValue: undefined },
    ])(
      "should return empty array when lrange $label",
      async ({ mockValue }) => {
        const mockRedis = createMockRedis({
          lrange: vi.fn().mockResolvedValue(mockValue),
        });
        service = new FeedSeenService(mockRedis);

        const result = await service.getRecentSeenIds(TEST_USER_ID);

        expect(result).toEqual([]);
      },
    );

    it("should use default limit of 200", async () => {
      const mockRedis = createMockRedis({
        lrange: vi.fn().mockResolvedValue([]),
      });
      service = new FeedSeenService(mockRedis);

      await service.getRecentSeenIds(TEST_USER_ID);

      expect(mockRedis.lrange).toHaveBeenCalledWith(
        `feed:seen:list:${TEST_USER_ID}`,
        0,
        199,
      );
    });

    it("should clamp negative limit to valid range", async () => {
      const mockRedis = createMockRedis({
        lrange: vi.fn().mockResolvedValue([]),
      });
      service = new FeedSeenService(mockRedis);

      await service.getRecentSeenIds(TEST_USER_ID, BOUNDARY.NEGATIVE);

      // Math.max(0, -1 - 1) = Math.max(0, -2) = 0, so end is 0
      expect(mockRedis.lrange).toHaveBeenCalledWith(
        `feed:seen:list:${TEST_USER_ID}`,
        0,
        0,
      );
    });
  });

  describe("isSeen", () => {
    it.each([
      {
        label: "empty userId",
        userId: BOUNDARY.EMPTY_STRING,
        postId: TEST_POST_ID,
      },
      {
        label: "empty postId",
        userId: TEST_USER_ID,
        postId: BOUNDARY.EMPTY_STRING,
      },
    ])("should return false for $label", async ({ userId, postId }) => {
      const mockRedis = createMockRedis();
      service = new FeedSeenService(mockRedis);

      const result = await service.isSeen(userId, postId);

      expect(result).toBe(false);
    });

    it("should return true when post is seen", async () => {
      const mockRedis = createMockRedis({
        smembers: vi.fn().mockResolvedValue(["post-1", "post-2"]),
      });
      service = new FeedSeenService(mockRedis);

      const result = await service.isSeen(TEST_USER_ID, "post-1");

      expect(result).toBe(true);
    });

    it("should return false when post is not seen", async () => {
      const mockRedis = createMockRedis({
        smembers: vi.fn().mockResolvedValue(["post-1", "post-2"]),
      });
      service = new FeedSeenService(mockRedis);

      const result = await service.isSeen(TEST_USER_ID, "post-3");

      expect(result).toBe(false);
    });
  });

  describe("filterUnseen", () => {
    describe("boundary conditions", () => {
      it.each([
        {
          label: "empty userId",
          userId: BOUNDARY.EMPTY_STRING,
          postIds: ["post-1", "post-2"],
        },
        {
          label: "null userId",
          userId: BOUNDARY.NULL as unknown as string,
          postIds: ["post-1"],
        },
      ])(
        "should return input unchanged for $label",
        async ({ userId, postIds }) => {
          const mockRedis = createMockRedis();
          service = new FeedSeenService(mockRedis);

          const result = await service.filterUnseen(userId, postIds);

          expect(result).toEqual(postIds);
        },
      );

      it.each([
        { label: "empty array", postIds: [] },
        { label: "null", postIds: null },
        { label: "undefined", postIds: undefined },
      ])(
        "should return empty array for $label postIds",
        async ({ postIds }) => {
          const mockRedis = createMockRedis();
          service = new FeedSeenService(mockRedis);

          const result = await service.filterUnseen(
            TEST_USER_ID,
            postIds as any,
          );

          expect(result).toEqual([]);
        },
      );
    });

    describe("filtering behavior", () => {
      it("should return all posts when none are seen", async () => {
        const mockRedis = createMockRedis({
          lrange: vi.fn().mockResolvedValue([]),
        });
        service = new FeedSeenService(mockRedis);

        const result = await service.filterUnseen(TEST_USER_ID, [
          "post-1",
          "post-2",
        ]);

        expect(result).toEqual(["post-1", "post-2"]);
      });

      it("should filter out seen posts", async () => {
        const mockRedis = createMockRedis({
          lrange: vi.fn().mockResolvedValue(["post-1", "post-3"]),
        });
        service = new FeedSeenService(mockRedis);

        const result = await service.filterUnseen(TEST_USER_ID, [
          "post-1",
          "post-2",
          "post-3",
        ]);

        expect(result).toEqual(["post-2"]);
      });

      it("should return empty array when all posts are seen", async () => {
        const mockRedis = createMockRedis({
          lrange: vi.fn().mockResolvedValue(["post-1", "post-2", "post-3"]),
        });
        service = new FeedSeenService(mockRedis);

        const result = await service.filterUnseen(TEST_USER_ID, [
          "post-1",
          "post-2",
        ]);

        expect(result).toEqual([]);
      });
    });
  });
});
