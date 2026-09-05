import { Injectable } from "@nestjs/common";
import type {
  PostRow,
  CreatePostInput,
} from "@/post/domain/post.repository.interface";
import { PrismaService } from "./prisma.service";

export type {
  PostRow,
  CreatePostInput,
} from "@/post/domain/post.repository.interface";

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

function toRow(p: {
  id: string;
  userId: string;
  createdAt: Date;
  caption: string | null;
  type: string;
  mediaUrls: unknown;
  location: string | null;
  coverUrl: string | null;
}): PostRow {
  const media = Array.isArray(p.mediaUrls) ? (p.mediaUrls as string[]) : [];
  return {
    post_id: p.id,
    user_id: p.userId,
    created_at: p.createdAt,
    caption: p.caption,
    type: p.type,
    media_urls: media,
    location: p.location,
    cover_url: p.coverUrl,
  };
}

@Injectable()
export class CassandraPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertPost(input: CreatePostInput): Promise<void> {
    await this.prisma.socialPost.create({
      data: {
        id: input.postId,
        userId: input.userId,
        caption: input.caption,
        type: input.type,
        mediaUrls: input.mediaUrls ?? [],
        location: input.location ?? null,
        coverUrl: input.coverUrl ?? null,
      },
    });
  }

  async getPostById(postId: string): Promise<PostRow | null> {
    const p = await this.prisma.socialPost.findUnique({
      where: { id: postId },
    });
    return p ? toRow(p) : null;
  }

  async getPostsByUserId(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ rows: PostRow[]; pageState?: string }> {
    const cursor = decodePageState(pageState);
    const rows = await this.prisma.socialPost.findMany({
      where: {
        userId,
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.t } },
                { createdAt: cursor.t, id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const out: { rows: PostRow[]; pageState?: string } = {
      rows: page.map(toRow),
    };
    if (hasMore && page.length > 0) {
      const last = page[page.length - 1]!;
      out.pageState = encodePageState(last.createdAt, last.id);
    }
    return out;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const existing = await this.prisma.socialPost.findUnique({
      where: { id: postId },
    });
    if (!existing || existing.userId !== userId) return;
    await this.prisma.$transaction([
      this.prisma.postLike.deleteMany({ where: { postId } }),
      this.prisma.postSave.deleteMany({ where: { postId } }),
      this.prisma.postComment.deleteMany({ where: { postId } }),
      this.prisma.feedEntry.deleteMany({ where: { postId } }),
      this.prisma.activityNotification.deleteMany({ where: { postId } }),
      this.prisma.socialPost.delete({ where: { id: postId } }),
    ]);
  }
}
