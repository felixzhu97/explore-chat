import { describe, it, expect, beforeEach, vi } from "vitest";
import { CommentRepositoryImpl } from "@/comments/infra/comment-repository.adapter";
import { MongoCommentRepository } from "@/core/database/mongo-comment.repository";

describe("CommentRepositoryImpl", () => {
  let adapter: CommentRepositoryImpl;
  let mockImpl: ReturnType<typeof vi.mocked<MongoCommentRepository>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockImpl = {
      insert: vi.fn().mockResolvedValue("comment-1"),
      findByPostId: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      deleteOne: vi.fn().mockResolvedValue(true),
    } as never;
    adapter = new CommentRepositoryImpl(mockImpl);
  });

  describe("insert", () => {
    it("should delegate to implementation", async () => {
      const doc = {
        postId: "post-1",
        userId: "user-1",
        content: "Test comment",
      };

      const result = await adapter.insert(doc);

      expect(mockImpl.insert).toHaveBeenCalledWith(doc);
      expect(result).toBe("comment-1");
    });
  });

  describe("findByPostId", () => {
    it("should delegate to implementation", async () => {
      const comments = [
        { _id: "comment-1", postId: "post-1", content: "Test" },
      ];
      mockImpl.findByPostId.mockResolvedValue(comments);

      const result = await adapter.findByPostId("post-1", 10, 0);

      expect(mockImpl.findByPostId).toHaveBeenCalledWith("post-1", 10, 0);
      expect(result).toEqual(comments);
    });
  });

  describe("findById", () => {
    it("should delegate to implementation", async () => {
      const comment = { _id: "comment-1", postId: "post-1", content: "Test" };
      mockImpl.findById.mockResolvedValue(comment);

      const result = await adapter.findById("comment-1");

      expect(mockImpl.findById).toHaveBeenCalledWith("comment-1");
      expect(result).toEqual(comment);
    });

    it("should return null when not found", async () => {
      const result = await adapter.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("deleteOne", () => {
    it("should delegate to implementation", async () => {
      const result = await adapter.deleteOne("comment-1", "user-1");

      expect(mockImpl.deleteOne).toHaveBeenCalledWith("comment-1", "user-1");
      expect(result).toBe(true);
    });
  });
});
