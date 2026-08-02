import { Injectable } from "@nestjs/common";
import { CassandraService } from "./cassandra.service";

export interface FeedEntry {
  user_id: string;
  created_at: Date;
  post_id: string;
  author_id: string;
}

@Injectable()
export class CassandraFeedRepository {
  constructor(private readonly cassandra: CassandraService) {}

  async insertFeedEntry(
    followerUserId: string,
    authorId: string,
    postId: string,
    createdAt: Date,
  ): Promise<void> {
    const client = this.cassandra.getClient();
    if (!client) return;
    await client.execute(
      `INSERT INTO feed_by_user (user_id, created_at, post_id, author_id) VALUES (?, ?, ?, ?)`,
      [followerUserId, createdAt, postId, authorId],
      { prepare: true },
    );
  }

  async getFeedPage(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ entries: FeedEntry[]; pageState?: string }> {
    const client = this.cassandra.getClient();
    if (!client) return { entries: [] };
    const opts: { prepare: boolean; fetchSize: number; pageState?: string } = {
      prepare: true,
      fetchSize: limit,
    };
    if (pageState !== undefined) opts.pageState = pageState;
    const result = await client.execute(
      `SELECT user_id, created_at, post_id, author_id FROM feed_by_user WHERE user_id = ?`,
      [userId],
      opts,
    );
    const entries = (result.rows || []).map((row: Record<string, unknown>) => ({
      user_id: row["user_id"] as string,
      created_at: row["created_at"] as Date,
      post_id: row["post_id"] as string,
      author_id: row["author_id"] as string,
    }));
    const out: { entries: FeedEntry[]; pageState?: string } = { entries };
    if (result.pageState != null) out.pageState = result.pageState;
    return out;
  }
}
