import { describe, it, expect, beforeEach, vi } from "vitest";
import { MongoCommentRepository } from "@/core/database/mongo-comment.repository";

const createMockCollection = () => ({
  insertOne: vi
    .fn()
    .mockResolvedValue({ insertedId: { toString: () => "comment-1" } }),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  }),
  findOne: vi.fn().mockResolvedValue(null),
  deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
});

describe("MongoCommentRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create repository with mongo service", () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(createMockCollection()),
        }),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);
      expect(repository).toBeDefined();
    });
  });

  describe("insert", () => {
    it("should throw error when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      await expect(
        repository.insert({
          postId: "post-1",
          userId: "user-1",
          content: "Great post!",
        }),
      ).rejects.toThrow("MongoDB not connected");
    });

    it("should insert comment and return id", async () => {
      const mockCollection = createMockCollection();
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.insert({
        postId: "post-1",
        userId: "user-1",
        content: "Great post!",
      });

      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(result).toBe("comment-1");
    });
  });

  describe("findByPostId", () => {
    it("should return empty array when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.findByPostId("post-1", 10, 0);

      expect(result).toEqual([]);
    });

    it("should handle empty result from database", async () => {
      const mockCollection = createMockCollection();
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.findByPostId("post-1", 10, 0);

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return null when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.findById("comment-1");

      expect(result).toBeNull();
    });

    it("should return null for invalid ObjectId", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(createMockCollection()),
        }),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.findById("invalid-id");

      expect(result).toBeNull();
    });

    it("should return null when comment not found", async () => {
      const mockCollection = createMockCollection();
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.findById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });

  describe("deleteOne", () => {
    it("should return false when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.deleteOne("comment-1", "user-1");

      expect(result).toBe(false);
    });

    it("should return false for invalid ObjectId", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(createMockCollection()),
        }),
      } as never;
      const repository = new MongoCommentRepository(mockMongoService);

      const result = await repository.deleteOne("invalid-id", "user-1");

      expect(result).toBe(false);
    });
  });
});
