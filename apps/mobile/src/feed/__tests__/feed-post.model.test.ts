import { FeedPost } from "../feed-post.model";

describe("FeedPost", () => {
  describe("interface structure", () => {
    it("should have all required properties", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "https://example.com/avatar.jpg",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "Test caption",
        likeCount: 10,
        commentCount: 5,
        imageUrl: "https://example.com/image.jpg",
        isLiked: false,
        isSaved: true,
        mediaUrls: [],
      };
      expect(post.id).toBe("post-123");
    });

    it("should have optional type property", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "https://example.com/avatar.jpg",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "Test caption",
        likeCount: 10,
        commentCount: 5,
        imageUrl: "https://example.com/image.jpg",
        isLiked: false,
        isSaved: false,
        mediaUrls: [],
        type: "IMAGE",
      };
      expect(post.type).toBe("IMAGE");
    });

    it("should have optional videoUrl property", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "https://example.com/avatar.jpg",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "Video post",
        likeCount: 10,
        commentCount: 5,
        imageUrl: "https://example.com/poster.jpg",
        isLiked: false,
        isSaved: false,
        mediaUrls: ["https://example.com/video.mp4"],
        videoUrl: "https://example.com/video.mp4",
      };
      expect(post.videoUrl).toBe("https://example.com/video.mp4");
    });

    it("should have optional coverImageUrl property", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "https://example.com/avatar.jpg",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "Video post",
        likeCount: 10,
        commentCount: 5,
        imageUrl: "https://example.com/poster.jpg",
        isLiked: false,
        isSaved: false,
        mediaUrls: [],
        coverImageUrl: "https://example.com/cover.jpg",
      };
      expect(post.coverImageUrl).toBe("https://example.com/cover.jpg");
    });

    it("should require mediaUrls array", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "https://example.com/avatar.jpg",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "Test",
        likeCount: 0,
        commentCount: 0,
        imageUrl: "",
        isLiked: false,
        isSaved: false,
        mediaUrls: [],
      };
      expect(post.mediaUrls).toEqual([]);
    });
  });

  describe("default values", () => {
    it("should handle zero likeCount", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "",
        likeCount: 0,
        commentCount: 0,
        imageUrl: "",
        isLiked: false,
        isSaved: false,
        mediaUrls: [],
      };
      expect(post.likeCount).toBe(0);
    });

    it("should handle boolean isLiked property", () => {
      const likedPost: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "",
        likeCount: 1,
        commentCount: 0,
        imageUrl: "",
        isLiked: true,
        isSaved: false,
        mediaUrls: [],
      };
      expect(likedPost.isLiked).toBe(true);
    });

    it("should handle boolean isSaved property", () => {
      const savedPost: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "",
        likeCount: 0,
        commentCount: 0,
        imageUrl: "",
        isLiked: false,
        isSaved: true,
        mediaUrls: [],
      };
      expect(savedPost.isSaved).toBe(true);
    });
  });

  describe("data types", () => {
    it("should accept string timestamp", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "",
        timestamp: "2024-06-15T12:30:00.000Z",
        caption: "",
        likeCount: 0,
        commentCount: 0,
        imageUrl: "",
        isLiked: false,
        isSaved: false,
        mediaUrls: [],
      };
      expect(typeof post.timestamp).toBe("string");
    });

    it("should accept number likeCount", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "",
        likeCount: 999999,
        commentCount: 100,
        imageUrl: "",
        isLiked: false,
        isSaved: false,
        mediaUrls: [],
      };
      expect(post.likeCount).toBe(999999);
    });

    it("should accept multiple media URLs", () => {
      const post: FeedPost = {
        id: "post-123",
        userId: "user-123",
        username: "testuser",
        avatar: "",
        timestamp: "2024-01-01T00:00:00Z",
        caption: "",
        likeCount: 0,
        commentCount: 0,
        imageUrl: "https://example.com/1.jpg",
        isLiked: false,
        isSaved: false,
        mediaUrls: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
        ],
      };
      expect(post.mediaUrls).toHaveLength(3);
    });
  });
});
