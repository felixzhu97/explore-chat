import { describe, it, expect, beforeEach, vi } from "vitest";
import { ImageService } from "@/ai/application/image.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      image: {
        imageApiBaseUrl: undefined,
        replicateApiToken: undefined,
      },
    })),
  },
}));

vi.mock("@/lib/image-generation", () => ({
  createClient: vi.fn(() => ({
    generate: vi.fn().mockResolvedValue({ jobId: "job-1" }),
    getResult: vi
      .fn()
      .mockResolvedValue({
        status: "succeeded",
        imageUrl: "http://example.com/image.png",
      }),
  })),
}));

describe("ImageService", () => {
  let service: ImageService;
  let mockAiService: {
    chat: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAiService = {
      chat: vi.fn().mockResolvedValue({ content: "refined prompt" }),
    };

    service = new ImageService(mockAiService as never);
  });

  describe("generate", () => {
    it("should throw BadRequestException when image generation not configured", async () => {
      await expect(service.generate({ prompt: "a cat" })).rejects.toThrow();
    });
  });

  describe("getResult", () => {
    it("should throw BadRequestException when image generation not configured", async () => {
      await expect(service.getResult("job-1")).rejects.toThrow();
    });
  });
});
