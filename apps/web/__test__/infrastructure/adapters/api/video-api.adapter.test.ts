import { describe, it, expect, vi, beforeEach } from "vitest";
import { VideoApi } from "@/ai/apis/video.api";
import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-response.model";

describe("VideoApi", () => {
  let adapter: VideoApi;
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
    adapter = new VideoApi(mockApiClient);
  });

  describe("generate", () => {
    it("should generate video with prompt only", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { jobId: "job-123" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.generate("A sunset over the ocean");

      expect(mockApiClient.post).toHaveBeenCalledWith("/video/generate", {
        prompt: "A sunset over the ocean",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should generate video with prompt and image URL", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { jobId: "job-456" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.generate(
        "Animate this image",
        "http://example.com/image.jpg",
      );

      expect(mockApiClient.post).toHaveBeenCalledWith("/video/generate", {
        prompt: "Animate this image",
        imageUrl: "http://example.com/image.jpg",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should not include imageUrl when null", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { jobId: "job-789" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.generate("Generate video", null as any);

      expect(mockApiClient.post).toHaveBeenCalledWith("/video/generate", {
        prompt: "Generate video",
      });
    });
  });

  describe("getResult", () => {
    it("should fetch video generation result", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: {
          status: "succeeded" as const,
          videoUrl: "http://example.com/video.mp4",
        },
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getResult("job-123");

      expect(mockApiClient.get).toHaveBeenCalledWith("/video/generate/job-123");
      expect(result).toEqual(mockResponse);
    });

    it("should return pending status for in-progress job", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { status: "pending" as const },
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getResult("job-456");

      expect(result.data?.status).toBe("pending");
    });

    it("should return failed status with error message", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { status: "failed" as const, error: "Generation failed" },
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getResult("job-789");

      expect(result.data?.status).toBe("failed");
      expect(result.data?.error).toBe("Generation failed");
    });
  });
});
