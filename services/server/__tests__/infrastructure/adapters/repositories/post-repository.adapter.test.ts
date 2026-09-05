import { describe, it, expect, beforeEach, vi } from "vitest";
import { PostRepositoryImpl } from "@/post/infra/post-repository.adapter";
import { CassandraPostRepository } from "@/core/database/cassandra-post.repository";

describe("PostRepositoryImpl", () => {
  let adapter: PostRepositoryImpl;
  let mockImpl: ReturnType<typeof vi.mocked<CassandraPostRepository>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockImpl = {
      insertPost: vi.fn().mockResolvedValue(undefined),
      getPostById: vi.fn().mockResolvedValue(null),
      getPostsByUserId: vi.fn().mockResolvedValue({ rows: [] }),
      deletePost: vi.fn().mockResolvedValue(undefined),
    } as never;
    adapter = new PostRepositoryImpl(mockImpl);
  });

  describe("insertPost", () => {
    it("should delegate to implementation", async () => {
      const input = {
        userId: "user-1",
        postId: "post-1",
        caption: "Test caption",
        type: "IMAGE",
        mediaUrls: ["url1"],
      };

      await adapter.insertPost(input);

      expect(mockImpl.insertPost).toHaveBeenCalledWith(input);
    });
  });

  describe("getPostById", () => {
    it("should delegate to implementation", async () => {
      const post = {
        post_id: "post-1",
        user_id: "user-1",
        created_at: new Date(),
        caption: "Test",
        type: "IMAGE",
        media_urls: [],
        location: null,
        cover_url: null,
      };
      mockImpl.getPostById.mockResolvedValue(post);

      const result = await adapter.getPostById("post-1");

      expect(mockImpl.getPostById).toHaveBeenCalledWith("post-1");
      expect(result).toEqual(post);
    });

    it("should return null when post not found", async () => {
      const result = await adapter.getPostById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getPostsByUserId", () => {
    it("should delegate to implementation", async () => {
      const posts = {
        rows: [{ post_id: "post-1" }],
        pageState: "next-page",
      };
      mockImpl.getPostsByUserId.mockResolvedValue(posts);

      const result = await adapter.getPostsByUserId("user-1", 10);

      expect(mockImpl.getPostsByUserId).toHaveBeenCalledWith(
        "user-1",
        10,
        undefined,
      );
      expect(result).toEqual(posts);
    });

    it("should pass pageState when provided", async () => {
      await adapter.getPostsByUserId("user-1", 10, "current-page");

      expect(mockImpl.getPostsByUserId).toHaveBeenCalledWith(
        "user-1",
        10,
        "current-page",
      );
    });
  });

  describe("deletePost", () => {
    it("should delegate to implementation", async () => {
      await adapter.deletePost("post-1", "user-1");

      expect(mockImpl.deletePost).toHaveBeenCalledWith("post-1", "user-1");
    });
  });
});
