export type NotificationType = "like" | "comment";

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

export interface INotificationRepository {
  upsertLike(
    recipientId: string,
    actorId: string,
    postId: string,
  ): Promise<NotificationItem | null>;
  deleteLike(actorId: string, postId: string): Promise<boolean>;
  insertComment(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    contentPreview?: string,
  ): Promise<NotificationItem | null>;
  deleteByCommentId(commentId: string): Promise<boolean>;
  findByRecipient(
    recipientId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ items: NotificationItem[]; nextCursor?: string }>;
  markRead(recipientId: string, id: string): Promise<boolean>;
  markReadMany(recipientId: string, ids: string[]): Promise<number>;
  markAllRead(recipientId: string): Promise<number>;
}
