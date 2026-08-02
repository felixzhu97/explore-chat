import { Injectable } from "@nestjs/common";
import { CassandraService } from "./cassandra.service";

@Injectable()
export class CassandraEngagementRepository {
  constructor(private readonly cassandra: CassandraService) {}

  async like(userId: string, postId: string): Promise<boolean> {
    const client = this.cassandra.getClient();
    if (!client) return false;
    const createdAt = new Date();
    await client.execute(
      `INSERT INTO post_likes (user_id, post_id, created_at) VALUES (?, ?, ?)`,
      [userId, postId, createdAt],
      { prepare: true },
    );
    await client.execute(
      `UPDATE post_engagement_counts SET like_count = like_count + 1 WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
    return true;
  }

  async unlike(userId: string, postId: string): Promise<boolean> {
    const client = this.cassandra.getClient();
    if (!client) return false;
    await client.execute(
      `DELETE FROM post_likes WHERE user_id = ? AND post_id = ?`,
      [userId, postId],
      { prepare: true },
    );
    await client.execute(
      `UPDATE post_engagement_counts SET like_count = like_count - 1 WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
    return true;
  }

  async save(userId: string, postId: string): Promise<boolean> {
    const client = this.cassandra.getClient();
    if (!client) return false;
    const createdAt = new Date();
    await client.execute(
      `INSERT INTO post_saves (user_id, post_id, created_at) VALUES (?, ?, ?)`,
      [userId, postId, createdAt],
      { prepare: true },
    );
    await client.execute(
      `UPDATE post_engagement_counts SET save_count = save_count + 1 WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
    return true;
  }

  async unsave(userId: string, postId: string): Promise<boolean> {
    const client = this.cassandra.getClient();
    if (!client) return false;
    await client.execute(
      `DELETE FROM post_saves WHERE user_id = ? AND post_id = ?`,
      [userId, postId],
      { prepare: true },
    );
    await client.execute(
      `UPDATE post_engagement_counts SET save_count = save_count - 1 WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
    return true;
  }

  async isLiked(userId: string, postId: string): Promise<boolean> {
    const client = this.cassandra.getClient();
    if (!client) return false;
    const result = await client.execute(
      `SELECT user_id FROM post_likes WHERE user_id = ? AND post_id = ? LIMIT 1`,
      [userId, postId],
      { prepare: true },
    );
    return (result.rows?.length ?? 0) > 0;
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    const client = this.cassandra.getClient();
    if (!client) return false;
    const result = await client.execute(
      `SELECT user_id FROM post_saves WHERE user_id = ? AND post_id = ? LIMIT 1`,
      [userId, postId],
      { prepare: true },
    );
    return (result.rows?.length ?? 0) > 0;
  }

  async getEngagementCounts(
    postId: string,
  ): Promise<{ likeCount: number; commentCount: number; saveCount: number }> {
    const client = this.cassandra.getClient();
    if (!client) return { likeCount: 0, commentCount: 0, saveCount: 0 };
    const result = await client.execute(
      `SELECT like_count, comment_count, save_count FROM post_engagement_counts WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
    const row = result.rows?.[0] as Record<string, unknown> | undefined;
    if (!row) return { likeCount: 0, commentCount: 0, saveCount: 0 };
    const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
    return {
      likeCount: Math.max(0, toNum(row["like_count"])),
      commentCount: Math.max(0, toNum(row["comment_count"])),
      saveCount: Math.max(0, toNum(row["save_count"])),
    };
  }

  async getEngagementCountsBatch(
    postIds: string[],
  ): Promise<
    Map<string, { likeCount: number; commentCount: number; saveCount: number }>
  > {
    const out = new Map<
      string,
      { likeCount: number; commentCount: number; saveCount: number }
    >();
    if (!this.cassandra.getClient() || postIds.length === 0) return out;
    for (const postId of postIds) {
      const c = await this.getEngagementCounts(postId);
      out.set(postId, c);
    }
    return out;
  }

  async incrementCommentCount(postId: string): Promise<void> {
    const client = this.cassandra.getClient();
    if (!client) return;
    await client.execute(
      `UPDATE post_engagement_counts SET comment_count = comment_count + 1 WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
  }

  async decrementCommentCount(postId: string): Promise<void> {
    const client = this.cassandra.getClient();
    if (!client) return;
    await client.execute(
      `UPDATE post_engagement_counts SET comment_count = comment_count - 1 WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
  }

  async getLikedPostIds(
    userId: string,
    postIds: string[],
  ): Promise<Set<string>> {
    const client = this.cassandra.getClient();
    if (!client || postIds.length === 0) return new Set();
    const set = new Set<string>();
    for (const postId of postIds) {
      const liked = await this.isLiked(userId, postId);
      if (liked) set.add(postId);
    }
    return set;
  }

  async getSavedPostIds(
    userId: string,
    postIds: string[],
  ): Promise<Set<string>> {
    const client = this.cassandra.getClient();
    if (!client || postIds.length === 0) return new Set();
    const set = new Set<string>();
    for (const postId of postIds) {
      const saved = await this.isSaved(userId, postId);
      if (saved) set.add(postId);
    }
    return set;
  }
}
