import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AdPacingService,
  AdPacingContext,
} from "@/ads/application/ad-pacing.service";

describe("AdPacingService", () => {
  let service: AdPacingService;
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      adSpend: {
        aggregate: vi.fn(),
      },
      adCampaign: {
        findUnique: vi.fn(),
      },
    };

    service = new AdPacingService(mockPrisma);
  });

  describe("canDeliver", () => {
    const baseContext: AdPacingContext = {
      accountId: "account-1",
      campaignId: "campaign-1",
      groupId: "group-1",
    };

    it("should return true when campaign has no budget limits", async () => {
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 0 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: null,
        totalBudgetCents: null,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(true);
    });

    it("should return false when daily budget is exceeded", async () => {
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 100 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: 50,
        totalBudgetCents: null,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(false);
    });

    it("should return true when daily spending is below budget", async () => {
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 30 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: 100,
        totalBudgetCents: null,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(true);
    });

    it("should return false when total budget is exceeded", async () => {
      mockPrisma.adSpend.aggregate
        .mockResolvedValueOnce({ _sum: { costCents: 50 } })
        .mockResolvedValueOnce({ _sum: { costCents: 200 } });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: null,
        totalBudgetCents: 100,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(false);
    });

    it("should return true when total spending is below total budget", async () => {
      mockPrisma.adSpend.aggregate
        .mockResolvedValueOnce({ _sum: { costCents: 30 } })
        .mockResolvedValueOnce({ _sum: { costCents: 50 } });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: null,
        totalBudgetCents: 100,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(true);
    });

    it("should handle null daily budget (no daily limit)", async () => {
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 0 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: null,
        totalBudgetCents: null,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(true);
    });

    it("should handle null total budget (no total limit)", async () => {
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 100 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: null,
        totalBudgetCents: null,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(true);
    });

    it("should use provided now date instead of current date", async () => {
      const specificDate = new Date("2024-01-15T10:00:00Z");
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 0 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: null,
        totalBudgetCents: null,
      });

      await service.canDeliver({ ...baseContext, now: specificDate });

      expect(mockPrisma.adSpend.aggregate).toHaveBeenCalled();
      const callArgs = mockPrisma.adSpend.aggregate.mock.calls[0][0];
      expect(callArgs.where.createdAt.gte).toBeInstanceOf(Date);
    });

    it("should return true when daily budget equals spent amount (boundary)", async () => {
      mockPrisma.adSpend.aggregate.mockResolvedValue({
        _sum: { costCents: 100 },
      });
      mockPrisma.adCampaign.findUnique.mockResolvedValue({
        dailyBudgetCents: 100,
        totalBudgetCents: null,
      });

      const result = await service.canDeliver(baseContext);

      expect(result).toBe(false);
    });
  });
});
