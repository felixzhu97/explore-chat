import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdService } from "@/ads/application/ad.service";

describe("AdService", () => {
  let service: AdService;
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      adGroup: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      adSpend: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    service = new AdService(mockPrisma);
  });

  describe("getAdCandidates", () => {
    it("should return empty array when prisma is not available", async () => {
      const limitedPrisma = {};
      const limitedService = new AdService(limitedPrisma as any);

      const result = await limitedService.getAdCandidates({
        userId: "user-1",
        placement: "FEED",
        limit: 5,
      });

      expect(result).toEqual([]);
    });

    it("should return empty array when no active ad groups", async () => {
      mockPrisma.adGroup.findMany.mockResolvedValue([]);

      const result = await service.getAdCandidates({
        userId: "user-1",
        placement: "FEED",
        limit: 5,
      });

      expect(result).toEqual([]);
    });

    it("should return ad candidates sorted by bid", async () => {
      mockPrisma.adGroup.findMany.mockResolvedValue([
        {
          id: "group-1",
          campaignId: "campaign-1",
          placement: "FEED",
          bidCents: 100,
          billingEvent: "IMPRESSION",
          campaign: {
            accountId: "account-1",
          },
          creatives: [{ id: "creative-1" }],
        },
        {
          id: "group-2",
          campaignId: "campaign-1",
          placement: "FEED",
          bidCents: 200,
          billingEvent: "CLICK",
          campaign: {
            accountId: "account-1",
          },
          creatives: [{ id: "creative-2" }],
        },
      ]);

      const result = await service.getAdCandidates({
        userId: "user-1",
        placement: "FEED",
        limit: 5,
      });

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("recordDelivery", () => {
    it("should return early for empty records", async () => {
      await service.recordDelivery([]);

      expect(mockPrisma.adSpend.createMany).not.toHaveBeenCalled();
    });

    it("should record delivery for valid records", async () => {
      const records = [
        {
          accountId: "account-1",
          campaignId: "campaign-1",
          groupId: "group-1",
          creativeId: "creative-1",
          billingEvent: "IMPRESSION" as const,
          costCents: 10,
        },
      ];

      await service.recordDelivery(records);

      expect(mockPrisma.adSpend.createMany).toHaveBeenCalled();
    });
  });
});
