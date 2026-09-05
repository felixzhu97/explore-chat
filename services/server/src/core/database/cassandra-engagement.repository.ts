import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class CassandraEngagementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async like(userId: string, postId: string): Promise<boolean> {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) return true;
    await this.prisma.$transaction([
      this.prisma.postLike.create({ data: { userId, postId } }),
      this.prisma.socialPost.updateMany({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return true;
  }

  async unlike(userId: string, postId: string): Promise<boolean> {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) return true;
    await this.prisma.$transaction([
      this.prisma.postLike.delete({
        where: { userId_postId: { userId, postId } },
      }),
      this.prisma.socialPost.updateMany({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return true;
  }

  async save(userId: string, postId: string): Promise<boolean> {
    const existing = await this.prisma.postSave.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) return true;
    await this.prisma.$transaction([
      this.prisma.postSave.create({ data: { userId, postId } }),
      this.prisma.socialPost.updateMany({
        where: { id: postId },
        data: { saveCount: { increment: 1 } },
      }),
    ]);
    return true;
  }

  async unsave(userId: string, postId: string): Promise<boolean> {
    const existing = await this.prisma.postSave.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) return true;
    await this.prisma.$transaction([
      this.prisma.postSave.delete({
        where: { userId_postId: { userId, postId } },
      }),
      this.prisma.socialPost.updateMany({
        where: { id: postId },
        data: { saveCount: { decrement: 1 } },
      }),
    ]);
    return true;
  }

  async isLiked(userId: string, postId: string): Promise<boolean> {
    const row = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return row != null;
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    const row = await this.prisma.postSave.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return row != null;
  }

  async getEngagementCounts(
    postId: string,
  ): Promise<{ likeCount: number; commentCount: number; saveCount: number }> {
    const post = await this.prisma.socialPost.findUnique({
      where: { id: postId },
      select: { likeCount: true, commentCount: true, saveCount: true },
    });
    if (!post) return { likeCount: 0, commentCount: 0, saveCount: 0 };
    return {
      likeCount: Math.max(0, post.likeCount),
      commentCount: Math.max(0, post.commentCount),
      saveCount: Math.max(0, post.saveCount),
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
    if (postIds.length === 0) return out;
    const posts = await this.prisma.socialPost.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        likeCount: true,
        commentCount: true,
        saveCount: true,
      },
    });
    for (const p of posts) {
      out.set(p.id, {
        likeCount: Math.max(0, p.likeCount),
        commentCount: Math.max(0, p.commentCount),
        saveCount: Math.max(0, p.saveCount),
      });
    }
    return out;
  }

  async incrementCommentCount(postId: string): Promise<void> {
    await this.prisma.socialPost.updateMany({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });
  }

  async decrementCommentCount(postId: string): Promise<void> {
    await this.prisma.socialPost.updateMany({
      where: { id: postId },
      data: { commentCount: { decrement: 1 } },
    });
  }

  async getLikedPostIds(
    userId: string,
    postIds: string[],
  ): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const rows = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(rows.map((r) => r.postId));
  }

  async getSavedPostIds(
    userId: string,
    postIds: string[],
  ): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const rows = await this.prisma.postSave.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(rows.map((r) => r.postId));
  }
}
