import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";
import { PrismaService } from "@/core/database/prisma.service";

const TRACK_TOTAL_HITS_LIMIT = 10000;

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

@Injectable()
export class SearchService {
  constructor(
    private readonly es: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  async searchUsers(q: string, limit: number, cursor?: string) {
    const client = this.es.getClient();
    if (!client) {
      return this.searchUsersFallback(q, limit);
    }
    const normalized = q.trim().toLowerCase();
    if (!normalized) {
      return { hits: [], nextCursor: undefined };
    }
    const body: Record<string, unknown> = {
      index: "users",
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: normalized,
                fields: ["username", "id"],
                fuzziness: "AUTO",
              },
            },
            { prefix: { username: normalized } },
          ],
          minimum_should_match: 1,
        },
      },
      size: limit + 1,
      sort: [{ createdAt: { order: "desc" } }, { id: { order: "asc" } }],
      highlight: {
        fields: { username: {} },
        pre_tags: ["<em>"],
        post_tags: ["</em>"],
      },
    };
    const after = cursor ? decodeCursor(cursor) : null;
    if (after && Array.isArray(after)) (body as any).search_after = after;
    const result = await client.search(body as any);
    const hits = (result.hits.hits || []) as Array<{
      _source: Record<string, unknown>;
      sort?: unknown[];
      highlight?: Record<string, string[]>;
    }>;
    const page = hits.slice(0, limit);
    const lastSort = page.length > 0 ? page[page.length - 1]?.sort : undefined;
    const nextCursor =
      hits.length > limit && Array.isArray(lastSort)
        ? encodeCursor(lastSort)
        : undefined;
    return {
      hits: page.map((h) => ({
        id: (h as any)._id,
        ...(h as any)._source,
        ...(h.highlight && { highlight: h.highlight }),
      })),
      nextCursor,
    };
  }

  async searchPosts(q: string, limit: number, cursor?: string) {
    const client = this.es.getClient();
    if (!client) return { hits: [], nextCursor: undefined, total: undefined };
    const body: Record<string, unknown> = {
      index: "posts",
      query: {
        multi_match: {
          query: q,
          fields: ["caption", "hashtags", "autoTags"],
          fuzziness: "AUTO",
        },
      },
      size: limit + 1,
      sort: [{ createdAt: { order: "desc" } }, { postId: { order: "asc" } }],
      track_total_hits: TRACK_TOTAL_HITS_LIMIT,
      highlight: {
        fields: { caption: {} },
        pre_tags: ["<em>"],
        post_tags: ["</em>"],
      },
    };
    const after = cursor ? decodeCursor(cursor) : null;
    if (after && Array.isArray(after)) (body as any).search_after = after;
    const result = await client.search(body as any);
    const hits = (result.hits.hits || []) as Array<{
      _source: Record<string, unknown>;
      sort?: unknown[];
      highlight?: Record<string, string[]>;
    }>;
    const total =
      typeof result.hits.total === "object"
        ? (result.hits.total as { value: number }).value
        : result.hits.total;
    const page = hits.slice(0, limit);
    const lastSort = page.length > 0 ? page[page.length - 1]?.sort : undefined;
    const nextCursor =
      hits.length > limit && Array.isArray(lastSort)
        ? encodeCursor(lastSort)
        : undefined;
    return {
      hits: page.map((h) => ({
        id: (h as any)._id,
        ...(h as any)._source,
        ...(h.highlight && { highlight: h.highlight }),
      })),
      nextCursor,
      total: typeof total === "number" ? total : undefined,
    };
  }

  async searchHashtags(q: string, limit: number, cursor?: string) {
    const client = this.es.getClient();
    if (!client) return { hits: [], nextCursor: undefined };
    const body: Record<string, unknown> = {
      index: "hashtags",
      query: { prefix: { tag: q.replace(/^#/, "").toLowerCase() } },
      size: limit + 1,
      sort: [{ tag: { order: "asc" } }],
    };
    const after = cursor ? decodeCursor(cursor) : null;
    if (after && Array.isArray(after)) (body as any).search_after = after;
    const result = await client.search(body as any);
    const hits = (result.hits.hits || []) as Array<{
      _source: Record<string, unknown>;
      sort?: unknown[];
    }>;
    const page = hits.slice(0, limit);
    const lastSort = page.length > 0 ? page[page.length - 1]?.sort : undefined;
    const nextCursor =
      hits.length > limit && Array.isArray(lastSort)
        ? encodeCursor(lastSort)
        : undefined;
    return {
      hits: page.map((h) => (h as any)._source),
      nextCursor,
    };
  }

  private async searchUsersFallback(q: string, limit: number) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [{ username: { contains: q, mode: "insensitive" } }, { id: q }],
      },
      select: { id: true, username: true, avatar: true, createdAt: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return {
      hits: users.map((u) => ({
        id: u.id,
        username: u.username,
        ...(u.avatar != null && { avatar: u.avatar }),
        createdAt: u.createdAt.toISOString(),
      })),
      nextCursor: undefined,
    };
  }
}
