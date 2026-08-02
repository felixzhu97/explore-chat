import { describe, it, expect, beforeEach, vi } from "vitest";
import { MinioService } from "@/core/storage/minio.service";

describe("MinioService", () => {
  let service: MinioService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MinioService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create service instance", () => {
      expect(service).toBeDefined();
    });
  });

  describe("uploadFile", () => {
    it("should be callable with mock file", async () => {
      vi.mock("fs", async (importOriginal) => {
        const actual = await importOriginal<typeof import("fs")>();
        return {
          ...actual,
          promises: {
            mkdir: vi.fn().mockResolvedValue(undefined),
            writeFile: vi.fn().mockResolvedValue(undefined),
          },
        };
      });

      vi.mock("uuid", () => ({
        v4: vi.fn(() => "mocked-uuid"),
      }));

      const mockFile: Express.Multer.File = {
        fieldname: "media",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test data"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      const result = await service.uploadFile(mockFile);

      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("mimeType", "image/jpeg");
      expect(result).toHaveProperty("size", 1024);
    });
  });
});
