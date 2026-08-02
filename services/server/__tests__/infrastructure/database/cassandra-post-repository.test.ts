import { describe, it, expect, beforeEach, vi } from "vitest";
import { CassandraPostRepository } from "@/core/database/cassandra-post.repository";

describe("CassandraPostRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create repository with cassandra service", () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);
      expect(repository).toBeDefined();
    });
  });

  describe("insertPost", () => {
    it("should insert post when client is available", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      await repository.insertPost({
        userId: "user-1",
        postId: "post-1",
        caption: "Test caption",
        type: "IMAGE",
        mediaUrls: ["url1", "url2"],
      });

      expect(mockClient.execute).toHaveBeenCalledTimes(2);
    });

    it("should handle null for optional fields", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      await repository.insertPost({
        userId: "user-1",
        postId: "post-1",
        caption: "Test caption",
        type: "TEXT",
        mediaUrls: [],
      });

      const calls = mockClient.execute.mock.calls;
      expect(calls[0][1]).toContain(null);
    });
  });

  describe("getPostById", () => {
    it("should return null when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostById("post-1");

      expect(result).toBeNull();
    });

    it("should return null when post not found", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostById("non-existent");

      expect(result).toBeNull();
    });

    it("should return post when found", async () => {
      const createdAt = new Date("2024-01-01");
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              post_id: "post-1",
              user_id: "user-1",
              created_at: createdAt,
              caption: "Test caption",
              type: "IMAGE",
              media_urls: ["url1", "url2"],
              location: "New York",
              cover_url: "cover-url",
            },
          ],
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostById("post-1");

      expect(result?.post_id).toBe("post-1");
      expect(result?.user_id).toBe("user-1");
    });

    it("should handle null media_urls", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              post_id: "post-1",
              user_id: "user-1",
              created_at: new Date(),
              caption: "Test caption",
              type: "TEXT",
              media_urls: null,
              location: null,
              cover_url: null,
            },
          ],
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostById("post-1");

      expect(result?.media_urls).toEqual([]);
    });
  });

  describe("getPostsByUserId", () => {
    it("should return empty array when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostsByUserId("user-1", 10);

      expect(result.rows).toEqual([]);
    });

    it("should return posts for user", async () => {
      const createdAt = new Date("2024-01-01");
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              user_id: "user-1",
              created_at: createdAt,
              post_id: "post-1",
              caption: "Caption 1",
              type: "IMAGE",
              media_urls: ["url1"],
              location: null,
              cover_url: null,
            },
            {
              user_id: "user-1",
              created_at: createdAt,
              post_id: "post-2",
              caption: "Caption 2",
              type: "TEXT",
              media_urls: [],
              location: null,
              cover_url: null,
            },
          ],
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostsByUserId("user-1", 10);

      expect(result.rows).toHaveLength(2);
    });

    it("should handle empty rows", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: null }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      const result = await repository.getPostsByUserId("user-1", 10);

      expect(result.rows).toEqual([]);
    });
  });

  describe("deletePost", () => {
    it("should return early when post not found", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraPostRepository(mockCassandraService);

      await repository.deletePost("non-existent", "user-1");

      expect(mockClient.execute).toHaveBeenCalledTimes(1);
    });
  });
});
