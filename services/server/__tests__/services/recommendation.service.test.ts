import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecommendationService } from "@/post/service/recommendation.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      recommendation: {
        apiBaseUrl: "https://api.example.com",
        timeoutMs: 5000,
      },
    })),
  },
}));

describe("RecommendationService", () => {
  let recommendationService: RecommendationService;
  let globalFetch: typeof fetch;

  beforeEach(() => {
    globalFetch = global.fetch;
    recommendationService = new RecommendationService();
  });

  afterEach(() => {
    global.fetch = globalFetch;
    vi.clearAllMocks();
  });

  describe("rankFeed", () => {
    it("should call recommendation API with correct parameters", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          items: [{ id: "post-1", score: 1.5 }],
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await recommendationService.rankFeed({
        userId: "user-1",
        candidateIds: ["post-1", "post-2"],
        limit: 10,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/v1/feed/rank",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            userId: "user-1",
            candidateIds: ["post-1", "post-2"],
            limit: 10,
          }),
        }),
      );
      expect(result.items).toHaveLength(1);
    });

    it("should include optional parameters in request", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ items: [] }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await recommendationService.rankFeed({
        userId: "user-1",
        candidateIds: ["post-1"],
        limit: 10,
        region: "US",
        language: "en",
        experimentId: "exp-1",
        variantId: "var-1",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/v1/feed/rank",
        expect.objectContaining({
          body: expect.stringContaining('"region":"US"'),
          body: expect.stringContaining('"language":"en"'),
          body: expect.stringContaining('"experimentId":"exp-1"'),
          body: expect.stringContaining('"variantId":"var-1"'),
        }),
      );
    });

    it("should return empty items on API error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const result = await recommendationService.rankFeed({
        userId: "user-1",
        candidateIds: ["post-1"],
      });

      expect(result.items).toEqual([]);
    });

    it("should return empty items on network error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await recommendationService.rankFeed({
        userId: "user-1",
        candidateIds: ["post-1"],
      });

      expect(result.items).toEqual([]);
    });

    it("should handle response with no items field", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await recommendationService.rankFeed({
        userId: "user-1",
        candidateIds: ["post-1"],
      });

      expect(result.items).toEqual([]);
    });
  });

  describe("rankExplore", () => {
    it("should call explore ranking endpoint", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          items: [{ id: "post-1", score: 2.0 }],
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await recommendationService.rankExplore({
        userId: "user-1",
        candidateIds: ["post-1", "post-2"],
        limit: 20,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/v1/explore/rank",
        expect.any(Object),
      );
      expect(result.items).toHaveLength(1);
    });
  });

  describe("rankReels", () => {
    it("should call reels ranking endpoint", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          items: [{ id: "post-1", score: 3.0 }],
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await recommendationService.rankReels({
        userId: "user-1",
        candidateIds: ["post-1"],
        limit: 10,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/v1/reels/rank",
        expect.any(Object),
      );
      expect(result.items).toHaveLength(1);
    });
  });
});
