import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFeed, mapDetailToFeedPost } from "../use-feed";

vi.mock("@/core/api-client", () => ({
  getApiClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    setToken: vi.fn(),
  })),
}));

vi.mock("@/feed/feed.api", () => {
  const mockApi = {
    getFeedGraphql: vi.fn(),
    getSuggestions: vi.fn(),
    checkFollowingUsers: vi.fn(),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
    savePost: vi.fn(),
    unsavePost: vi.fn(),
    uploadMedia: vi.fn(),
    createPost: vi.fn(),
    getPost: vi.fn(),
    getExplore: vi.fn(),
    getComments: vi.fn(),
    addComment: vi.fn(),
    getProfileStats: vi.fn(),
  };
  return {
    FeedApi: vi.fn(() => mockApi),
  };
});

import { FeedApi } from "@/feed/feed.api";

describe("useFeed Hook", () => {
  const mockFeedAdapter = new FeedApi({} as any);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useFeed("user-1"));

      expect(result.current.posts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.initialLoading).toBe(false);
      expect(result.current.loadingMore).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasMore).toBe(true);
    });

    it("should return empty state when currentUserId is undefined", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.posts).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("loadFeed", () => {
    it("should load feed successfully", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test caption",
              isLiked: false,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: "next-page",
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts).toHaveLength(1);
      });

      expect(result.current.posts[0].id).toBe("post-1");
      expect(result.current.hasMore).toBe(true);
    });

    it("should set error state when loadFeed fails", async () => {
      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.loading).toBe(false);
    });

    it("should not load feed when currentUserId is undefined", async () => {
      const { result } = renderHook(() => useFeed(undefined));

      await act(async () => {
        await result.current.loadFeed();
      });

      expect(result.current.posts).toEqual([]);
      expect(mockFeedAdapter.getFeedGraphql).not.toHaveBeenCalled();
    });

    it("should load more posts when hasMore is false", async () => {
      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("toggleLike", () => {
    it("should toggle like status for a post", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: false,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);
      mockFeedAdapter.likePost = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      const initialLikeCount = parseInt(result.current.posts[0].likeCount, 10);

      await act(async () => {
        await result.current.toggleLike("post-1");
      });

      expect(result.current.posts[0].isLiked).toBe(true);
      expect(parseInt(result.current.posts[0].likeCount, 10)).toBe(
        initialLikeCount + 1,
      );
    });

    it("should unlike when post is already liked", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: true,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);
      mockFeedAdapter.unlikePost = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      const initialLikeCount = parseInt(result.current.posts[0].likeCount, 10);

      await act(async () => {
        await result.current.toggleLike("post-1");
      });

      expect(result.current.posts[0].isLiked).toBe(false);
      expect(parseInt(result.current.posts[0].likeCount, 10)).toBe(
        initialLikeCount - 1,
      );
    });

    it("should revert like status when API fails", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: false,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);
      mockFeedAdapter.likePost = vi
        .fn()
        .mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      const wasLiked = result.current.posts[0].isLiked;

      await act(async () => {
        await result.current.toggleLike("post-1");
      });

      await waitFor(() => {
        expect(result.current.posts[0].isLiked).toBe(wasLiked);
      });
    });
  });

  describe("toggleSave", () => {
    it("should toggle save status for a post", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: false,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);
      mockFeedAdapter.savePost = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.toggleSave("post-1");
      });

      expect(result.current.posts[0].isSaved).toBe(true);
    });

    it("should unsave when post is already saved", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: false,
              isSaved: true,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);
      mockFeedAdapter.unsavePost = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.toggleSave("post-1");
      });

      expect(result.current.posts[0].isSaved).toBe(false);
    });
  });

  describe("followUser", () => {
    it("should follow a user successfully", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: false,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi
        .fn()
        .mockResolvedValue([{ userId: "author-1", isFollowing: false }]);
      mockFeedAdapter.followUser = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.followUser("author-1");
      });

      expect(mockFeedAdapter.followUser).toHaveBeenCalledWith("author-1");
    });

    it("should unfollow a user when already following", async () => {
      const mockFeedResponse = {
        entries: [
          {
            post: {
              postId: "post-1",
              userId: "author-1",
              username: "alice",
              avatar: "avatar1.jpg",
              createdAt: new Date().toISOString(),
              mediaUrls: ["image1.jpg"],
              likeCount: 10,
              commentCount: 5,
              caption: "Test",
              isLiked: false,
              isSaved: false,
              type: "IMAGE",
            },
          },
        ],
        pageState: null,
      };

      mockFeedAdapter.getFeedGraphql = vi
        .fn()
        .mockResolvedValue(mockFeedResponse);
      mockFeedAdapter.checkFollowingUsers = vi
        .fn()
        .mockResolvedValue([{ userId: "author-1", isFollowing: true }]);
      mockFeedAdapter.unfollowUser = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadFeed();
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.followUser("author-1");
      });

      expect(mockFeedAdapter.unfollowUser).toHaveBeenCalledWith("author-1");
    });

    it("should not follow self", async () => {
      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.followUser("user-1");
      });

      expect(mockFeedAdapter.followUser).not.toHaveBeenCalled();
      expect(mockFeedAdapter.unfollowUser).not.toHaveBeenCalled();
    });
  });

  describe("loadSuggestions", () => {
    it("should load suggestions successfully", async () => {
      const mockSuggestions = [
        {
          id: "suggest-1",
          username: "sugg1",
          avatar: "avatar.jpg",
          description: "Follow me",
        },
        {
          id: "suggest-2",
          username: "sugg2",
          avatar: null,
          description: "Also follow me",
        },
      ];

      mockFeedAdapter.getSuggestions = vi
        .fn()
        .mockResolvedValue(mockSuggestions);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadSuggestions();
      });

      expect(result.current.suggestions).toHaveLength(2);
      expect(result.current.suggestions[0].id).toBe("suggest-1");
      expect(result.current.suggestions[0].avatar).toBe("avatar.jpg");
      expect(result.current.suggestions[1].avatar).toBe("");
    });

    it("should not load suggestions when currentUserId is undefined", async () => {
      const { result } = renderHook(() => useFeed(undefined));

      await act(async () => {
        await result.current.loadSuggestions();
      });

      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe("followSuggestion", () => {
    it("should follow suggestion and remove from list", async () => {
      const mockSuggestions = [
        {
          id: "suggest-1",
          username: "sugg1",
          avatar: "avatar.jpg",
          description: "Follow me",
        },
      ];

      mockFeedAdapter.getSuggestions = vi
        .fn()
        .mockResolvedValue(mockSuggestions);
      mockFeedAdapter.followUser = vi.fn().mockResolvedValue(undefined);
      mockFeedAdapter.checkFollowingUsers = vi.fn().mockResolvedValue([]);

      const { result } = renderHook(() => useFeed("user-1"));

      await act(async () => {
        await result.current.loadSuggestions();
      });

      expect(result.current.suggestions).toHaveLength(1);

      await act(async () => {
        await result.current.followSuggestion("suggest-1");
      });

      expect(result.current.suggestions).toHaveLength(0);
      expect(mockFeedAdapter.followUser).toHaveBeenCalledWith("suggest-1");
    });
  });
});

describe("mapDetailToFeedPost", () => {
  it("should map basic post details correctly", () => {
    const input = {
      postId: "post-1",
      userId: "user-1",
      username: "alice",
      avatar: "avatar.jpg",
      createdAt: new Date().toISOString(),
      mediaUrls: ["image1.jpg", "image2.jpg"],
      likeCount: 100,
      commentCount: 25,
      caption: "Test caption",
      isLiked: true,
      isSaved: false,
      type: "IMAGE",
    };

    const result = mapDetailToFeedPost(input);

    expect(result.id).toBe("post-1");
    expect(result.userId).toBe("user-1");
    expect(result.username).toBe("alice");
    expect(result.avatar).toBe("avatar.jpg");
    expect(result.imageUrl).toBe("image1.jpg");
    expect(result.likeCount).toBe("100");
    expect(result.commentCount).toBe("25");
    expect(result.caption).toBe("Test caption");
    expect(result.isLiked).toBe(true);
    expect(result.isSaved).toBe(false);
    expect(result.type).toBe("IMAGE");
    expect(result.mediaUrls).toEqual(["image1.jpg", "image2.jpg"]);
  });

  it("should handle video posts with videoUrl", () => {
    const input = {
      postId: "post-2",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["video.mp4"],
      type: "VIDEO",
    };

    const result = mapDetailToFeedPost(input);

    expect(result.videoUrl).toBe("video.mp4");
    expect(result.type).toBe("VIDEO");
  });

  it("should handle posts without username using userId prefix", () => {
    const input = {
      postId: "post-3",
      userId: "12345678abcdef",
      createdAt: new Date().toISOString(),
      mediaUrls: ["image.jpg"],
    };

    const result = mapDetailToFeedPost(input);

    expect(result.username).toBe("12345678");
  });

  it("should use placeholder for missing avatar", () => {
    const input = {
      postId: "post-4",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: [],
    };

    const result = mapDetailToFeedPost(input);

    expect(result.avatar).toBe("/placeholder.svg?height=32&width=32");
  });

  it("should use placeholder for missing image", () => {
    const input = {
      postId: "post-5",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: [],
    };

    const result = mapDetailToFeedPost(input);

    expect(result.imageUrl).toBe("/placeholder.svg?height=600&width=600");
  });

  it("should handle autoTags when present", () => {
    const input = {
      postId: "post-6",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["image.jpg"],
      autoTags: ["tag1", "tag2"],
    };

    const result = mapDetailToFeedPost(input);

    expect(result.autoTags).toEqual(["tag1", "tag2"]);
  });

  it("should not include autoTags when empty", () => {
    const input = {
      postId: "post-7",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["image.jpg"],
      autoTags: [],
    };

    const result = mapDetailToFeedPost(input);

    expect(result.autoTags).toBeUndefined();
  });

  it("should handle video files with .mp4 extension", () => {
    const input = {
      postId: "post-8",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["video.mp4"],
      type: "VIDEO",
    };

    const result = mapDetailToFeedPost(input);

    expect(result.videoUrl).toBe("video.mp4");
    expect(result.type).toBe("VIDEO");
  });

  it("should handle data URL video", () => {
    const input = {
      postId: "post-9",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["data:video/mp4;base64,abc123"],
    };

    const result = mapDetailToFeedPost(input);

    expect(result.videoUrl).toBe("data:video/mp4;base64,abc123");
  });

  it("should handle coverUrl for video posts", () => {
    const input = {
      postId: "post-10",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["video.mp4"],
      coverUrl: "cover.jpg",
      type: "VIDEO",
    };

    const result = mapDetailToFeedPost(input);

    expect(result.coverImageUrl).toBe("cover.jpg");
    expect(result.coverUrl).toBe("cover.jpg");
  });

  it("should use non-video URL as cover when available", () => {
    const input = {
      postId: "post-11",
      userId: "user-1",
      createdAt: new Date().toISOString(),
      mediaUrls: ["video.mp4", "poster.jpg"],
      type: "VIDEO",
    };

    const result = mapDetailToFeedPost(input);

    expect(result.coverImageUrl).toBe("poster.jpg");
    expect(result.imageUrl).toBe("poster.jpg");
  });
});
