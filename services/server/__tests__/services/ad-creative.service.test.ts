import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdCreativeService } from "@/ads/service/ad-creative.service";

describe("AdCreativeService", () => {
  let service: AdCreativeService;
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      adCreative: {
        findUnique: vi.fn(),
      },
    };

    service = new AdCreativeService(mockPrisma);
  });

  describe("getCreativeById", () => {
    it("should return creative when found", async () => {
      const mockCreative = {
        id: "creative-1",
        campaignId: "campaign-1",
        groupId: "group-1",
        type: "IMAGE",
        title: "Test Ad",
        body: "Test body",
        mediaUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
        landingUrl: "https://example.com/landing",
        language: "en",
      };

      mockPrisma.adCreative.findUnique.mockResolvedValue(mockCreative);

      const result = await service.getCreativeById("creative-1");

      expect(result).toEqual(mockCreative);
      expect(mockPrisma.adCreative.findUnique).toHaveBeenCalledWith({
        where: { id: "creative-1" },
      });
    });

    it("should return null when creative not found", async () => {
      mockPrisma.adCreative.findUnique.mockResolvedValue(null);

      const result = await service.getCreativeById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle creative with null optional fields", async () => {
      const mockCreative = {
        id: "creative-1",
        campaignId: "campaign-1",
        groupId: null,
        type: "TEXT",
        title: null,
        body: "Test body",
        mediaUrl: null,
        thumbnailUrl: null,
        landingUrl: null,
        language: null,
      };

      mockPrisma.adCreative.findUnique.mockResolvedValue(mockCreative);

      const result = await service.getCreativeById("creative-1");

      expect(result).toEqual(mockCreative);
      expect(result?.groupId).toBeNull();
      expect(result?.title).toBeNull();
    });
  });
});
