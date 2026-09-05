export interface EngagementRepository {
  like(userId: string, postId: string): Promise<boolean>;
  unlike(userId: string, postId: string): Promise<boolean>;
  save(userId: string, postId: string): Promise<boolean>;
  unsave(userId: string, postId: string): Promise<boolean>;
  isLiked(userId: string, postId: string): Promise<boolean>;
  isSaved(userId: string, postId: string): Promise<boolean>;
  getEngagementCounts(
    postId: string,
  ): Promise<{ likeCount: number; commentCount: number; saveCount: number }>;
  getEngagementCountsBatch(
    postIds: string[],
  ): Promise<
    Map<string, { likeCount: number; commentCount: number; saveCount: number }>
  >;
  incrementCommentCount(postId: string): Promise<void>;
  decrementCommentCount(postId: string): Promise<void>;
}
