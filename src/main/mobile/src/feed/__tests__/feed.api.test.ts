import { FeedApi } from "../feed.api";
import type { HttpClient } from "@/core/api-client";

jest.mock("@/feed/feed.mapper", () => ({
  mapFeedPostResToFeedPost: jest.fn((data) => ({
    id: data.postId,
    userId: data.userId,
    username: data.username || "unknown",
    avatar: data.avatar || "",
    timestamp: data.createdAt,
    caption: data.caption || "",
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    imageUrl: data.mediaUrls?.[0] || "",
    isLiked: data.isLiked || false,
    isSaved: data.isSaved || false,
    type: data.type || "IMAGE",
    mediaUrls: data.mediaUrls || [],
  })),
}));

describe("FeedApi", () => {
  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const adapter = new FeedApi(mockHttpClient as unknown as HttpClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFeed", () => {
    it("returns empty posts when no data", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getFeed(10);

      expect(result.posts).toEqual([]);
      expect(result.nextPageState).toBeUndefined();
    });

    it("returns posts from REST response", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          next_page_token: "cursor123",
          entries: [
            {
              postId: "post-1",
              post: {
                postId: "post-1",
                userId: "u1",
                createdAt: "2024-01-01",
              },
            },
          ],
        },
      });

      const result = await adapter.getFeed(10);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/posts/feed?page_size=10",
      );
      expect(result.posts).toHaveLength(1);
      expect(result.nextPageState).toBe("cursor123");
    });

    it("filters out null posts", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          entries: [
            {
              postId: "post-1",
              post: {
                postId: "post-1",
                userId: "u1",
                createdAt: "2024-01-01",
              },
            },
            { postId: "post-2", post: null },
          ],
        },
      });

      const result = await adapter.getFeed(10);

      expect(result.posts).toHaveLength(1);
    });

    it("returns empty posts when entries missing", async () => {
      mockHttpClient.get.mockResolvedValue({ data: { entries: undefined } });

      const result = await adapter.getFeed(10);

      expect(result.posts).toEqual([]);
      expect(result.nextPageState).toBeUndefined();
    });

    it("handles empty entries array", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { entries: [] },
      });

      const result = await adapter.getFeed(10);

      expect(result.posts).toEqual([]);
    });

    it("passes page_token when pageState provided", async () => {
      mockHttpClient.get.mockResolvedValue({ data: { entries: [] } });

      await adapter.getFeed(10, "token-abc");

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/posts/feed?page_size=10&page_token=token-abc",
      );
    });
  });

  describe("getReels", () => {
    it("returns reels from REST response", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          next_page_token: "reelCursor",
          entries: [
            {
              postId: "reel-1",
              post: {
                postId: "reel-1",
                userId: "u1",
                type: "VIDEO",
                createdAt: "2024-01-01",
              },
            },
          ],
        },
      });

      const result = await adapter.getReels(10);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/posts/reels?page_size=10",
      );
      expect(result.posts).toHaveLength(1);
      expect(result.nextPageState).toBe("reelCursor");
    });

    it("returns empty when no reels", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getReels(10);

      expect(result.posts).toEqual([]);
    });
  });

  describe("getSuggestions", () => {
    it("returns empty when no data", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getSuggestions(12);

      expect(result).toEqual([]);
    });

    it("returns suggestions with required fields", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          users: [
            {
              id: "u1",
              username: "user1",
              avatar: "avatar1.jpg",
              description: "desc",
            },
            { id: "u2", username: "user2", avatar: null, description: "desc2" },
          ],
        },
      });

      const result = await adapter.getSuggestions(12);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("u1");
      expect(result[0].avatar).toBe("avatar1.jpg");
      expect(result[1].avatar).toBe("");
    });

    it("filters out entries without id", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          users: [
            { id: "u1", username: "user1", avatar: "a.jpg" },
            { username: "no-id", avatar: "b.jpg" },
          ],
        },
      });

      const result = await adapter.getSuggestions(12);

      expect(result).toHaveLength(1);
    });
  });

  describe("getPostById", () => {
    it("returns null when post not found", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getPostById("post-1");

      expect(result).toBeNull();
    });

    it("returns null when postId is missing", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { caption: "No ID" },
      });

      const result = await adapter.getPostById("post-1");

      expect(result).toBeNull();
    });

    it("returns mapped post when found", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          postId: "post-1",
          userId: "u1",
          caption: "Test",
          createdAt: "2024-01-01",
        },
      });

      const result = await adapter.getPostById("post-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("post-1");
    });

    it("handles numeric createdAt", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          postId: "post-1",
          userId: "u1",
          createdAt: 1704067200,
        },
      });

      const result = await adapter.getPostById("post-1");

      expect(result).not.toBeNull();
    });

    it("returns null on error", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Network error"));

      const result = await adapter.getPostById("post-1");

      expect(result).toBeNull();
    });
  });

  describe("getExplore", () => {
    it("returns empty when no entries", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getExplore(20);

      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("filters out sponsored posts", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          entries: [
            { postId: "post-1", isSponsored: true },
            { postId: "post-2", isSponsored: false },
          ],
          total_size: 10,
        },
      });

      const result = await adapter.getExplore(20);

      expect(result.fetchedEntryCount).toBe(2);
    });
  });

  describe("searchPosts", () => {
    it("returns empty for blank query", async () => {
      const result = await adapter.searchPosts("   ", 10);

      expect(result.posts).toEqual([]);
    });

    it("returns empty when no hits", async () => {
      mockHttpClient.get.mockResolvedValue({ data: { hits: [] } });

      const result = await adapter.searchPosts("query", 10);

      expect(result.posts).toEqual([]);
    });
  });

  describe("getUserProfile", () => {
    it("returns null when profile not found", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getUserProfile("user-1");

      expect(result).toBeNull();
    });

    it("returns profile when found", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { id: "user-1", username: "testuser", bio: "Test bio" },
      });

      const result = await adapter.getUserProfile("user-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-1");
    });

    it("returns null on error", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Network error"));

      const result = await adapter.getUserProfile("user-1");

      expect(result).toBeNull();
    });
  });

  describe("getUserPosts", () => {
    it("returns empty when no posts", async () => {
      mockHttpClient.get.mockResolvedValue({ data: {} });

      const result = await adapter.getUserPosts("user-1", 10);

      expect(result.posts).toEqual([]);
    });

    it("returns user posts", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          posts: [
            { postId: "post-1", userId: "user-1", createdAt: "2024-01-01" },
          ],
          next_page_token: "userCursor",
        },
      });

      const result = await adapter.getUserPosts("user-1", 10);

      expect(result.posts).toHaveLength(1);
      expect(result.nextPageState).toBe("userCursor");
    });

    it("handles numeric pageState token", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          posts: [],
          next_page_token: "123",
        },
      });

      const result = await adapter.getUserPosts("user-1", 10);

      expect(result.nextPageState).toBe("123");
    });
  });
});
