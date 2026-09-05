import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";
import { CassandraFeedRepository } from "@/core/database/cassandra-feed.repository";
import { CacheService } from "@/core/cache/cache.service";
import logger from "@/shared/utils/logger";

const FEED_CACHE_KEY_PREFIX = "feed:";

/**
 * In-process feed fan-out (replaces Kafka post.created consumer).
 */
@Injectable()
export class FeedFanoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feedRepo: CassandraFeedRepository,
    private readonly cache: CacheService,
  ) {}

  async fanoutPostCreated(payload: {
    postId: string;
    userId: string;
    createdAt: string;
    caption: string;
  }): Promise<void> {
    try {
      const followers = await this.prisma.userFollow.findMany({
        where: { followingId: payload.userId },
        select: { followerId: true },
      });
      const createdAt = new Date(payload.createdAt);
      await this.feedRepo.insertFeedEntry(
        payload.userId,
        payload.userId,
        payload.postId,
        createdAt,
      );
      await this.cache.del(`${FEED_CACHE_KEY_PREFIX}${payload.userId}`);
      for (const f of followers) {
        await this.feedRepo.insertFeedEntry(
          f.followerId,
          payload.userId,
          payload.postId,
          createdAt,
        );
        await this.cache.del(`${FEED_CACHE_KEY_PREFIX}${f.followerId}`);
      }

      const rawTags = (payload.caption || "").match(/#\w+/g) || [];
      const tagSet = new Set<string>();
      for (const t of rawTags) {
        const normalized = t.replace(/^#/, "").toLowerCase();
        if (normalized) tagSet.add(normalized);
      }
      for (const tag of tagSet) {
        await this.prisma.hashtag.upsert({
          where: { tag },
          create: { tag },
          update: {},
        });
      }
    } catch (err) {
      logger.error(
        `Feed fan-out failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
