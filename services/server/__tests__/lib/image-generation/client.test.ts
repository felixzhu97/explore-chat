import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/image-generation/client";
import type { GeneratePayload } from "@/lib/image-generation/types";

describe("Image Generation Client", () => {
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

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });

      expect(client).toHaveProperty("generate");
      expect(client).toHaveProperty("getResult");
    });

    it("should generate image with correct payload", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job_id: "job-456" }),
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });
      const payload: GeneratePayload = { prompt: "A beautiful sunset" };

      const result = await client.generate(payload);

      expect(result.jobId).toBe("job-456");
      expect(fetch).toHaveBeenCalledWith(
        "http://api.example.com/api/v1/images:generate",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should generate image with negative prompt", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job_id: "job-789" }),
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });
      const payload: GeneratePayload = { prompt: "sunset", negativePrompt: "blurry" };

      const result = await client.generate(payload);

      expect(result.jobId).toBe("job-789");
      expect(fetch).toHaveBeenCalledWith(
        "http://api.example.com/api/v1/images:generate",
        expect.objectContaining({
          body: JSON.stringify({
            prompt: "sunset",
            negative_prompt: "blurry",
          }),
        }),
      );
    });

    it("should throw error when generate fails", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });
      const payload: GeneratePayload = { prompt: "Test" };

      await expect(client.generate(payload)).rejects.toThrow("Image API error: 500");
    });

    it("should get result for a job", async () => {
      const mockResult = {
        status: "succeeded" as const,
        image_url: "http://example.com/image.png",
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });

      const result = await client.getResult("job-123");

      expect(result.status).toBe("succeeded");
      expect(result.imageUrl).toBe("http://example.com/image.png");
      expect(fetch).toHaveBeenCalledWith(
        "http://api.example.com/api/v1/imageJobs/job-123",
      );
    });

    it("should get result for pending job", async () => {
      const mockResult = { status: "pending" as const };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });

      const result = await client.getResult("job-pending");

      expect(result.status).toBe("pending");
    });

    it("should get result for failed job", async () => {
      const mockResult = { status: "failed" as const, error: "Processing failed" };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });

      const result = await client.getResult("job-failed");

      expect(result.status).toBe("failed");
      expect(result.error).toBe("Processing failed");
    });

    it("should throw error when getResult fails", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const client = createClient({ imageApiBaseUrl: "http://api.example.com" });

      await expect(client.getResult("nonexistent")).rejects.toThrow("Image API error: 404");
    });

  });
});
