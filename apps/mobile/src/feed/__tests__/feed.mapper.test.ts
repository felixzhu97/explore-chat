import { mapFeedPostResToFeedPost, isVideoUrl } from "@/feed/feed.mapper";

describe("feed.mapper", () => {
  describe("isVideoUrl", () => {
    it("detects video extension", () => {
      expect(isVideoUrl("https://x/y.mp4")).toBe(true);
      expect(isVideoUrl("https://x/y.jpg")).toBe(false);
    });
  });

  describe("mapFeedPostResToFeedPost", () => {
    it("maps image post", () => {
      const r = mapFeedPostResToFeedPost({
        postId: "p1",
        userId: "u1",
        caption: "c",
        type: "IMAGE",
        mediaUrls: ["https://a/b.jpg"],
        createdAt: "2024-01-01T00:00:00Z",
        username: "alice",
        avatar: "av",
        likeCount: 2,
        commentCount: 1,
        isLiked: false,
        isSaved: true,
      });
      expect(r.id).toBe("p1");
      expect(r.imageUrl).toBe("https://a/b.jpg");
      expect(r.videoUrl).toBeUndefined();
      expect(r.isSaved).toBe(true);
    });

    it("maps video post with cover", () => {
      const r = mapFeedPostResToFeedPost({
        postId: "p2",
        userId: "u2",
        caption: "",
        type: "VIDEO",
        mediaUrls: ["https://a/v.mp4"],
        coverUrl: "https://a/cover.jpg",
        createdAt: "2024-01-01T00:00:00Z",
      });
      expect(r.videoUrl).toBe("https://a/v.mp4");
      expect(r.coverImageUrl).toBe("https://a/cover.jpg");
      expect(r.imageUrl).toBe("https://a/cover.jpg");
    });

    it("maps video url type from first media", () => {
      const r = mapFeedPostResToFeedPost({
        postId: "p3",
        userId: "u3",
        caption: "",
        type: "IMAGE",
        mediaUrls: ["https://a/x.mov"],
        createdAt: "2024-01-01T00:00:00Z",
      });
      expect(r.videoUrl).toBe("https://a/x.mov");
    });
  });
});
