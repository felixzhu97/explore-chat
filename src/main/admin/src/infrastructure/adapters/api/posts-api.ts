import { getApiClient } from "./api-client";
import type { ApiClient } from "./api-client";

export interface AdminPostRow extends Record<string, unknown> {
  postId: string;
  userId: string;
  type?: string;
  caption?: string;
  hashtags?: string[];
  autoTags?: string[];
  mediaUrls?: string[];
  coverUrl?: string | null;
  location?: string | null;
  createdAt: string;
  moderationStatus?: string;
  moderationCategories?: string[];
  moderationAt?: string | null;
  hidden?: boolean;
}

export interface AdminPostDetailData {
  post: Record<string, unknown>;
  engagement: { likeCount: number; commentCount: number; saveCount: number };
  comments: Array<{ id: string; userId: string; content: string; parentId?: string; createdAt: string }>;
}

export interface AdminModerationRecheckData {
  moderationStatus: string;
  moderationCategories: string[];
  moderationAt: string;
}

export interface AdminBatchDeleteResult {
  deleted: number;
  failed: string[];
}

export interface AdminBatchHideResult {
  hidden: number;
  failed: string[];
}

export function createAdminPostsApi(client: ApiClient) {
  return {
    listPosts(query: string) {
      return client.get<AdminPostRow[]>(`admin/list/posts?${query}`);
    },
    getPostDetail(postId: string) {
      return client.get<AdminPostDetailData>(`admin/posts/${postId}/detail`);
    },
    hidePost(postId: string) {
      return client.put(`admin/posts/${postId}/hide`);
    },
    unhidePost(postId: string) {
      return client.put(`admin/posts/${postId}/unhide`);
    },
    deletePost(postId: string) {
      return client.delete(`admin/posts/${postId}`);
    },
    recheckModeration(postId: string) {
      return client.post<AdminModerationRecheckData>(`admin/posts/${postId}/recheck-moderation`);
    },
    batchDelete(postIds: string[]) {
      return client.post<AdminBatchDeleteResult>("admin/posts/batch-delete", { postIds });
    },
    batchHide(postIds: string[]) {
      return client.post<AdminBatchHideResult>("admin/posts/batch-hide", { postIds });
    },
  };
}

export const adminPostsApi = createAdminPostsApi(getApiClient());
