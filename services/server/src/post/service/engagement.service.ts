import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { EngagementRepository } from "@/post/domain/repository/engagement.repository";
import type { PostRepository } from "@/post/domain/repository/post.repository";
import { NotificationService } from "@/notifications/service/notification.service";
import { ChatGateway } from "@/websocket/presentation/chat.gateway";

@Injectable()
export class EngagementService {
  constructor(
    @Inject("EngagementRepository")
    private readonly engagementRepo: EngagementRepository,
    @Inject("PostRepository")
    private readonly postRepo: PostRepository,
    private readonly notificationService: NotificationService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async like(
    userId: string,
    postId: string,
  ): Promise<{
    postId: string;
    isLiked: boolean;
    likeCount: number;
    commentCount: number;
    saveCount: number;
  }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const already = await this.engagementRepo.isLiked(userId, postId);
    if (already) {
      const counts = await this.engagementRepo.getEngagementCounts(postId);
      return { postId, isLiked: true, ...counts };
    }
    const ok = await this.engagementRepo.like(userId, postId);
    if (ok && post.user_id !== userId) {
      const item = await this.notificationService.upsertLike(
        post.user_id,
        userId,
        postId,
      );
      if (item) this.chatGateway.emitNotification(post.user_id, item);
    }
    const counts = await this.engagementRepo.getEngagementCounts(postId);
    return { postId, isLiked: ok, ...counts };
  }

  async unlike(
    userId: string,
    postId: string,
  ): Promise<{
    postId: string;
    isLiked: boolean;
    likeCount: number;
    commentCount: number;
    saveCount: number;
  }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const ok = await this.engagementRepo.unlike(userId, postId);
    if (ok) await this.notificationService.deleteLike(userId, postId);
    const counts = await this.engagementRepo.getEngagementCounts(postId);
    return { postId, isLiked: false, ...counts };
  }

  async save(
    userId: string,
    postId: string,
  ): Promise<{
    postId: string;
    isSaved: boolean;
    likeCount: number;
    commentCount: number;
    saveCount: number;
  }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const already = await this.engagementRepo.isSaved(userId, postId);
    if (already) {
      const counts = await this.engagementRepo.getEngagementCounts(postId);
      return { postId, isSaved: true, ...counts };
    }
    const ok = await this.engagementRepo.save(userId, postId);
    const counts = await this.engagementRepo.getEngagementCounts(postId);
    return { postId, isSaved: ok, ...counts };
  }

  async unsave(
    userId: string,
    postId: string,
  ): Promise<{
    postId: string;
    isSaved: boolean;
    likeCount: number;
    commentCount: number;
    saveCount: number;
  }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.engagementRepo.unsave(userId, postId);
    const counts = await this.engagementRepo.getEngagementCounts(postId);
    return { postId, isSaved: false, ...counts };
  }

  async getEngagementCounts(postId: string) {
    return this.engagementRepo.getEngagementCounts(postId);
  }

  async isLiked(userId: string, postId: string): Promise<boolean> {
    return this.engagementRepo.isLiked(userId, postId);
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    return this.engagementRepo.isSaved(userId, postId);
  }
}
