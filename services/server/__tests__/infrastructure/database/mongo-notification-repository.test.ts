import { describe, it, expect, beforeEach, vi } from "vitest";
import { MongoNotificationRepository } from "@/core/database/mongo-notification.repository";

const createMockCollection = () => ({
  updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1, matchedCount: 1 }),
  findOne: vi.fn().mockResolvedValue(null),
  deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  insertOne: vi
    .fn()
    .mockResolvedValue({ insertedId: { toString: () => "notification-1" } }),
  updateMany: vi.fn().mockResolvedValue({ modifiedCount: 5 }),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    }),
  }),
});

describe("MongoNotificationRepository", () => {
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
      const repository = new MongoNotificationRepository(mockMongoService);
      expect(repository).toBeDefined();
    });
  });

  describe("upsertLike", () => {
    it("should return null when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.upsertLike(
        "recipient-1",
        "actor-1",
        "post-1",
      );

      expect(result).toBeNull();
    });

    it("should upsert like notification", async () => {
      const mockCollection = createMockCollection();
      mockCollection.findOne.mockResolvedValue({
        _id: { toString: () => "notification-1" },
        recipientId: "recipient-1",
        actorId: "actor-1",
        type: "like",
        postId: "post-1",
        createdAt: new Date(),
      });
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.upsertLike(
        "recipient-1",
        "actor-1",
        "post-1",
      );

      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(result).not.toBeNull();
    });
  });

  describe("deleteLike", () => {
    it("should return false when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.deleteLike("actor-1", "post-1");

      expect(result).toBe(false);
    });

    it("should return false when nothing deleted", async () => {
      const mockCollection = createMockCollection();
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.deleteLike("actor-1", "post-1");

      expect(result).toBe(false);
    });
  });

  describe("insertComment", () => {
    it("should return null when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.insertComment(
        "recipient-1",
        "actor-1",
        "post-1",
        "comment-1",
        "Great post!",
      );

      expect(result).toBeNull();
    });

    it("should insert comment notification", async () => {
      const mockCollection = createMockCollection();
      mockCollection.findOne.mockResolvedValue({
        _id: { toString: () => "notification-1" },
        recipientId: "recipient-1",
        actorId: "actor-1",
        type: "comment",
        postId: "post-1",
        commentId: "comment-1",
        contentPreview: "Great post!",
        createdAt: new Date(),
      });
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.insertComment(
        "recipient-1",
        "actor-1",
        "post-1",
        "comment-1",
        "Great post!",
      );

      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(result).not.toBeNull();
    });
  });

  describe("deleteByCommentId", () => {
    it("should return false when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.deleteByCommentId("comment-1");

      expect(result).toBe(false);
    });
  });

  describe("findByRecipient", () => {
    it("should return empty items when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.findByRecipient("recipient-1", 10);

      expect(result.items).toEqual([]);
    });

    it("should find notifications for recipient", async () => {
      const mockCollection = createMockCollection();
      const mockFind = {
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
              {
                _id: { toString: () => "notification-1" },
                recipientId: "recipient-1",
                actorId: "actor-1",
                type: "like",
                postId: "post-1",
                createdAt: new Date(),
              },
            ]),
          }),
        }),
      };
      mockCollection.find.mockReturnValue(mockFind as never);
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.findByRecipient("recipient-1", 10);

      expect(result.items).toHaveLength(1);
      expect(mockCollection.find).toHaveBeenCalledWith({
        recipientId: "recipient-1",
      });
    });
  });

  describe("markRead", () => {
    it("should return false when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.markRead("recipient-1", "notification-1");

      expect(result).toBe(false);
    });

    it("should return false for invalid ObjectId", async () => {
      const mockCollection = createMockCollection();
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.markRead("recipient-1", "invalid-id");

      expect(result).toBe(false);
    });
  });

  describe("markReadMany", () => {
    it("should return 0 when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.markReadMany("recipient-1", [
        "id-1",
        "id-2",
      ]);

      expect(result).toBe(0);
    });

    it("should return 0 when ids array is empty", async () => {
      const mockCollection = createMockCollection();
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.markReadMany("recipient-1", []);

      expect(result).toBe(0);
    });

    it("should return 0 when all ids are invalid", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue(createMockCollection()),
        }),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.markReadMany("recipient-1", [
        "invalid",
        "also-invalid",
      ]);

      expect(result).toBe(0);
    });
  });

  describe("markAllRead", () => {
    it("should return 0 when collection is not available", async () => {
      const mockMongoService = {
        getDb: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new MongoNotificationRepository(mockMongoService);

      const result = await repository.markAllRead("recipient-1");

      expect(result).toBe(0);
    });
  });
});
