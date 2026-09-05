import { Inject, Injectable } from "@nestjs/common";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import { RedisService } from "@/core/database/redis.service";
import { PrismaService } from "@/core/database/prisma.service";
import type { PostRepository } from "@/post/domain/repository/post.repository";
import { RecommendationService } from "./recommendation.service";
import { ExperimentService } from "@/analytics/service/experiment.service";
import { AdService, AdCandidate } from "@/ads/service/ad.service";

const EXPLORE_HOT_KEY = "explore:hot";
const FALLBACK_USERS_LIMIT = 25;
const FALLBACK_POSTS_PER_USER = 12;

export interface ExploreEntryDto {
  postId: string;
  authorId: string;
  createdAt: string;
}

export interface ExploreEntryWithAdDto extends ExploreEntryDto {
  isSponsored?: boolean;
  adCampaignId?: string;
  adGroupId?: string;
  adCreativeId?: string;
  adAccountId?: string;
}

@Injectable()
export class ExploreService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    @Inject("PostRepository")
    private readonly postRepo: PostRepository,
    private readonly recommendation: RecommendationService,
    private readonly experiments: ExperimentService,
    private readonly ads: AdService,
  ) {}

  async getExplore(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ entries: ExploreEntryWithAdDto[]; total: number }> {
    let raw = await this.redis.get<ExploreEntryDto[]>(EXPLORE_HOT_KEY);
    if (!Array.isArray(raw) || raw.length === 0) {
      raw = await this.getExploreFallback();
    }
    const following = await this.prisma.userFollow
      .findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.followingId)));
    const filtered = raw.filter((e) => !following.has(e.authorId));
    const pool = filtered.length > 0 ? filtered : raw;
    const assignment = this.experiments.assign(userId, "explore");
    const ranked = await this.recommendation.rankExplore({
      userId,
      candidateIds: pool.map((e) => e.postId),
      limit: pool.length,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
    });
    const byPost = keyBy(pool, "postId");
    const ordered = ranked.items
      .map((item) => byPost[item.id])
      .filter((v): v is ExploreEntryDto => v != null);
    const orderedOrFallback = ordered.length > 0 ? ordered : pool;
    const total = orderedOrFallback.length;
    const page = orderedOrFallback.slice(offset, offset + limit);
    const mixed = await this.withAds(userId, page, limit);
    return { entries: mixed, total };
  }

  private async getExploreFallback(): Promise<ExploreEntryDto[]> {
    const users = await this.prisma.user.findMany({
      take: FALLBACK_USERS_LIMIT,
      select: { id: true },
    });
    const entries: ExploreEntryDto[] = [];
    for (const { id: authorId } of users) {
      const { rows } = await this.postRepo.getPostsByUserId(
        authorId,
        FALLBACK_POSTS_PER_USER,
      );
      for (const row of rows) {
        entries.push({
          postId: row.post_id,
          authorId: row.user_id,
          createdAt:
            row.created_at instanceof Date
              ? row.created_at.toISOString()
              : String(row.created_at),
        });
      }
    }
    return orderBy(
      entries,
      (entry) => new Date(entry.createdAt).getTime(),
      "desc",
    ).slice(0, 500);
  }

  private async withAds(
    userId: string,
    entries: ExploreEntryDto[],
    limit: number,
  ): Promise<ExploreEntryWithAdDto[]> {
    if (entries.length === 0) {
      return [];
    }
    const adCandidates = await this.ads.getAdCandidates({
      userId,
      placement: "FEED",
      limit: Math.max(1, Math.floor(limit / 5)),
    });
    if (adCandidates.length === 0) {
      return entries.map((e) => ({
        ...e,
        isSponsored: false,
      }));
    }
    const result: ExploreEntryWithAdDto[] = [];
    const adsQueue = [...adCandidates];
    const interval = Math.max(
      3,
      Math.floor(entries.length / adCandidates.length),
    );
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i] as ExploreEntryDto;
      result.push({
        postId: entry.postId,
        authorId: entry.authorId,
        createdAt: entry.createdAt,
        isSponsored: false,
      });
      const shouldInsertAd =
        (i + 1) % interval === 0 &&
        adsQueue.length > 0 &&
        result.length < limit + adsQueue.length;
      if (shouldInsertAd) {
        const ad = adsQueue.shift() as AdCandidate;
        result.push({
          postId: ad.creativeId,
          authorId: ad.accountId,
          createdAt: new Date().toISOString(),
          isSponsored: true,
          adCampaignId: ad.campaignId,
          adGroupId: ad.groupId,
          adCreativeId: ad.creativeId,
          adAccountId: ad.accountId,
        });
      }
      if (result.length >= limit) {
        break;
      }
    }
    return result.slice(0, limit);
  }
}
