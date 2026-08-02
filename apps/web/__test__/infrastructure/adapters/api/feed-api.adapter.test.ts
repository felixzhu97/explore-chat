import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedApi } from "@/feed/feed.api";
import type { ApiClient } from "@/core/api-client";
import type { ApiResponse } from "@/core/api-response.model";

describe("FeedApi", () => {
  let adapter: FeedApi;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
      postStream: vi.fn(),
      setToken: vi.fn(),
      getToken: vi.fn(),
    } as unknown as ApiClient;
    adapter = new FeedApi(mockApiClient);
  });

  describe("uploadMedia", () => {
    it("should upload media file with posts folder", async () => {
      const mockResponse = {
        data: {
          url: "http://example.com/file.jpg",
          mimeType: "image/jpeg",
          size: 1024,
        },
      };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const result = await adapter.uploadMedia(mockFile, "posts");

      expect(mockApiClient.upload).toHaveBeenCalled();
      expect(result).toHaveProperty("url");
    });

    it("should upload media file with covers folder", async () => {
      const mockResponse = {
        data: {
          url: "http://example.com/cover.jpg",
          mimeType: "image/jpeg",
          size: 2048,
        },
      };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["content"], "cover.jpg", {
        type: "image/jpeg",
      });
      await adapter.uploadMedia(mockFile, "covers");

      expect(mockApiClient.upload).toHaveBeenCalled();
    });
  });

  describe("getFeedGraphql", () => {
    it("should fetch feed using GraphQL", async () => {
      const mockResponse = {
        data: {
          feed: {
            pageState: "cursor123",
            entries: [
              {
                postId: "1",
                authorId: "user1",
                post: { postId: "1", caption: "Hello" },
              },
            ],
          },
        },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFeedGraphql(20);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/graphql",
        expect.objectContaining({
          query: expect.stringContaining("query Feed"),
          variables: { limit: 20 },
        }),
      );
      expect(result.entries).toHaveLength(1);
      expect(result.pageState).toBe("cursor123");
    });

    it("should handle GraphQL errors", async () => {
      const mockResponse = {
        errors: [{ message: "GraphQL Error" }],
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await expect(adapter.getFeedGraphql(20)).rejects.toThrow("GraphQL Error");
    });

    it("should return empty entries on malformed response", async () => {
      const mockResponse = { data: {} };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFeedGraphql(20);

      expect(result.entries).toEqual([]);
      expect(result.pageState).toBeUndefined();
    });

    it("should include pageState in variables when provided", async () => {
      const mockResponse = { data: { feed: { pageState: null, entries: [] } } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getFeedGraphql(20, "cursor123");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/graphql",
        expect.objectContaining({
          variables: { limit: 20, pageState: "cursor123" },
        }),
      );
    });
  });

  describe("getFeed", () => {
    it("should fetch feed with pagination", async () => {
      const mockResponse = {
        entries: [{ postId: "1" }, { postId: "2" }],
        pageState: "next-page",
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFeed(24);

      expect(mockApiClient.get).toHaveBeenCalledWith("/posts/feed?limit=24");
      expect(result.entries).toBeDefined();
    });

    it("should handle missing entries", async () => {
      const mockResponse = {};
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFeed(20);

      expect(result.entries).toEqual([]);
    });

    it("should include pageState param when provided", async () => {
      const mockResponse = { entries: [], pageState: "cursor" };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getFeed(20, "cursor");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/posts/feed?limit=20&pageState=cursor",
      );
    });
  });

  describe("getExplore", () => {
    it("should fetch explore with default params", async () => {
      const mockResponse = { entries: [{ postId: "1" }], total: 100 };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getExplore();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/posts/explore?limit=20&offset=0",
      );
      expect(result.total).toBeDefined();
    });

    it("should fetch explore with custom params", async () => {
      const mockResponse = { entries: [], total: 50 };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getExplore(10, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/posts/explore?limit=10&offset=20",
      );
    });

    it("should return total as 0 when missing", async () => {
      const mockResponse = {};
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getExplore();

      expect(result.total).toBe(0);
    });
  });

  describe("getPost", () => {
    it("should fetch single post by id", async () => {
      const mockResponse = { data: { postId: "123", caption: "Test post" } };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getPost("123");

      expect(mockApiClient.get).toHaveBeenCalledWith("/posts/123");
      expect(result).toHaveProperty("postId", "123");
    });
  });

  describe("getPostsByUser", () => {
    it("should fetch user posts with pagination", async () => {
      const mockResponse = { posts: [{ postId: "1" }], pageState: "next" };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getPostsByUser("user123", 24);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/posts/user/user123?limit=24",
      );
      expect(result.posts).toHaveLength(1);
    });

    it("should return empty array for non-array response", async () => {
      const mockResponse = {};
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getPostsByUser("user123");

      expect(result.posts).toEqual([]);
    });
  });

  describe("likePost", () => {
    it("should call post to like a post", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.likePost("post123");

      expect(mockApiClient.post).toHaveBeenCalledWith("/posts/post123/like");
    });
  });

  describe("unlikePost", () => {
    it("should call delete to unlike a post", async () => {
      (mockApiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.unlikePost("post123");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/posts/post123/like");
    });
  });

  describe("savePost", () => {
    it("should call post to save a post", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.savePost("post123");

      expect(mockApiClient.post).toHaveBeenCalledWith("/posts/post123/save");
    });
  });

  describe("unsavePost", () => {
    it("should call delete to unsave a post", async () => {
      (mockApiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.unsavePost("post123");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/posts/post123/save");
    });
  });

  describe("createPost", () => {
    it("should create post with caption and type", async () => {
      const mockResponse = {
        data: { postId: "new-post", userId: "user1", createdAt: "2024-01-01" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.createPost("Hello world", "TEXT");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          caption: "Hello world",
          type: "TEXT",
        }),
      );
      expect(result).toHaveProperty("postId", "new-post");
    });

    it("should include mediaUrls when provided", async () => {
      const mockResponse = { data: { postId: "new-post" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.createPost("Photo post", "IMAGE", [
        "http://example.com/photo.jpg",
      ]);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          mediaUrls: ["http://example.com/photo.jpg"],
        }),
      );
    });

    it("should not include empty mediaUrls", async () => {
      const mockResponse = { data: { postId: "new-post" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.createPost("Text post", "TEXT", []);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/posts",
        expect.not.objectContaining({
          mediaUrls: expect.anything(),
        }),
      );
    });

    it("should include coverUrl when provided", async () => {
      const mockResponse = { data: { postId: "new-post" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.createPost(
        "Video post",
        "VIDEO",
        ["http://video.mp4"],
        "http://cover.jpg",
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          coverUrl: "http://cover.jpg",
        }),
      );
    });
  });

  describe("getComments", () => {
    it("should fetch comments for a post", async () => {
      const mockResponse = { data: [{ id: "1", content: "Great post!" }] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getComments("post123", 1, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/posts/post123/comments?page=1&limit=20",
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array for non-array response", async () => {
      const mockResponse = { data: "invalid" };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getComments("post123", 1, 20);

      expect(result).toEqual([]);
    });
  });

  describe("addComment", () => {
    it("should add a comment to a post", async () => {
      const mockResponse = { data: { id: "comment123" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.addComment("post123", "Nice post!");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/posts/post123/comments",
        { content: "Nice post!" },
      );
      expect(result).toHaveProperty("id", "comment123");
    });

    it("should include parentId for replies", async () => {
      const mockResponse = { data: { id: "reply123" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.addComment("post123", "Reply content", "parent-comment-id");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/posts/post123/comments",
        {
          content: "Reply content",
          parentId: "parent-comment-id",
        },
      );
    });
  });

  describe("followUser", () => {
    it("should call post to follow a user", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.followUser("user123");

      expect(mockApiClient.post).toHaveBeenCalledWith("/users/user123/follow");
    });
  });

  describe("unfollowUser", () => {
    it("should call delete to unfollow a user", async () => {
      (mockApiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.unfollowUser("user123");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/users/user123/follow",
      );
    });
  });

  describe("checkFollowingUsers", () => {
    it("should check following status for multiple users", async () => {
      const mockResponse = {
        data: { data: [{ userId: "1", isFollowing: true }] },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.checkFollowingUsers(["1", "2"]);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/users/following/check",
        { userIds: ["1", "2"] },
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("search", () => {
    it("should search for users", async () => {
      const mockResponse = { data: { hits: [{ id: "1" }], total: 10 } };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.search("test", "users", 20);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/search?q=test&type=users&limit=20",
      );
      expect(result.hits).toHaveLength(1);
      expect(result.total).toBe(10);
    });

    it("should include cursor for pagination", async () => {
      const mockResponse = { data: { hits: [], nextCursor: "cursor123" } };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.search("test", "posts", 20, "cursor123");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/search?q=test&type=posts&limit=20&cursor=cursor123",
      );
      expect(result.nextCursor).toBe("cursor123");
    });

    it("should return empty hits for invalid response", async () => {
      const mockResponse = { data: {} };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.search("test", "users", 20);

      expect(result.hits).toEqual([]);
    });
  });

  describe("getSuggestions", () => {
    it("should fetch user suggestions", async () => {
      const mockResponse = { data: [{ id: "1", username: "user1" }] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getSuggestions(10);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/suggestions?limit=10",
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array for invalid response", async () => {
      const mockResponse = { data: "invalid" };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getSuggestions();

      expect(result).toEqual([]);
    });
  });

  describe("getFollowers", () => {
    it("should fetch followers with pagination", async () => {
      const mockResponse = {
        data: [{ id: "1", username: "user1" }],
        total: 100,
        pageState: "next",
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFollowers("user123", 20);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/user123/followers?limit=20",
      );
      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(100);
    });

    it("should return empty list for invalid response", async () => {
      const mockResponse = { data: null };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFollowers("user123");

      expect(result.list).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getFollowing", () => {
    it("should fetch following with pagination", async () => {
      const mockResponse = {
        data: [{ id: "2", username: "user2" }],
        total: 50,
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getFollowing("user123", 20);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/user123/following?limit=20",
      );
      expect(result.list).toHaveLength(1);
    });
  });

  describe("getNotifications", () => {
    it("should fetch notifications", async () => {
      const mockResponse = { data: { items: [{ id: "1", type: "like" }] } };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getNotifications(20);

      expect(mockApiClient.get).toHaveBeenCalledWith("/notifications?limit=20");
      expect(result.items).toHaveLength(1);
    });

    it("should include cursor for pagination", async () => {
      const mockResponse = { data: { items: [], nextCursor: "cursor123" } };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getNotifications(20, "cursor123");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/notifications?limit=20&cursor=cursor123",
      );
      expect(result.nextCursor).toBe("cursor123");
    });

    it("should not include empty cursor", async () => {
      const mockResponse = { data: { items: [], nextCursor: "" } };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getNotifications(20, "");

      expect(result).not.toHaveProperty("nextCursor");
    });
  });

  describe("markNotificationRead", () => {
    it("should mark notification as read", async () => {
      (mockApiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.markNotificationRead("notif123");

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/notifications/notif123/read",
        {},
      );
    });
  });

  describe("markNotificationsRead", () => {
    it("should mark multiple notifications as read", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.markNotificationsRead(["1", "2", "3"]);

      expect(mockApiClient.post).toHaveBeenCalledWith("/notifications/read", {
        ids: ["1", "2", "3"],
      });
    });
  });

  describe("markAllNotificationsRead", () => {
    it("should mark all notifications as read", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
      });

      await adapter.markAllNotificationsRead();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/notifications/read-all",
        {},
      );
    });
  });

  describe("getProfileStats", () => {
    it("should fetch profile statistics", async () => {
      const mockResponse = {
        data: { followersCount: 100, followingCount: 50 },
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getProfileStats("user123");

      expect(mockApiClient.get).toHaveBeenCalledWith("/users/user123");
      expect(result.followersCount).toBe(100);
      expect(result.followingCount).toBe(50);
    });

    it("should return zero counts for missing data", async () => {
      const mockResponse = { data: {} };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getProfileStats("user123");

      expect(result.followersCount).toBe(0);
      expect(result.followingCount).toBe(0);
    });
  });
});
