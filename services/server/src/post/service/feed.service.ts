import { Inject, Injectable } from "@nestjs/common";
import compact from "lodash/compact";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import { FeedCacheService } from "@/core/cache/feed-cache.service";
import type { EngagementRepository } from "@/post/domain/repository/engagement.repository";
import { PostService } from "./post.service";
import { RecommendationService } from "./recommendation.service";
import { ExperimentService } from "@/analytics/application/experiment.service";
import { AdService, AdCandidate } from "@/ads/application/ad.service";

const RECENCY_HALFLIFE_HOURS = 24;
const ENGAGEMENT_WEIGHT = 2;

function rankScore(
  createdAt: Date,
  likeCount: number,
  commentCount: number,
  now: Date,
): number {
  const ageHours =
    (now.getTime() - new Date(createdAt).getTime()) / (1000 * 3600);
  const recency = Math.exp((-ageHours * Math.LN2) / RECENCY_HALFLIFE_HOURS);
  const engagement = Math.log(1 + likeCount + commentCount);
  return recency + ENGAGEMENT_WEIGHT * engagement;
}

@Injectable()
export class FeedService {
  constructor(
    private readonly feedCache: FeedCacheService,
    private readonly postService: PostService,
    @Inject("EngagementRepository")
    private readonly engagementRepo: EngagementRepository,
    private readonly recommendation: RecommendationService,
    private readonly experiments: ExperimentService,
    private readonly ads: AdService,
  ) {}

  async getFeed(userId: string, limit: number, pageState?: string) {
    const result = await this.feedCache.getFeedPage(userId, limit, pageState);
    const visibleEntries = await this.filterVisibleEntries(
      result.entries,
      userId,
    );
    if (pageState) {
      return {
        entries: visibleEntries,
        pageState: result.pageState,
      };
    }
    const { posts } = await this.postService.getPostsByUser(
      userId,
      limit,
      undefined,
    );
    const ownEntries = posts.map((p) => ({
      postId: p.postId,
      authorId: p.userId,
      createdAt:
        typeof p.createdAt === "string"
          ? new Date(p.createdAt)
          : (p.createdAt as Date),
    }));
    const candidates = uniqBy([...ownEntries, ...visibleEntries], "postId");
    const postIds = candidates.map((e) => e.postId);
    const countsMap =
      await this.engagementRepo.getEngagementCountsBatch(postIds);
    const now = new Date();
    const assignment = this.experiments.assign(userId, "feed");
    const ranked = await this.recommendation.rankFeed({
      userId,
      candidateIds: candidates.map((e) => e.postId),
      limit,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
    } as any);
    const rankedByPost = keyBy(candidates, "postId");
    const ordered = (ranked.items ?? [])
      .map((item) => rankedByPost[item.id])
      .filter(
        (v): v is { postId: string; authorId: string; createdAt: Date } =>
          v != null,
      );
    const fallbackSorted = orderBy(
      candidates.map((e) => ({
        ...e,
        score: rankScore(
          e.createdAt,
          countsMap.get(e.postId)?.likeCount ?? 0,
          countsMap.get(e.postId)?.commentCount ?? 0,
          now,
        ),
      })),
      ["score"],
      ["desc"],
    );
    const combined = ordered.length > 0 ? ordered : fallbackSorted;
    const page = combined
      .slice(0, limit)
      .map(({ postId, authorId, createdAt }) => ({
        postId,
        authorId,
        createdAt,
      }));
    const mixed = await this.withAds(userId, page, limit);
    return { entries: mixed, pageState: result.pageState };
  }

  async getReels(userId: string, limit: number, pageState?: string) {
    const candidateLimit = Math.max(1, limit);
    const collected: { postId: string; authorId: string; createdAt: Date }[] =
      [];

    let currentPageState: string | undefined = pageState;
    let finalPageState: string | undefined = undefined;

    while (collected.length < limit) {
      const result = await this.feedCache.getFeedPage(
        userId,
        candidateLimit,
        currentPageState,
      );
      finalPageState = result.pageState;

      const visibleVideoEntries = await this.filterVideoVisibleEntries(
        result.entries,
        userId,
      );
      for (const e of visibleVideoEntries) {
        collected.push(e);
        if (collected.length >= limit) break;
      }

      if (!result.pageState) break;
      if (result.pageState === currentPageState) break;
      currentPageState = result.pageState;
    }

    return {
      entries: this.toReelsPage(collected.slice(0, limit)),
      pageState: finalPageState,
    };
  }

  private async filterVisibleEntries(
    entries: { postId: string; authorId: string; createdAt: Date }[],
    currentUserId: string,
  ): Promise<{ postId: string; authorId: string; createdAt: Date }[]> {
    if (entries.length === 0) return entries;
    const postIds = entries.map((entry) => entry.postId);
    const rows = await this.postService.getPostsBatch(postIds, currentUserId);
    const visibleIds = new Set(
      compact(
        rows
          .filter((row): row is Record<string, unknown> => row != null)
          .map((row) => row["postId"])
          .filter((postId): postId is string => typeof postId === "string"),
      ),
    );
    return entries.filter((entry) => visibleIds.has(entry.postId));
  }

  private async filterVideoVisibleEntries(
    entries: { postId: string; authorId: string; createdAt: Date }[],
    currentUserId: string,
  ): Promise<{ postId: string; authorId: string; createdAt: Date }[]> {
    if (entries.length === 0) return entries;
    const postIds = entries.map((entry) => entry.postId);
    const rows = await this.postService.getPostsBatch(postIds, currentUserId);

    const videoIds = new Set(
      compact(
        rows
          .filter((row): row is Record<string, unknown> => row != null)
          .filter((row) => row["type"] === "VIDEO")
          .map((row) => row["postId"])
          .filter((postId): postId is string => typeof postId === "string"),
      ),
    );

    return entries.filter((entry) => videoIds.has(entry.postId));
  }

  private toReelsPage(
    entries: { postId: string; authorId: string; createdAt: Date }[],
  ): { postId: string; authorId: string; createdAt: Date }[] {
    return entries.map((e) => ({
      postId: e.postId,
      authorId: e.authorId,
      createdAt: e.createdAt,
    }));
  }

  private async withAds(
    userId: string,
    entries: { postId: string; authorId: string; createdAt: Date }[],
    limit: number,
  ): Promise<
    {
      postId: string;
      authorId: string;
      createdAt: Date;
      isSponsored?: boolean;
      adAccountId?: string;
      adCampaignId?: string;
      adGroupId?: string;
      adCreativeId?: string;
    }[]
  > {
    if (entries.length === 0) {
      return [];
    }
    const ads = await this.ads.getAdCandidates({
      userId,
      placement: "FEED",
      limit: Math.max(1, Math.floor(limit / 5)),
    });
    if (ads.length === 0) {
      return entries.map((e) => ({
        ...e,
        isSponsored: false,
      }));
    }
    const result: {
      postId: string;
      authorId: string;
      createdAt: Date;
      isSponsored?: boolean;
      adAccountId?: string;
      adCampaignId?: string;
      adGroupId?: string;
      adCreativeId?: string;
    }[] = [];
    const queue: AdCandidate[] = [...ads];
    const interval = Math.max(3, Math.floor(entries.length / queue.length));
    for (let i = 0; i < entries.length; i++) {
      const current = entries[i] as {
        postId: string;
        authorId: string;
        createdAt: Date;
      };
      result.push({
        postId: current.postId,
        authorId: current.authorId,
        createdAt: current.createdAt,
        isSponsored: false,
      });
      const shouldInsertAd =
        (i + 1) % interval === 0 &&
        queue.length > 0 &&
        result.length < limit + queue.length;
      if (shouldInsertAd) {
        const ad = queue.shift() as AdCandidate;
        result.push({
          postId: ad.creativeId,
          authorId: ad.accountId,
          createdAt: new Date(),
          isSponsored: true,
          adAccountId: ad.accountId,
          adCampaignId: ad.campaignId,
          adGroupId: ad.groupId,
          adCreativeId: ad.creativeId,
        });
      }
      if (result.length >= limit) {
        break;
      }
    }
    return result.slice(0, limit);
  }
}
