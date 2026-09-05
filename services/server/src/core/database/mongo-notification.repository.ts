import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export type NotificationType = "like" | "comment";

export interface NotificationDoc {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId: string;
  commentId?: string;
  contentPreview?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId: string;
  commentId?: string;
  contentPreview?: string;
  createdAt: string;
  readAt?: string;
}

function docToItem(doc: {
  id: string;
  recipientId: string;
  actorId: string;
  type: string;
  postId: string;
  commentId: string | null;
  contentPreview: string | null;
  createdAt: Date;
  readAt: Date | null;
}): NotificationItem {
  const item: NotificationItem = {
    id: doc.id,
    recipientId: doc.recipientId,
    actorId: doc.actorId,
    type: doc.type as NotificationType,
    postId: doc.postId,
    createdAt: doc.createdAt.toISOString(),
  };
  if (doc.commentId != null) item.commentId = doc.commentId;
  if (doc.contentPreview != null) item.contentPreview = doc.contentPreview;
  if (doc.readAt != null) item.readAt = doc.readAt.toISOString();
  return item;
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ t: createdAt.getTime(), id }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(cursor: string): { t: number; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const o = JSON.parse(raw) as { t?: number; id?: string };
    if (typeof o.t !== "number" || typeof o.id !== "string") return null;
    return { t: o.t, id: o.id };
  } catch {
    return null;
  }
}

@Injectable()
export class MongoNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertLike(
    recipientId: string,
    actorId: string,
    postId: string,
  ): Promise<NotificationItem | null> {
    const existing = await this.prisma.activityNotification.findFirst({
      where: { recipientId, actorId, postId, type: "like" },
    });
    const now = new Date();
    const row = existing
      ? await this.prisma.activityNotification.update({
          where: { id: existing.id },
          data: { createdAt: now, readAt: null },
        })
      : await this.prisma.activityNotification.create({
          data: {
            recipientId,
            actorId,
            postId,
            type: "like",
            createdAt: now,
          },
        });
    return docToItem(row);
  }

  async deleteLike(actorId: string, postId: string): Promise<boolean> {
    const result = await this.prisma.activityNotification.deleteMany({
      where: { actorId, postId, type: "like" },
    });
    return result.count > 0;
  }

  async insertComment(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    contentPreview?: string,
  ): Promise<NotificationItem | null> {
    const row = await this.prisma.activityNotification.create({
      data: {
        recipientId,
        actorId,
        type: "comment",
        postId,
        commentId,
        ...(contentPreview !== undefined && { contentPreview }),
      },
    });
    return docToItem(row);
  }

  async deleteByCommentId(commentId: string): Promise<boolean> {
    const result = await this.prisma.activityNotification.deleteMany({
      where: { commentId, type: "comment" },
    });
    return result.count > 0;
  }

  async findByRecipient(
    recipientId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ items: NotificationItem[]; nextCursor?: string }> {
    const decoded = cursor ? decodeCursor(cursor) : null;
    const rows = await this.prisma.activityNotification.findMany({
      where: {
        recipientId,
        ...(decoded
          ? {
              OR: [
                { createdAt: { lt: new Date(decoded.t) } },
                {
                  createdAt: new Date(decoded.t),
                  id: { lt: decoded.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items = slice.map(docToItem);
    const out: { items: NotificationItem[]; nextCursor?: string } = { items };
    if (hasMore && slice.length > 0) {
      const last = slice[slice.length - 1]!;
      out.nextCursor = encodeCursor(last.createdAt, last.id);
    }
    return out;
  }

  async markRead(recipientId: string, id: string): Promise<boolean> {
    const result = await this.prisma.activityNotification.updateMany({
      where: { id, recipientId },
      data: { readAt: new Date() },
    });
    return result.count === 1;
  }

  async markReadMany(recipientId: string, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.prisma.activityNotification.updateMany({
      where: { recipientId, id: { in: ids } },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async markAllRead(recipientId: string): Promise<number> {
    const result = await this.prisma.activityNotification.updateMany({
      where: { recipientId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }
}
