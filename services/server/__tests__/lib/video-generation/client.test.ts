import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/video-generation/client";
import type { GeneratePayload } from "@/lib/video-generation/types";

describe("Video Generation Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("createClient with HTTP options", () => {
    it("should create client with HTTP adapter", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job_id: "job-123" }),
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });

      expect(client).toHaveProperty("generate");
      expect(client).toHaveProperty("getResult");
    });

    it("should generate video with correct payload", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job_id: "job-456" }),
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });
      const payload: GeneratePayload = { prompt: "A cat playing piano" };

      const result = await client.generate(payload);

      expect(result.jobId).toBe("job-456");
      expect(fetch).toHaveBeenCalledWith(
        "http://api.example.com/api/v1/videos:generate",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should generate video with image URL", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job_id: "job-789" }),
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });
      const payload: GeneratePayload = { prompt: "animate", imageUrl: "http://example.com/img.png" };

      const result = await client.generate(payload);

      expect(result.jobId).toBe("job-789");
      expect(fetch).toHaveBeenCalledWith(
        "http://api.example.com/api/v1/videos:generate",
        expect.objectContaining({
          body: JSON.stringify({
            prompt: "animate",
            image_url: "http://example.com/img.png",
          }),
        }),
      );
    });

    it("should throw error when generate fails", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });
      const payload: GeneratePayload = { prompt: "Test" };

      await expect(client.generate(payload)).rejects.toThrow("Video API error: 500");
    });

    it("should get result for a job", async () => {
      const mockResult = {
        status: "succeeded" as const,
        video_url: "http://example.com/video.mp4",
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });

      const result = await client.getResult("job-123");

      expect(result.status).toBe("succeeded");
      expect(result.videoUrl).toBe("http://example.com/video.mp4");
      expect(fetch).toHaveBeenCalledWith(
        "http://api.example.com/api/v1/videoJobs/job-123",
      );
    });

    it("should get result for pending job", async () => {
      const mockResult = { status: "pending" as const };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });

      const result = await client.getResult("job-pending");

      expect(result.status).toBe("pending");
    });

    it("should get result for failed job", async () => {
      const mockResult = { status: "failed" as const, error: "Processing failed" };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });

      const result = await client.getResult("job-failed");

      expect(result.status).toBe("failed");
      expect(result.error).toBe("Processing failed");
    });

    it("should throw error when getResult fails", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const client = createClient({ videoApiBaseUrl: "http://api.example.com" });

      await expect(client.getResult("nonexistent")).rejects.toThrow("Video API error: 404");
    });

  });
});
