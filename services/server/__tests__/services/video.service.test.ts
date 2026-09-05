import { describe, it, expect, beforeEach, vi } from "vitest";
import { VideoService } from "@/ai/service/video.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      video: {
        videoApiBaseUrl: undefined,
        replicateApiToken: undefined,
      },
    })),
  },
}));

vi.mock("@/lib/video-generation", () => ({
  createClient: vi.fn(() => ({
    generate: vi.fn().mockResolvedValue({ jobId: "job-1" }),
    getResult: vi.fn().mockResolvedValue({
      status: "succeeded",
      videoUrl: "http://example.com/video.mp4",
    }),
  })),
}));

describe("VideoService", () => {
  let service: VideoService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new VideoService();
  });

  describe("generate", () => {
    it("should throw BadRequestException when video generation not configured", async () => {
      await expect(
        service.generate({ prompt: "a flying cat" }),
      ).rejects.toThrow();
    });
  });

  describe("getResult", () => {
    it("should throw BadRequestException when video generation not configured", async () => {
      await expect(service.getResult("job-1")).rejects.toThrow();
    });
  });
});
