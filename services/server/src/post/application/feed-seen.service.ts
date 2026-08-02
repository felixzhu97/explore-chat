import { Injectable } from "@nestjs/common";
import { RedisService } from "@/core/database/redis.service";

const SEEN_KEY_PREFIX = "feed:seen:";
const SEEN_TTL_SECONDS = 60 * 60 * 24 * 14;
const SEEN_MAX_ITEMS = 500;

@Injectable()
export class FeedSeenService {
  constructor(private readonly redis: RedisService) {}

  private setKey(userId: string) {
    return `${SEEN_KEY_PREFIX}set:${userId}`;
  }

  private listKey(userId: string) {
    return `${SEEN_KEY_PREFIX}list:${userId}`;
  }

  async markSeen(userId: string, postId: string): Promise<void> {
    if (!userId || !postId) return;
    const setKey = this.setKey(userId);
    const listKey = this.listKey(userId);
    const added = await this.redis.sadd(setKey, postId);
    if (added === 1) {
      await this.redis.lpush(listKey, postId);
      await this.redis.ltrim(listKey, 0, SEEN_MAX_ITEMS - 1);
    }
    await Promise.all([
      this.redis.expire(setKey, SEEN_TTL_SECONDS),
      this.redis.expire(listKey, SEEN_TTL_SECONDS),
    ]);
  }

  async getRecentSeenIds(
    userId: string,
    limit: number = 200,
  ): Promise<string[]> {
    if (!userId) return [];
    const listKey = this.listKey(userId);
    const ids = await this.redis.lrange(listKey, 0, Math.max(0, limit - 1));
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  }

  async isSeen(userId: string, postId: string): Promise<boolean> {
    if (!userId || !postId) return false;
    const setKey = this.setKey(userId);
    const members = await this.redis.smembers(setKey);
    return members.includes(postId);
  }

  async filterUnseen(userId: string, postIds: string[]): Promise<string[]> {
    if (!userId) return postIds;
    if (!Array.isArray(postIds) || postIds.length === 0) return [];
    const seen = new Set(await this.getRecentSeenIds(userId, SEEN_MAX_ITEMS));
    return postIds.filter((id) => !seen.has(id));
  }
}
