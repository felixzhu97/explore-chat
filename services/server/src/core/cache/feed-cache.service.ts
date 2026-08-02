import { Injectable } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { CassandraFeedRepository } from "../database/cassandra-feed.repository";

const FEED_KEY_PREFIX = "feed:";
const FEED_TTL_SECONDS = 60;

export interface FeedEntryDto {
  postId: string;
  authorId: string;
  createdAt: Date;
}

@Injectable()
export class FeedCacheService {
  constructor(
    private readonly cache: CacheService,
    private readonly feedRepo: CassandraFeedRepository,
  ) {}

  async getFeedPage(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ entries: FeedEntryDto[]; pageState?: string }> {
    if (!pageState) {
      const cached = await this.cache.get<{
        entries: FeedEntryDto[];
        pageState?: string;
      }>(`${FEED_KEY_PREFIX}${userId}`);
      if (cached?.entries?.length) return cached;
    }
    const { entries, pageState: next } = await this.feedRepo.getFeedPage(
      userId,
      limit,
      pageState,
    );
    const dtos: FeedEntryDto[] = entries.map((e) => ({
      postId: e.post_id,
      authorId: e.author_id,
      createdAt: e.created_at,
    }));
    const result: { entries: FeedEntryDto[]; pageState?: string } = {
      entries: dtos,
    };
    if (next !== undefined) result.pageState = next;
    if (!pageState && dtos.length) {
      await this.cache.set(
        `${FEED_KEY_PREFIX}${userId}`,
        result,
        FEED_TTL_SECONDS,
      );
    }
    return result;
  }

  invalidateFeed(userId: string): Promise<void> {
    return this.cache.del(`${FEED_KEY_PREFIX}${userId}`);
  }
}
