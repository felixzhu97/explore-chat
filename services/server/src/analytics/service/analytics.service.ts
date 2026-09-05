import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";
import { RedisService } from "@/core/database/redis.service";
import type { AnalyticsEventRequest } from "@/analytics/controller/analytics-request";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async ingest(
    events: AnalyticsEventRequest[],
    userId?: string,
  ): Promise<void> {
    if (events.length === 0) return;
    const accepted: AnalyticsEventRequest[] = [];
    for (const e of events) {
      if (e.idempotencyKey) {
        const ok = await this.redis.setIfNotExists(
          `analytics:idemp:${e.idempotencyKey}`,
          "1",
          IDEMPOTENCY_TTL_SECONDS,
        );
        if (!ok) continue;
      }
      accepted.push(e);
    }
    if (accepted.length === 0) return;

    // 暂时不再写入 feed:seen，避免影响 Feed 结果

    const data = accepted.map((e) => ({
      eventName: e.eventName,
      ...(e.properties != null && { properties: e.properties as object }),
      platform: e.context?.platform ?? null,
      sessionId: e.context?.sessionId ?? null,
      userId: userId ?? e.context?.userId ?? null,
    }));
    await this.prisma.analyticsEvent.createMany({ data });
  }

  async getOverview(
    start: Date,
    end: Date,
  ): Promise<{
    byEvent: { eventName: string; count: number }[];
    byDay: { date: string; count: number }[];
    total: number;
  }> {
    const [byEvent, byDay, total] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ["eventName"],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      this.getCountByDay(start, end),
      this.prisma.analyticsEvent.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);
    return {
      byEvent: byEvent.map((r) => ({
        eventName: r.eventName,
        count: r._count.id,
      })),
      byDay,
      total,
    };
  }

  private async getCountByDay(
    start: Date,
    end: Date,
  ): Promise<{ date: string; count: number }[]> {
    const result = await this.prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "createdAt")::date::text AS date, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY date_trunc('day', "createdAt")::date
      ORDER BY date
    `;
    return result.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getEvents(params: {
    start: Date;
    end: Date;
    page?: number;
    limit?: number;
    eventName?: string;
  }): Promise<{
    data: {
      id: string;
      eventName: string;
      userId: string | null;
      createdAt: Date;
      properties: unknown;
    }[];
    total: number;
  }> {
    const { start, end, page = 1, limit = 20, eventName } = params;
    const where = {
      createdAt: { gte: start, lte: end },
      ...(eventName && { eventName }),
    };
    const [data, total] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        select: {
          id: true,
          eventName: true,
          userId: true,
          createdAt: true,
          properties: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.analyticsEvent.count({ where }),
    ]);
    return {
      data: data.map((r) => ({
        id: r.id,
        eventName: r.eventName,
        userId: r.userId,
        createdAt: r.createdAt,
        properties: r.properties,
      })),
      total,
    };
  }

  async getAdMetrics(params: {
    start: Date;
    end: Date;
    accountId?: string;
    campaignId?: string;
  }): Promise<
    {
      adAccountId: string;
      adCampaignId: string;
      adCreativeId: string | null;
      impressions: number;
      clicks: number;
      conversions: number;
    }[]
  > {
    const { start, end, accountId, campaignId } = params;
    const result = await this.prisma.$queryRaw<
      {
        ad_account_id: string;
        ad_campaign_id: string;
        ad_creative_id: string | null;
        impressions: bigint;
        clicks: bigint;
        conversions: bigint;
      }[]
    >`
      SELECT
        (properties ->> 'adAccountId') AS ad_account_id,
        (properties ->> 'adCampaignId') AS ad_campaign_id,
        (properties ->> 'adCreativeId') AS ad_creative_id,
        SUM(CASE WHEN event_name = 'ad_impression' THEN 1 ELSE 0 END)::bigint AS impressions,
        SUM(CASE WHEN event_name = 'ad_click' THEN 1 ELSE 0 END)::bigint AS clicks,
        SUM(CASE WHEN event_name = 'ad_conversion' THEN 1 ELSE 0 END)::bigint AS conversions
      FROM analytics_events
      WHERE
        created_at >= ${start}
        AND created_at <= ${end}
        AND event_name IN ('ad_impression', 'ad_click', 'ad_conversion')
        ${accountId ? this.prisma.$queryRaw`AND properties ->> 'adAccountId' = ${accountId}` : this.prisma.$queryRaw``}
        ${campaignId ? this.prisma.$queryRaw`AND properties ->> 'adCampaignId' = ${campaignId}` : this.prisma.$queryRaw``}
      GROUP BY ad_account_id, ad_campaign_id, ad_creative_id
    `;
    return result.map((row) => ({
      adAccountId: row.ad_account_id,
      adCampaignId: row.ad_campaign_id,
      adCreativeId: row.ad_creative_id,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      conversions: Number(row.conversions),
    }));
  }
}
