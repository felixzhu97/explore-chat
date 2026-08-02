import { Injectable } from "@nestjs/common";
import flatMap from "lodash/flatMap";
import orderBy from "lodash/orderBy";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import logger from "@/shared/utils/logger";

export interface AdRequestContext {
  userId: string;
  placement: "FEED" | "STORY" | "REELS" | "BANNER";
  limit: number;
  language?: string | null;
  region?: string | null;
  now?: Date;
}

export interface AdCandidate {
  accountId: string;
  campaignId: string;
  groupId: string;
  creativeId: string;
  placement: "FEED" | "STORY" | "REELS" | "BANNER";
  bidCents: number;
  billingEvent: "IMPRESSION" | "CLICK" | "CONVERSION";
}

export interface AdDeliveryRecord {
  accountId: string;
  campaignId: string;
  groupId: string;
  creativeId: string;
  billingEvent: "IMPRESSION" | "CLICK" | "CONVERSION";
  costCents: number;
  analyticsEventId?: string;
}

@Injectable()
export class AdService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdCandidates(context: AdRequestContext): Promise<AdCandidate[]> {
    const now = context.now ?? new Date();
    const client = this.prisma as unknown as {
      adGroup?: { findMany: (args: unknown) => Promise<any[]> };
    };
    if (!client.adGroup || typeof client.adGroup.findMany !== "function") {
      return [];
    }
    try {
      const activeGroups = await client.adGroup.findMany({
        where: {
          status: "ACTIVE",
          placement: context.placement,
          campaign: {
            status: "ACTIVE",
            startAt: {
              lte: now,
            },
            OR: [
              {
                endAt: null,
              },
              {
                endAt: {
                  gte: now,
                },
              },
            ],
            account: {
              status: "ACTIVE",
            },
          },
        },
        include: {
          campaign: {
            include: {
              account: true,
            },
          },
          creatives: true,
        },
        take: context.limit * 4,
      });
      const flat = flatMap(activeGroups, (group) =>
        group.creatives.map(
          (creative: any): AdCandidate => ({
            accountId: group.campaign.accountId,
            campaignId: group.campaignId,
            groupId: group.id,
            creativeId: creative.id,
            placement: group.placement,
            bidCents: group.bidCents,
            billingEvent: group.billingEvent,
          }),
        ),
      );
      if (flat.length === 0) {
        return [];
      }
      return orderBy(flat, ["bidCents"], ["desc"]).slice(0, context.limit);
    } catch (err) {
      // Ads tables may be absent in local/dev DBs; never fail Feed/Explore for ads.
      logger.warn(
        `Ad candidate query failed, skipping ads: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  async recordDelivery(records: AdDeliveryRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }
    try {
      await (this.prisma as any).adSpend.createMany({
        data: records.map((record) => ({
          accountId: record.accountId,
          campaignId: record.campaignId,
          groupId: record.groupId,
          creativeId: record.creativeId,
          eventType: record.billingEvent,
          costCents: record.costCents,
          analyticsEventId: record.analyticsEventId ?? null,
        })),
      });
    } catch (err) {
      logger.warn(
        `Ad delivery record failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
