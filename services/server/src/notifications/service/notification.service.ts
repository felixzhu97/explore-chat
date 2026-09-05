import { Inject, Injectable } from "@nestjs/common";
import type {
  NotificationRepository,
  NotificationItem,
} from "@/notifications/domain/repository/notification.repository";

@Injectable()
export class NotificationService {
  constructor(
    @Inject("NotificationRepository")
    private readonly repo: NotificationRepository,
  ) {}

  async list(recipientId: string, limit: number, cursor?: string) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    return this.repo.findByRecipient(recipientId, safeLimit, cursor);
  }

  async markRead(recipientId: string, id: string): Promise<boolean> {
    return this.repo.markRead(recipientId, id);
  }

  async markReadMany(recipientId: string, ids: string[]): Promise<number> {
    return this.repo.markReadMany(recipientId, ids);
  }

  async markAllRead(recipientId: string): Promise<number> {
    return this.repo.markAllRead(recipientId);
  }

  async upsertLike(
    recipientId: string,
    actorId: string,
    postId: string,
  ): Promise<NotificationItem | null> {
    return this.repo.upsertLike(recipientId, actorId, postId);
  }

  async deleteLike(actorId: string, postId: string): Promise<boolean> {
    return this.repo.deleteLike(actorId, postId);
  }

  async insertComment(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    content?: string,
  ): Promise<NotificationItem | null> {
    const preview =
      content && content.length > 120 ? content.slice(0, 120) : content;
    return this.repo.insertComment(
      recipientId,
      actorId,
      postId,
      commentId,
      preview,
    );
  }

  async deleteByCommentId(commentId: string): Promise<boolean> {
    return this.repo.deleteByCommentId(commentId);
  }
}
