import type { SearchScope } from "@chat/shared-types";
import type { ApiClient } from "@/auth/api-client";

export interface FeedEntryRes {
  postId: string;
  authorId: string;
  createdAt: string;
}

export interface PostDetailRes {
  postId: string;
  userId: string;
  caption: string;
  type: string;
  mediaUrls?: string[];
  coverUrl?: string;
  location?: string;
  createdAt: string;
  username?: string;
  avatar?: string;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface CommentRes {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItemRes {
  id: string;
  recipientId: string;
  actorId: string;
  type: "like" | "comment";
  postId: string;
  commentId?: string;
  contentPreview?: string;
  createdAt: string;
  readAt?: string;
}

export class FeedApi {
  constructor(private api: ApiClient) {}

  async uploadMedia(file: File, folder: "posts" | "covers" = "posts") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return this.api.upload<{
      url: string;
      mimeType: string;
      size: number;
    }>("/media/upload", formData);
  }

  async getFeedGraphql(limit: number, pageState?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageState) q.set("page_token", pageState);
    const res = await this.api.get<{
      entries?: Array<{ postId: string; post?: PostDetailRes | null }>;
      next_page_token?: string;
    }>(`/posts/feed?${q}`);
    return {
      entries: Array.isArray(res.entries) ? res.entries : [],
      pageState: res.next_page_token,
    };
  }

  async getFeed(limit: number, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      entries?: FeedEntryRes[];
      next_page_token?: string;
    }>(`/posts/feed?${q}`);
    return {
      entries: Array.isArray(res.entries) ? res.entries : [],
      pageState: res.next_page_token,
    };
  }

  async getExplore(limit: number = 20, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      entries?: FeedEntryRes[];
      total_size?: number;
      next_page_token?: string;
    }>(`/posts/explore?${q}`);
    return {
      entries: Array.isArray(res.entries) ? res.entries : [],
      total: res.total_size ?? 0,
      pageState: res.next_page_token,
    };
  }

  async getPost(postId: string) {
    return this.api.get<PostDetailRes>(`/posts/${postId}`);
  }

  async getPostsByUser(userId: string, limit: number = 24, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      posts?: unknown[];
      next_page_token?: string;
    }>(`/posts/user/${userId}?${q.toString()}`);
    return {
      posts: Array.isArray(res.posts) ? res.posts : [],
      pageState: res.next_page_token,
    };
  }

  async likePost(postId: string) {
    await this.api.post(`/posts/${postId}:like`);
  }

  async unlikePost(postId: string) {
    await this.api.post(`/posts/${postId}:unlike`);
  }

  async savePost(postId: string) {
    await this.api.post(`/posts/${postId}:save`);
  }

  async unsavePost(postId: string) {
    await this.api.post(`/posts/${postId}:unsave`);
  }

  async createPost(
    caption: string,
    type: string,
    mediaUrls?: string[],
    coverUrl?: string,
  ) {
    return this.api.post<{
      postId: string;
      userId: string;
      createdAt: string;
    }>("/posts", {
      caption,
      type: type || "TEXT",
      ...(mediaUrls?.length && { mediaUrls }),
      ...(coverUrl != null && coverUrl !== "" && { coverUrl }),
    });
  }

  async getComments(postId: string, pageSize: number, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(pageSize) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      comments?: CommentRes[];
      next_page_token?: string;
    }>(`/posts/${postId}/comments?${q}`);
    return Array.isArray(res.comments) ? res.comments : [];
  }

  async addComment(postId: string, content: string, parentId?: string) {
    return this.api.post<{ id: string }>(`/posts/${postId}/comments`, {
      content,
      ...(parentId && { parentId }),
    });
  }

  async followUser(userId: string) {
    await this.api.post(`/users/${userId}:follow`);
  }

  async unfollowUser(userId: string) {
    await this.api.post(`/users/${userId}:unfollow`);
  }

  async checkFollowingUsers(userIds: string[]) {
    const res = await this.api.post<{
      results: Array<{ userId: string; isFollowing: boolean }>;
    }>(`/users/following:check`, {
      userIds,
    });
    return Array.isArray(res.results) ? res.results : [];
  }

  async search(
    q: string,
    type: SearchScope,
    limit: number,
    pageToken?: string,
  ): Promise<{ hits: unknown[]; nextCursor?: string; total?: number }> {
    const params = new URLSearchParams({
      q,
      type,
      page_size: String(limit),
    });
    if (pageToken) params.set("page_token", pageToken);
    const res = await this.api.get<{
      hits?: unknown[];
      next_page_token?: string;
      total_size?: number;
    }>(`/search?${params.toString()}`);
    return {
      hits: Array.isArray(res.hits) ? res.hits : [],
      ...(res.next_page_token != null && { nextCursor: res.next_page_token }),
      ...(res.total_size != null && { total: res.total_size }),
    };
  }

  async getSuggestions(limit: number = 10) {
    const res = await this.api.get<{
      users?: Array<{
        id: string;
        username: string;
        avatar: string | null;
        description: string;
      }>;
    }>(`/users/suggestions?page_size=${limit}`);
    return Array.isArray(res.users) ? res.users : [];
  }

  async getFollowers(userId: string, limit: number = 20, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      users?: Array<{
        id: string;
        username: string;
        avatar: string | null;
        isFollowing?: boolean;
      }>;
      total_size?: number;
      next_page_token?: string;
    }>(`/users/${userId}/followers?${q}`);
    return {
      list: Array.isArray(res.users) ? res.users : [],
      total: res.total_size ?? 0,
      pageState: res.next_page_token,
    };
  }

  async getFollowing(userId: string, limit: number = 20, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      users?: Array<{
        id: string;
        username: string;
        avatar: string | null;
        isFollowing?: boolean;
      }>;
      total_size?: number;
      next_page_token?: string;
    }>(`/users/${userId}/following?${q}`);
    return {
      list: Array.isArray(res.users) ? res.users : [],
      total: res.total_size ?? 0,
      pageState: res.next_page_token,
    };
  }

  async getNotifications(limit: number = 20, pageToken?: string) {
    const q = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) q.set("page_token", pageToken);
    const res = await this.api.get<{
      notifications?: NotificationItemRes[];
      next_page_token?: string;
    }>(`/notifications?${q}`);
    return {
      items: Array.isArray(res.notifications) ? res.notifications : [],
      ...(res.next_page_token != null &&
        res.next_page_token !== "" && { nextCursor: res.next_page_token }),
    };
  }

  async markNotificationRead(id: string) {
    await this.api.post(`/notifications/${id}:read`, {});
  }

  async markNotificationsRead(ids: string[]) {
    await this.api.post("/notifications/read:batch", { ids });
  }

  async markAllNotificationsRead() {
    await this.api.post("/notifications/read:all", {});
  }

  async getProfileStats(
    userId: string,
  ): Promise<{ followersCount: number; followingCount: number }> {
    const res = await this.api.get<{
      followersCount?: number;
      followingCount?: number;
    }>(`/users/${userId}`);
    return {
      followersCount: res.followersCount ?? 0,
      followingCount: res.followingCount ?? 0,
    };
  }
}
