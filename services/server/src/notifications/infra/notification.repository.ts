import { Injectable } from "@nestjs/common";
import type {
  NotificationRepository,
  NotificationItem,
} from "@/notifications/domain/repository/notification.repository";
import { MongoNotificationRepository as MongoNotificationStore } from "@/core/database/mongo-notification.repository";

@Injectable()
export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(private readonly impl: MongoNotificationStore) {}

  upsertLike(
    recipientId: string,
    actorId: string,
    postId: string,
  ): Promise<NotificationItem | null> {
    return this.impl.upsertLike(recipientId, actorId, postId);
  }

  deleteLike(actorId: string, postId: string): Promise<boolean> {
    return this.impl.deleteLike(actorId, postId);
  }

  insertComment(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    contentPreview?: string,
  ): Promise<NotificationItem | null> {
    return this.impl.insertComment(
      recipientId,
      actorId,
      postId,
      commentId,
      contentPreview,
    );
  }

  deleteByCommentId(commentId: string): Promise<boolean> {
    return this.impl.deleteByCommentId(commentId);
  }

  findByRecipient(
    recipientId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ items: NotificationItem[]; nextCursor?: string }> {
    return this.impl.findByRecipient(recipientId, limit, cursor);
  }

  markRead(recipientId: string, id: string): Promise<boolean> {
    return this.impl.markRead(recipientId, id);
  }

  markReadMany(recipientId: string, ids: string[]): Promise<number> {
    return this.impl.markReadMany(recipientId, ids);
  }

  markAllRead(recipientId: string): Promise<number> {
    return this.impl.markAllRead(recipientId);
  }
}
