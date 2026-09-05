import { describe, it, expect, beforeEach, vi } from "vitest";
import { MediaService } from "@/media/service/media.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      storage: {
        local: {
          allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/heic",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ],
          maxFileSize: 10 * 1024 * 1024,
        },
      },
    })),
  },
}));

describe("MediaService", () => {
  let mockMinioService: {
    uploadFile: ReturnType<typeof vi.fn>;
  };
  let service: MediaService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMinioService = {
      uploadFile: vi.fn().mockResolvedValue({
        key: "test-key",
        url: "http://localhost:9000/test-key",
        mimeType: "image/jpeg",
        size: 1024,
      }),
    };

    service = new MediaService(mockMinioService as any);
  });

  describe("uploadMedia", () => {
    it("should throw BadRequestException for unsupported mime type", async () => {
      const file = {
        mimetype: "application/zip",
        originalname: "test.zip",
        size: 1024,
      } as Express.Multer.File;

      await expect(service.uploadMedia(file)).rejects.toThrow();
    });

    it("should throw BadRequestException for file size exceeds limit", async () => {
      const file = {
        mimetype: "image/jpeg",
        originalname: "test.jpg",
        size: 100 * 1024 * 1024,
      } as Express.Multer.File;

      await expect(service.uploadMedia(file)).rejects.toThrow(
        "File size exceeds limit",
      );
    });

    it("should upload media successfully", async () => {
      const file = {
        mimetype: "image/jpeg",
        originalname: "test.jpg",
        size: 1024,
      } as Express.Multer.File;

      const result = await service.uploadMedia(file);

      expect(result.key).toBe("test-key");
      expect(result.url).toBe("http://localhost:9000/test-key");
      expect(mockMinioService.uploadFile).toHaveBeenCalled();
    });

    it("should resolve mime type from extension for heic files", async () => {
      const file = {
        mimetype: "application/octet-stream",
        originalname: "test.heic",
        size: 1024,
      } as Express.Multer.File;

      const result = await service.uploadMedia(file);

      expect(mockMinioService.uploadFile).toHaveBeenCalled();
    });

    it("should resolve mime type from extension for mp4 files", async () => {
      const file = {
        mimetype: "application/octet-stream",
        originalname: "test.mp4",
        size: 1024,
      } as Express.Multer.File;

      const result = await service.uploadMedia(file);

      expect(mockMinioService.uploadFile).toHaveBeenCalled();
    });
  });
});
