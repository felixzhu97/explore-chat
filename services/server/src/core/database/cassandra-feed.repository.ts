import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export interface FeedEntry {
  user_id: string;
  created_at: Date;
  post_id: string;
  author_id: string;
}

function encodePageState(createdAt: Date, postId: string): string {
  return Buffer.from(
    JSON.stringify({ t: createdAt.toISOString(), id: postId }),
    "utf8",
  ).toString("base64url");
}

function decodePageState(pageState?: string): { t: Date; id: string } | null {
  if (!pageState) return null;
  try {
    const raw = Buffer.from(pageState, "base64url").toString("utf8");
    const o = JSON.parse(raw) as { t?: string; id?: string };
    if (typeof o.t !== "string" || typeof o.id !== "string") return null;
    return { t: new Date(o.t), id: o.id };
  } catch {
    return null;
  }
}

@Injectable()
export class CassandraFeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertFeedEntry(
    followerUserId: string,
    authorId: string,
    postId: string,
    createdAt: Date,
  ): Promise<void> {
    await this.prisma.feedEntry.upsert({
      where: {
        userId_postId: { userId: followerUserId, postId },
      },
      create: {
        userId: followerUserId,
        authorId,
        postId,
        createdAt,
      },
      update: {
        authorId,
        createdAt,
      },
    });
  }

  async getFeedPage(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ entries: FeedEntry[]; pageState?: string }> {
    const cursor = decodePageState(pageState);
    const rows = await this.prisma.feedEntry.findMany({
      where: {
        userId,
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.t } },
                { createdAt: cursor.t, postId: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { postId: "asc" }],
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const entries: FeedEntry[] = page.map((row) => ({
      user_id: row.userId,
      created_at: row.createdAt,
      post_id: row.postId,
      author_id: row.authorId,
    }));
    const out: { entries: FeedEntry[]; pageState?: string } = { entries };
    if (hasMore && page.length > 0) {
      const last = page[page.length - 1]!;
      out.pageState = encodePageState(last.createdAt, last.postId);
    }
    return out;
  }
}
