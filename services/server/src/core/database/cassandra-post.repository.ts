import { Injectable } from "@nestjs/common";
import type {
  PostRow,
  CreatePostInput,
} from "@/post/domain/post.repository.interface";
import { CassandraService } from "./cassandra.service";

export type {
  PostRow,
  CreatePostInput,
} from "@/post/domain/post.repository.interface";

@Injectable()
export class CassandraPostRepository {
  constructor(private readonly cassandra: CassandraService) {}

  async insertPost(input: CreatePostInput): Promise<void> {
    const client = this.cassandra.getClient();
    if (!client) return;
    const createdAt = new Date();
    const coverUrl = input.coverUrl ?? null;
    await client.execute(
      `INSERT INTO posts (user_id, created_at, post_id, caption, type, media_urls, location, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        createdAt,
        input.postId,
        input.caption,
        input.type,
        input.mediaUrls,
        input.location ?? null,
        coverUrl,
      ],
      { prepare: true },
    );
    await client.execute(
      `INSERT INTO post_by_id (post_id, user_id, created_at, caption, type, media_urls, location, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.postId,
        input.userId,
        createdAt,
        input.caption,
        input.type,
        input.mediaUrls,
        input.location ?? null,
        coverUrl,
      ],
      { prepare: true },
    );
  }

  async getPostById(postId: string): Promise<PostRow | null> {
    const client = this.cassandra.getClient();
    if (!client) return null;
    const result = await client.execute(
      `SELECT post_id, user_id, created_at, caption, type, media_urls, location, cover_url FROM post_by_id WHERE post_id = ?`,
      [postId],
      { prepare: true },
    );
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      post_id: row["post_id"] as string,
      user_id: row["user_id"] as string,
      created_at: row["created_at"] as Date,
      caption: row["caption"] as string | null,
      type: row["type"] as string,
      media_urls: (row["media_urls"] as string[] | null) ?? [],
      location: row["location"] as string | null,
      cover_url: (row["cover_url"] as string | null) ?? null,
    };
  }

  async getPostsByUserId(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ rows: PostRow[]; pageState?: string }> {
    const client = this.cassandra.getClient();
    if (!client) return { rows: [] };
    const opts: { prepare: boolean; fetchSize: number; pageState?: string } = {
      prepare: true,
      fetchSize: limit,
    };
    if (pageState !== undefined) opts.pageState = pageState;
    const result = await client.execute(
      `SELECT user_id, created_at, post_id, caption, type, media_urls, location, cover_url FROM posts WHERE user_id = ?`,
      [userId],
      opts,
    );
    const rows = (result.rows || []).map((row: Record<string, unknown>) => ({
      user_id: row["user_id"] as string,
      created_at: row["created_at"] as Date,
      post_id: row["post_id"] as string,
      caption: row["caption"] as string | null,
      type: row["type"] as string,
      media_urls: (row["media_urls"] as string[] | null) ?? [],
      location: row["location"] as string | null,
      cover_url: (row["cover_url"] as string | null) ?? null,
    }));
    const out: { rows: PostRow[]; pageState?: string } = { rows };
    if (result.pageState != null) out.pageState = result.pageState;
    return out;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const client = this.cassandra.getClient();
    if (!client) return;
    const existing = await this.getPostById(postId);
    if (!existing || existing.user_id !== userId) return;
    await client.execute(
      `DELETE FROM posts WHERE user_id = ? AND created_at = ? AND post_id = ?`,
      [userId, existing.created_at, postId],
      { prepare: true },
    );
    await client.execute(`DELETE FROM post_by_id WHERE post_id = ?`, [postId], {
      prepare: true,
    });
  }
}
