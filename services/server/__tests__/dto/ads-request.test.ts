import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import {
  CreateAdAccountDto,
  CreateAdCampaignDto,
  CreateAdGroupDto,
  CreateAdCreativeDto,
} from "@/ads/controller/ads-request";

describe("CreateAdAccountDto", () => {
  it("should create dto with minimal required fields", async () => {
    const dto = plainToInstance(CreateAdAccountDto, { name: "Test Account" });
    expect(dto.name).toBe("Test Account");
  });

  it("should create dto with all optional fields", async () => {
    const dto = plainToInstance(CreateAdAccountDto, {
      name: "Test Account",
      timezone: "America/New_York",
      currency: "USD",
      status: "ACTIVE",
      dailyBudgetCents: 1000,
      totalBudgetCents: 10000,
    });
    expect(dto.name).toBe("Test Account");
    expect(dto.status).toBe("ACTIVE");
  });
});

describe("CreateAdCampaignDto", () => {
  it("should create dto with required fields", async () => {
    const dto = plainToInstance(CreateAdCampaignDto, {
      accountId: "acc-1",
      name: "Test Campaign",
    });
    expect(dto.accountId).toBe("acc-1");
    expect(dto.name).toBe("Test Campaign");
  });

  it("should create dto with optional fields", async () => {
    const dto = plainToInstance(CreateAdCampaignDto, {
      accountId: "acc-1",
      name: "Test Campaign",
      objective: "CLICKS",
      status: "PAUSED",
      dailyBudgetCents: 500,
      totalBudgetCents: 5000,
      startAt: "2024-01-01",
      endAt: "2024-12-31",
    });
    expect(dto.objective).toBe("CLICKS");
    expect(dto.status).toBe("PAUSED");
  });
});

describe("CreateAdGroupDto", () => {
  it("should create dto with required fields", async () => {
    const dto = plainToInstance(CreateAdGroupDto, {
      campaignId: "campaign-1",
      name: "Test Group",
      bidCents: 100,
      billingEvent: "IMPRESSION",
      placement: "FEED",
    });
    expect(dto.campaignId).toBe("campaign-1");
    expect(dto.bidCents).toBe(100);
    expect(dto.placement).toBe("FEED");
  });

  it("should create dto with different placements", async () => {
    const placements = ["FEED", "STORY", "REELS", "BANNER"] as const;
    for (const placement of placements) {
      const dto = plainToInstance(CreateAdGroupDto, {
        campaignId: "campaign-1",
        name: "Test Group",
        bidCents: 100,
        billingEvent: "IMPRESSION",
        placement,
      });
      expect(dto.placement).toBe(placement);
    }
  });
});

describe("CreateAdCreativeDto", () => {
  it("should create dto with required fields", async () => {
    const dto = plainToInstance(CreateAdCreativeDto, {
      campaignId: "campaign-1",
      type: "IMAGE",
    });
    expect(dto.campaignId).toBe("campaign-1");
    expect(dto.type).toBe("IMAGE");
  });

  it("should create dto with optional fields", async () => {
    const dto = plainToInstance(CreateAdCreativeDto, {
      campaignId: "campaign-1",
      type: "VIDEO",
      title: "Test Ad",
      body: "Ad body text",
      mediaUrl: "https://example.com/media.jpg",
      thumbnailUrl: "https://example.com/thumb.jpg",
      landingUrl: "https://example.com/landing",
      language: "en",
    });
    expect(dto.title).toBe("Test Ad");
    expect(dto.body).toBe("Ad body text");
    expect(dto.language).toBe("en");
  });
});
