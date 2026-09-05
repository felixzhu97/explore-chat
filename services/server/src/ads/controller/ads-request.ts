export interface CreateAdAccountDto {
  name: string;
  timezone?: string;
  currency?: string;
  status?: "ACTIVE" | "PAUSED" | "DISABLED";
  dailyBudgetCents?: number | null;
  totalBudgetCents?: number | null;
}

export interface UpdateAdAccountDto {
  name?: string;
  timezone?: string;
  currency?: string;
  status?: "ACTIVE" | "PAUSED" | "DISABLED";
  dailyBudgetCents?: number | null;
  totalBudgetCents?: number | null;
}

export interface CreateAdCampaignDto {
  accountId: string;
  name: string;
  objective?: "IMPRESSIONS" | "CLICKS" | "CONVERSIONS";
  status?: "ACTIVE" | "PAUSED" | "COMPLETED";
  dailyBudgetCents?: number | null;
  totalBudgetCents?: number | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface UpdateAdCampaignDto {
  name?: string;
  objective?: "IMPRESSIONS" | "CLICKS" | "CONVERSIONS";
  status?: "ACTIVE" | "PAUSED" | "COMPLETED";
  dailyBudgetCents?: number | null;
  totalBudgetCents?: number | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface CreateAdGroupDto {
  campaignId: string;
  name: string;
  bidCents: number;
  billingEvent: "IMPRESSION" | "CLICK" | "CONVERSION";
  placement: "FEED" | "STORY" | "REELS" | "BANNER";
  status?: "ACTIVE" | "PAUSED";
  targeting?: unknown;
  maxImpressionsPerUser?: number | null;
  maxImpressionsPerUserPerDay?: number | null;
}

export interface UpdateAdGroupDto {
  name?: string;
  bidCents?: number;
  billingEvent?: "IMPRESSION" | "CLICK" | "CONVERSION";
  placement?: "FEED" | "STORY" | "REELS" | "BANNER";
  status?: "ACTIVE" | "PAUSED";
  targeting?: unknown;
  maxImpressionsPerUser?: number | null;
  maxImpressionsPerUserPerDay?: number | null;
}

export interface CreateAdCreativeDto {
  campaignId: string;
  groupId?: string | null;
  type: string;
  title?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  landingUrl?: string | null;
  language?: string | null;
}

export interface UpdateAdCreativeDto {
  groupId?: string | null;
  type?: string;
  title?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  landingUrl?: string | null;
  language?: string | null;
}
