import { describe, it, expect, beforeEach, vi } from "vitest";
import { CassandraFeedRepository } from "@/core/database/cassandra-feed.repository";

describe("CassandraFeedRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create repository with cassandra service", () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);
      expect(repository).toBeDefined();
    });
  });

  describe("insertFeedEntry", () => {
    it("should insert feed entry when client is available", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      await repository.insertFeedEntry(
        "follower-1",
        "author-1",
        "post-1",
        new Date(),
      );

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO feed_by_user"),
        expect.arrayContaining([
          "follower-1",
          expect.any(Date),
          "post-1",
          "author-1",
        ]),
        expect.objectContaining({ prepare: true }),
      );
    });

    it("should not execute when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      await repository.insertFeedEntry(
        "follower-1",
        "author-1",
        "post-1",
        new Date(),
      );

      expect(mockCassandraService.getClient).toHaveBeenCalled();
    });
  });

  describe("getFeedPage", () => {
    it("should return empty entries when client is not available", async () => {
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(null),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage("user-1", 10);

      expect(result.entries).toEqual([]);
    });

    it("should query feed entries with limit", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              user_id: "user-1",
              created_at: new Date(),
              post_id: "post-1",
              author_id: "author-1",
            },
            {
              user_id: "user-1",
              created_at: new Date(),
              post_id: "post-2",
              author_id: "author-2",
            },
          ],
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage("user-1", 10);

      expect(result.entries).toHaveLength(2);
      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        expect.arrayContaining(["user-1"]),
        expect.objectContaining({ prepare: true, fetchSize: 10 }),
      );
    });

    it("should handle pagination with pageState", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              user_id: "user-1",
              created_at: new Date(),
              post_id: "post-1",
              author_id: "author-1",
            },
          ],
          pageState: "next-page-state",
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage(
        "user-1",
        10,
        "current-page-state",
      );

      expect(result.entries).toHaveLength(1);
      expect(result.pageState).toBe("next-page-state");
    });

    it("should map row fields correctly", async () => {
      const createdAt = new Date("2024-01-01");
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              user_id: "user-1",
              created_at: createdAt,
              post_id: "post-1",
              author_id: "author-1",
            },
          ],
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage("user-1", 10);

      expect(result.entries[0]).toEqual({
        user_id: "user-1",
        created_at: createdAt,
        post_id: "post-1",
        author_id: "author-1",
      });
    });

    it("should handle empty rows", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({ rows: null }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage("user-1", 10);

      expect(result.entries).toEqual([]);
    });

    it("should not include pageState when result has no pageState", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              user_id: "user-1",
              created_at: new Date(),
              post_id: "post-1",
              author_id: "author-1",
            },
          ],
          pageState: undefined,
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage("user-1", 10);

      expect(result.pageState).toBeUndefined();
    });

    it("should handle pageState as null", async () => {
      const mockClient = {
        execute: vi.fn().mockResolvedValue({
          rows: [
            {
              user_id: "user-1",
              created_at: new Date(),
              post_id: "post-1",
              author_id: "author-1",
            },
          ],
          pageState: null,
        }),
      };
      const mockCassandraService = {
        getClient: vi.fn().mockReturnValue(mockClient as never),
      } as never;
      const repository = new CassandraFeedRepository(mockCassandraService);

      const result = await repository.getFeedPage("user-1", 10);

      expect(result.pageState).toBeUndefined();
    });
  });
});
