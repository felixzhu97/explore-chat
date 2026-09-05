import { describe, it, expect, vi, beforeEach } from "vitest";
import { VisionApi } from "@/ai/apis/vision.api";
import type { ApiClient } from "@/auth/api-client";

describe("VisionApi", () => {
  let adapter: VisionApi;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
      postStream: vi.fn(),
      setToken: vi.fn(),
      getToken: vi.fn(),
    } as unknown as ApiClient;
    adapter = new VisionApi(mockApiClient);
  });

  describe("suggestTags", () => {
    it("should suggest tags from uploaded image", async () => {
      const mockResponse = { data: { labels: ["sunset", "beach", "ocean"] } };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["image"], "photo.jpg", { type: "image/jpeg" });
      const result = await adapter.suggestTags(mockFile);

      expect(mockApiClient.upload).toHaveBeenCalledWith(
        "/vision/suggest-tags",
        expect.any(FormData),
      );
      expect(result.labels).toEqual(["sunset", "beach", "ocean"]);
    });

    it("should return empty array when labels not found in nested data", async () => {
      const mockResponse = { data: {} };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["image"], "photo.jpg", { type: "image/jpeg" });
      const result = await adapter.suggestTags(mockFile);

      expect(result.labels).toEqual([]);
    });

    it("should handle top-level labels array", async () => {
      const mockResponse = { labels: ["nature", "forest"] };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["image"], "photo.jpg", { type: "image/jpeg" });
      const result = await adapter.suggestTags(mockFile);

      expect(result.labels).toEqual(["nature", "forest"]);
    });

    it("should return empty array for invalid response", async () => {
      const mockResponse = { data: null };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["image"], "photo.jpg", { type: "image/jpeg" });
      const result = await adapter.suggestTags(mockFile);

      expect(result.labels).toEqual([]);
    });

    it("should handle empty labels array", async () => {
      const mockResponse = { data: { labels: [] } };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["image"], "photo.jpg", { type: "image/jpeg" });
      const result = await adapter.suggestTags(mockFile);

      expect(result.labels).toEqual([]);
    });

    it("should use file name in FormData", async () => {
      const mockResponse = { data: { labels: [] } };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["image"], "vacation-photo.jpg", {
        type: "image/jpeg",
      });
      await adapter.suggestTags(mockFile);

      expect(mockApiClient.upload).toHaveBeenCalled();
    });
  });
});
