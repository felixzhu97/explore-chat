import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";

function encodeCursor(values: unknown[]): string {
  return Buffer.from(JSON.stringify(values), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): unknown[] | null {
  try {
    const s = Buffer.from(cursor, "base64url").toString("utf8");
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/**
 * Search via SQLite (LIKE / FTS5 when available). Replaces Elasticsearch.
 */
@Injectable()
export class SearchService {
  private ftsReady = false;

  constructor(private readonly prisma: PrismaService) {
    void this.ensureFts();
  }

  private async ensureFts(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
          post_id UNINDEXED,
          caption,
          tokenize = 'unicode61'
        )
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE VIRTUAL TABLE IF NOT EXISTS users_fts USING fts5(
          user_id UNINDEXED,
          username,
          tokenize = 'unicode61'
        )
      `);
      this.ftsReady = true;
    } catch {
      this.ftsReady = false;
    }
  }

  async indexUser(userId: string, username: string): Promise<void> {
    if (!this.ftsReady) await this.ensureFts();
    if (!this.ftsReady) return;
    try {
      await this.prisma.$executeRawUnsafe(
        `DELETE FROM users_fts WHERE user_id = ?`,
        userId,
      );
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO users_fts(user_id, username) VALUES (?, ?)`,
        userId,
        username,
      );
    } catch {
      // soft-fail
    }
  }

  async indexPost(postId: string, caption: string): Promise<void> {
    if (!this.ftsReady) await this.ensureFts();
    if (!this.ftsReady) return;
    try {
      await this.prisma.$executeRawUnsafe(
        `DELETE FROM posts_fts WHERE post_id = ?`,
        postId,
      );
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO posts_fts(post_id, caption) VALUES (?, ?)`,
        postId,
        caption || "",
      );
    } catch {
      // soft-fail
    }
  }

  async searchUsers(q: string, limit: number, cursor?: string) {
    const normalized = q.trim().toLowerCase();
    if (!normalized) {
      return { hits: [], nextCursor: undefined };
    }

    if (this.ftsReady) {
      try {
        const rows = (await this.prisma.$queryRawUnsafe(
          `SELECT user_id AS id, username FROM users_fts
           WHERE users_fts MATCH ?
           LIMIT ?`,
          `"${normalized}"*`,
          limit + 1,
        )) as Array<{ id: string; username: string }>;
        if (rows.length > 0) {
          const ids = rows.slice(0, limit).map((r) => r.id);
          const users = await this.prisma.user.findMany({
            where: { id: { in: ids } },
            select: { id: true, username: true, avatar: true, createdAt: true },
          });
          const byId = new Map(users.map((u) => [u.id, u]));
          const page = ids
            .map((id) => byId.get(id))
            .filter((u): u is NonNullable<typeof u> => u != null);
          return {
            hits: page.map((u) => ({
              id: u.id,
              username: u.username,
              ...(u.avatar != null && { avatar: u.avatar }),
              createdAt: u.createdAt.toISOString(),
            })),
            nextCursor: undefined,
          };
        }
      } catch {
        // fall through to LIKE
      }
    }

    return this.searchUsersLike(normalized, limit, cursor);
  }

  private async searchUsersLike(q: string, limit: number, cursor?: string) {
    const after = cursor ? decodeCursor(cursor) : null;
    const createdAfter =
      after && typeof after[0] === "string" ? new Date(after[0]) : null;
    const idAfter = after && typeof after[1] === "string" ? after[1] : null;

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [{ username: { contains: q } }, { id: q }],
          },
          ...(createdAfter && idAfter
            ? [
                {
                  OR: [
                    { createdAt: { lt: createdAfter } },
                    { createdAt: createdAfter, id: { gt: idAfter } },
                  ],
                },
              ]
            : []),
        ],
      },
      select: { id: true, username: true, avatar: true, createdAt: true },
      take: limit + 1,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });
    const page = users.slice(0, limit);
    const next =
      users.length > limit && page.length > 0
        ? encodeCursor([
            page[page.length - 1]!.createdAt.toISOString(),
            page[page.length - 1]!.id,
          ])
        : undefined;
    return {
      hits: page.map((u) => ({
        id: u.id,
        username: u.username,
        ...(u.avatar != null && { avatar: u.avatar }),
        createdAt: u.createdAt.toISOString(),
      })),
      nextCursor: next,
    };
  }

  async searchPosts(q: string, limit: number, cursor?: string) {
    const normalized = q.trim();
    if (!normalized) {
      return { hits: [], nextCursor: undefined, total: 0 };
    }

    if (this.ftsReady) {
      try {
        const ftsRows = (await this.prisma.$queryRawUnsafe(
          `SELECT post_id FROM posts_fts WHERE posts_fts MATCH ? LIMIT ?`,
          `"${normalized.replace(/"/g, "")}"*`,
          limit + 50,
        )) as Array<{ post_id: string }>;
        if (ftsRows.length > 0) {
          const ids = ftsRows.map((r) => r.post_id);
          const posts = await this.prisma.socialPost.findMany({
            where: { id: { in: ids } },
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            take: limit + 1,
          });
          return this.mapPostHits(posts, limit);
        }
      } catch {
        // fall through
      }
    }

    const after = cursor ? decodeCursor(cursor) : null;
    const createdAfter =
      after && typeof after[0] === "string" ? new Date(after[0]) : null;
    const idAfter = after && typeof after[1] === "string" ? after[1] : null;

    const posts = await this.prisma.socialPost.findMany({
      where: {
        AND: [
          { caption: { contains: normalized } },
          ...(createdAfter && idAfter
            ? [
                {
                  OR: [
                    { createdAt: { lt: createdAfter } },
                    { createdAt: createdAfter, id: { gt: idAfter } },
                  ],
                },
              ]
            : []),
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: limit + 1,
    });
    return this.mapPostHits(posts, limit);
  }

  private mapPostHits(
    posts: Array<{
      id: string;
      userId: string;
      caption: string | null;
      type: string;
      mediaUrls: unknown;
      createdAt: Date;
    }>,
    limit: number,
  ) {
    const page = posts.slice(0, limit);
    const nextCursor =
      posts.length > limit && page.length > 0
        ? encodeCursor([
            page[page.length - 1]!.createdAt.toISOString(),
            page[page.length - 1]!.id,
          ])
        : undefined;
    return {
      hits: page.map((p) => ({
        id: p.id,
        postId: p.id,
        userId: p.userId,
        caption: p.caption,
        type: p.type,
        mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : [],
        createdAt: p.createdAt.toISOString(),
      })),
      nextCursor,
      total: page.length,
    };
  }

  async searchHashtags(q: string, limit: number, _cursor?: string) {
    const tag = q.replace(/^#/, "").toLowerCase().trim();
    if (!tag) return { hits: [], nextCursor: undefined };
    const rows = await this.prisma.hashtag.findMany({
      where: { tag: { startsWith: tag } },
      orderBy: { tag: "asc" },
      take: limit + 1,
    });
    const page = rows.slice(0, limit);
    return {
      hits: page.map((r) => ({
        tag: r.tag,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor: undefined,
    };
  }
}
