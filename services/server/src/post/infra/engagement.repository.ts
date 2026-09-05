import { Injectable } from "@nestjs/common";
import type { EngagementRepository } from "@/post/domain/repository/engagement.repository";
import { CassandraEngagementRepository as CassandraEngagementStore } from "@/core/database/cassandra-engagement.repository";

@Injectable()
export class EngagementRepositoryImpl implements EngagementRepository {
  constructor(private readonly impl: CassandraEngagementStore) {}

  like(userId: string, postId: string): Promise<boolean> {
    return this.impl.like(userId, postId);
  }

  unlike(userId: string, postId: string): Promise<boolean> {
    return this.impl.unlike(userId, postId);
  }

  save(userId: string, postId: string): Promise<boolean> {
    return this.impl.save(userId, postId);
  }

  unsave(userId: string, postId: string): Promise<boolean> {
    return this.impl.unsave(userId, postId);
  }

  isLiked(userId: string, postId: string): Promise<boolean> {
    return this.impl.isLiked(userId, postId);
  }

  isSaved(userId: string, postId: string): Promise<boolean> {
    return this.impl.isSaved(userId, postId);
  }

  getEngagementCounts(postId: string): Promise<{
    likeCount: number;
    commentCount: number;
    saveCount: number;
  }> {
    return this.impl.getEngagementCounts(postId);
  }

  getEngagementCountsBatch(
    postIds: string[],
  ): Promise<
    Map<string, { likeCount: number; commentCount: number; saveCount: number }>
  > {
    return this.impl.getEngagementCountsBatch(postIds);
  }

  incrementCommentCount(postId: string): Promise<void> {
    return this.impl.incrementCommentCount(postId);
  }

  decrementCommentCount(postId: string): Promise<void> {
    return this.impl.decrementCommentCount(postId);
  }
}
