import { describe, it, expect, beforeEach, vi } from "vitest";
import { CassandraEngagementRepository } from "@/core/database/cassandra-engagement.repository";

describe("CassandraEngagementRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create repository with cassandra service", () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );
      expect(repository).toBeDefined();
    });
  });

  describe("like", () => {
    it("should return false when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.like("user-1", "post-1");

      expect(result).toBe(false);
    });

    it("should insert like and increment counter", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.like("user-1", "post-1");

      expect(result).toBe(true);
      expect(mockClient.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe("unlike", () => {
    it("should return false when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.unlike("user-1", "post-1");

      expect(result).toBe(false);
    });

    it("should delete like and decrement counter", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.unlike("user-1", "post-1");

      expect(result).toBe(true);
      expect(mockClient.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe("save", () => {
    it("should return false when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.save("user-1", "post-1");

      expect(result).toBe(false);
    });

    it("should insert save and increment counter", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.save("user-1", "post-1");

      expect(result).toBe(true);
      expect(mockClient.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe("unsave", () => {
    it("should return false when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.unsave("user-1", "post-1");

      expect(result).toBe(false);
    });

    it("should delete save and decrement counter", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.unsave("user-1", "post-1");

      expect(result).toBe(true);
      expect(mockClient.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe("isLiked", () => {
    it("should return false when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.isLiked("user-1", "post-1");

      expect(result).toBe(false);
    });

    it("should return true when post is liked", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [{ user_id: "user-1" }] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.isLiked("user-1", "post-1");

      expect(result).toBe(true);
    });

    it("should return false when post is not liked", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.isLiked("user-1", "post-1");

      expect(result).toBe(false);
    });
  });

  describe("isSaved", () => {
    it("should return false when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.isSaved("user-1", "post-1");

      expect(result).toBe(false);
    });

    it("should return true when post is saved", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [{ user_id: "user-1" }] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.isSaved("user-1", "post-1");

      expect(result).toBe(true);
    });
  });

  describe("getEngagementCounts", () => {
    it("should return zero counts when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getEngagementCounts("post-1");

      expect(result).toEqual({ likeCount: 0, commentCount: 0, saveCount: 0 });
    });

    it("should return zero counts when post not found", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getEngagementCounts("non-existent");

      expect(result).toEqual({ likeCount: 0, commentCount: 0, saveCount: 0 });
    });

    it("should return engagement counts", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [{ like_count: 100, comment_count: 50, save_count: 25 }],
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getEngagementCounts("post-1");

      expect(result.likeCount).toBe(100);
      expect(result.commentCount).toBe(50);
      expect(result.saveCount).toBe(25);
    });
  });

  describe("getEngagementCountsBatch", () => {
    it("should return empty map when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getEngagementCountsBatch([
        "post-1",
        "post-2",
      ]);

      expect(result.size).toBe(0);
    });

    it("should return empty map when postIds is empty", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getEngagementCountsBatch([]);

      expect(result.size).toBe(0);
    });
  });

  describe("incrementCommentCount", () => {
    it("should increment comment count when client is available", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      await repository.incrementCommentCount("post-1");

      expect(mockClient.execute).toHaveBeenCalled();
    });
  });

  describe("decrementCommentCount", () => {
    it("should decrement comment count when client is available", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      await repository.decrementCommentCount("post-1");

      expect(mockClient.execute).toHaveBeenCalled();
    });
  });

  describe("getLikedPostIds", () => {
    it("should return empty set when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getLikedPostIds("user-1", [
        "post-1",
        "post-2",
      ]);

      expect(result.size).toBe(0);
    });

    it("should return empty set when postIds is empty", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getLikedPostIds("user-1", []);

      expect(result.size).toBe(0);
    });
  });

  describe("getSavedPostIds", () => {
    it("should return empty set when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraEngagementRepository(
        mockCassandraService,
      );

      const result = await repository.getSavedPostIds("user-1", [
        "post-1",
        "post-2",
      ]);

      expect(result.size).toBe(0);
    });
  });
});
