import { describe, it, expect, beforeEach, vi } from "vitest";
import { SearchService } from "@/search/application/search.service";
import {
  USER_DOMAIN,
  STRING_VALUES,
} from "@whatschat/shared-types/test-utils/domain-values";

// =============================================================================
// MOCK FACTORIES
// =============================================================================

/**
 * Creates a mock Elasticsearch client with optional search response
 */
const createMockEsClient = (searchResponse?: any) => ({
  search: vi.fn().mockResolvedValue(searchResponse ?? { hits: { hits: [] } }),
});

/**
 * Creates a mock Elasticsearch service
 */
const createMockElasticsearchService = (
  client: ReturnType<typeof createMockEsClient> | null,
) => ({
  getClient: vi.fn().mockReturnValue(client),
});

/**
 * Creates a mock Prisma user findMany response
 */
const createMockPrismaUsers = (users: any[]) => ({
  user: {
    findMany: vi.fn().mockResolvedValue(users),
  },
});

// =============================================================================
// TEST DATA - Using domain values
// =============================================================================

const TEST_USER_ID = USER_DOMAIN.VALID.id;
const TEST_USERNAME = USER_DOMAIN.VALID.username;

describe("SearchService", () => {
  let service: SearchService;

  describe("searchUsers", () => {
    describe("ES unavailable - fallback behavior", () => {
      it("should use Prisma fallback when Elasticsearch returns null client", async () => {
        const mockEs = createMockElasticsearchService(null);
        const mockPrisma = createMockPrismaUsers([
          {
            id: TEST_USER_ID,
            username: TEST_USERNAME,
            avatar: null,
            createdAt: new Date(),
          },
        ]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchUsers(TEST_USERNAME, 10);

        expect(result.hits).toHaveLength(1);
        expect(result.hits[0].id).toBe(TEST_USER_ID);
      });

      it("should use Prisma fallback when getClient returns undefined", async () => {
        const mockEs = createMockElasticsearchService(undefined);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchUsers("query", 10);

        expect(result.hits).toEqual([]);
        expect(mockPrisma.user.findMany).toHaveBeenCalled();
      });
    });

    describe("query validation", () => {
      it.each([
        { label: "empty string", query: STRING_VALUES.EMPTY },
        { label: "whitespace only", query: STRING_VALUES.WHITESPACE },
        { label: "tabs only", query: STRING_VALUES.TAB },
      ])("should return empty for $label query", async ({ query }) => {
        const mockClient = createMockEsClient();
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchUsers(query, 10);

        expect(result.hits).toEqual([]);
      });
    });

    describe("Elasticsearch search", () => {
      it("should search users with Elasticsearch when available", async () => {
        const mockClient = createMockEsClient({
          hits: {
            hits: [
              {
                _id: TEST_USER_ID,
                _source: { username: TEST_USERNAME, avatar: null },
                sort: [new Date().toISOString(), TEST_USER_ID],
              },
            ],
            total: { value: 1 },
          },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchUsers(TEST_USERNAME, 10);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            index: "users",
            query: expect.any(Object),
            size: 11,
          }),
        );
        expect(result.hits).toHaveLength(1);
        expect(result.hits[0].id).toBe(TEST_USER_ID);
      });

      it("should normalize query to lowercase", async () => {
        const mockClient = createMockEsClient({
          hits: { hits: [] },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        await service.searchUsers("TEST", 10);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.objectContaining({
              bool: expect.objectContaining({
                should: expect.arrayContaining([
                  expect.objectContaining({
                    multi_match: expect.objectContaining({ query: "test" }),
                  }),
                ]),
              }),
            }),
          }),
        );
      });

      it("should handle pagination with cursor", async () => {
        const mockClient = createMockEsClient({
          hits: { hits: [] },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const cursor = Buffer.from(
          JSON.stringify([new Date().toISOString(), TEST_USER_ID]),
          "utf8",
        ).toString("base64url");
        await service.searchUsers(TEST_USERNAME, 10, cursor);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({ search_after: expect.any(Array) }),
        );
      });

      it("should return empty hits when search returns null", async () => {
        const mockClient = createMockEsClient({ hits: { hits: null } });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchUsers(TEST_USERNAME, 10);

        expect(result.hits).toEqual([]);
      });
    });
  });

  describe("searchPosts", () => {
    describe("ES unavailable", () => {
      it("should return empty when Elasticsearch is not available", async () => {
        const mockEs = createMockElasticsearchService(null);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchPosts("test", 10);

        expect(result.hits).toEqual([]);
      });

      it("should return empty when getClient returns null", async () => {
        const mockEs = createMockElasticsearchService(null);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchPosts("query", 10);

        expect(result.hits).toEqual([]);
      });
    });

    describe("Elasticsearch search", () => {
      it("should search posts with Elasticsearch", async () => {
        const mockClient = createMockEsClient({
          hits: {
            hits: [
              {
                _id: "post-1",
                _source: { caption: "Test post", hashtags: ["#test"] },
                sort: [new Date().toISOString(), "post-1"],
              },
            ],
            total: { value: 1 },
          },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchPosts("test", 10);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            index: "posts",
            query: expect.any(Object),
            size: 11,
            track_total_hits: 10000,
          }),
        );
        expect(result.hits).toHaveLength(1);
      });

      it.each([
        {
          label: "caption field",
          caption: "Hello World",
          expectedFields: ["caption", "hashtags", "autoTags"],
        },
        {
          label: "hashtag search",
          caption: "#whatsfeed",
          expectedFields: ["caption", "hashtags", "autoTags"],
        },
        {
          label: "unicode content",
          caption: STRING_VALUES.UNICODE_EMOJI,
          expectedFields: ["caption", "hashtags", "autoTags"],
        },
      ])("should search across fields for $label", async ({ caption }) => {
        const mockClient = createMockEsClient({
          hits: { hits: [], total: { value: 0 } },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        await service.searchPosts(caption, 10);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.objectContaining({
              multi_match: expect.objectContaining({
                fields: expect.arrayContaining(["caption", "hashtags"]),
              }),
            }),
          }),
        );
      });

      it("should return total count from Elasticsearch response", async () => {
        const mockClient = createMockEsClient({
          hits: { hits: [], total: { value: 42 } },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchPosts("test", 10);

        expect(result.total).toBe(42);
      });
    });
  });

  describe("searchHashtags", () => {
    describe("ES unavailable", () => {
      it("should return empty when Elasticsearch is not available", async () => {
        const mockEs = createMockElasticsearchService(null);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchHashtags("#test", 10);

        expect(result.hits).toEqual([]);
      });

      it("should return empty when getClient returns null", async () => {
        const mockEs = createMockElasticsearchService(null);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchHashtags("test", 10);

        expect(result.hits).toEqual([]);
      });
    });

    describe("Elasticsearch search", () => {
      it("should search hashtags with Elasticsearch", async () => {
        const mockClient = createMockEsClient({
          hits: {
            hits: [
              {
                _source: { tag: "test", count: 100 },
                sort: ["test"],
              },
            ],
          },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchHashtags("#test", 10);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            index: "hashtags",
            query: expect.objectContaining({
              prefix: expect.objectContaining({ tag: "test" }),
            }),
          }),
        );
        expect(result.hits).toHaveLength(1);
      });

      it("should strip single leading hash from query", async () => {
        const mockClient = createMockEsClient({
          hits: { hits: [] },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        await service.searchHashtags("##multiple", 10);

        // Only strips one leading #
        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.objectContaining({
              prefix: expect.objectContaining({ tag: "#multiple" }),
            }),
          }),
        );
      });

      it("should lowercase hashtag query", async () => {
        const mockClient = createMockEsClient({
          hits: { hits: [] },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        await service.searchHashtags("#UPPERCASE", 10);

        expect(mockClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.objectContaining({
              prefix: expect.objectContaining({ tag: "uppercase" }),
            }),
          }),
        );
      });

      it("should handle empty result set", async () => {
        const mockClient = createMockEsClient({
          hits: { hits: [] },
        });
        const mockEs = createMockElasticsearchService(mockClient);
        const mockPrisma = createMockPrismaUsers([]);
        service = new SearchService(mockEs as any, mockPrisma as any);

        const result = await service.searchHashtags("#nonexistent", 10);

        expect(result.hits).toEqual([]);
        expect(result.nextCursor).toBeUndefined();
      });
    });
  });
});
