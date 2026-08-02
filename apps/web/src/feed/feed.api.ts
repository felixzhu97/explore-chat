import type { SearchScope } from "@whatschat/shared-types";
import type { ApiClient } from "@/core/api-client";

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
    const res = await this.api.upload<{
      url: string;
      mimeType: string;
      size: number;
    }>("/media/upload", formData);
    return (res as { data?: { url?: string } }).data;
  }

  async getFeedGraphql(limit: number, pageState?: string) {
    const query = `query Feed($limit: Int, $pageState: String) {
      feed(limit: $limit, pageState: $pageState) {
        pageState
        entries {
          postId
          authorId
          createdAt
          isSponsored
          adAccountId
          adCampaignId
          adGroupId
          adCreativeId
          post {
            postId
            userId
            caption
            type
            mediaUrls
            coverUrl
            location
            createdAt
            username
            avatar
            likeCount
            commentCount
            saveCount
            isLiked
            isSaved
            autoTags
          }
        }
      }
    }`;
    const variables: { limit: number; pageState?: string } = { limit };
    if (pageState) variables.pageState = pageState;
    const res = await this.api.post<unknown>("/graphql", { query, variables });
    const body = res as {
      errors?: Array<{ message: string }>;
      data?: {
        feed?: {
          pageState?: string | null;
          entries?: Array<{ postId: string; post?: PostDetailRes | null }>;
        };
      };
    };
    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? "GraphQL error");
    }
    const feed = body.data?.feed;
    return {
      entries: Array.isArray(feed?.entries) ? feed.entries : [],
      pageState: feed?.pageState ?? undefined,
    };
  }

  async getFeed(limit: number, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<{
      entries?: FeedEntryRes[];
      pageState?: string;
    }>(`/posts/feed?${q}`);
    return {
      entries: Array.isArray((res as any).entries) ? (res as any).entries : [],
      pageState: (res as any).pageState,
    };
  }

  async getExplore(limit: number = 20, offset: number = 0) {
    const q = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const res = await this.api.get<{
      entries?: FeedEntryRes[];
      total?: number;
    }>(`/posts/explore?${q}`);
    return {
      entries: Array.isArray((res as any).entries) ? (res as any).entries : [],
      total: (res as any).total ?? 0,
    };
  }

  async getPost(postId: string) {
    const res = await this.api.get<PostDetailRes>(`/posts/${postId}`);
    return (res as { data?: PostDetailRes }).data;
  }

  async getPostsByUser(userId: string, limit: number = 24, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<unknown>(
      `/posts/user/${userId}?${q.toString()}`,
    );
    const r = res as unknown as { posts?: unknown[]; pageState?: string };
    const posts = Array.isArray(r.posts) ? r.posts : [];
    return {
      posts,
      pageState: r.pageState,
    };
  }

  async likePost(postId: string) {
    await this.api.post(`/posts/${postId}/like`);
  }

  async unlikePost(postId: string) {
    await this.api.delete(`/posts/${postId}/like`);
  }

  async savePost(postId: string) {
    await this.api.post(`/posts/${postId}/save`);
  }

  async unsavePost(postId: string) {
    await this.api.delete(`/posts/${postId}/save`);
  }

  async createPost(
    caption: string,
    type: string,
    mediaUrls?: string[],
    coverUrl?: string,
  ) {
    const res = await this.api.post<{
      postId: string;
      userId: string;
      createdAt: string;
    }>("/posts", {
      caption,
      type: type || "TEXT",
      ...(mediaUrls?.length && { mediaUrls }),
      ...(coverUrl != null && coverUrl !== "" && { coverUrl }),
    });
    return res.data;
  }

  async getComments(postId: string, page: number, limit: number) {
    const res = await this.api.get<CommentRes[]>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`,
    );
    return Array.isArray((res as any).data) ? (res as any).data : [];
  }

  async addComment(postId: string, content: string, parentId?: string) {
    const res = await this.api.post<{ id: string }>(
      `/posts/${postId}/comments`,
      {
        content,
        ...(parentId && { parentId }),
      },
    );
    return res.data;
  }

  async followUser(userId: string) {
    await this.api.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string) {
    await this.api.delete(`/users/${userId}/follow`);
  }

  async checkFollowingUsers(userIds: string[]) {
    const res = await this.api.post<{
      data: Array<{ userId: string; isFollowing: boolean }>;
    }>(`/users/following/check`, {
      userIds,
    });
    return res.data?.data ?? [];
  }

  async search(
    q: string,
    type: SearchScope,
    limit: number,
    cursor?: string,
  ): Promise<{ hits: unknown[]; nextCursor?: string; total?: number }> {
    const params = new URLSearchParams({
      q,
      type,
      limit: String(limit),
    });
    if (cursor) params.set("cursor", cursor);
    const res = await this.api.get<{
      hits: unknown[];
      nextCursor?: string;
      total?: number;
    }>(`/search?${params.toString()}`);
    const data = (
      res as { data?: { hits: unknown[]; nextCursor?: string; total?: number } }
    ).data;
    return {
      hits: Array.isArray(data?.hits) ? data.hits : [],
      ...(data?.nextCursor != null && { nextCursor: data.nextCursor }),
      ...(data?.total != null && { total: data.total }),
    };
  }

  async getSuggestions(limit: number = 10) {
    const res = await this.api.get<
      Array<{
        id: string;
        username: string;
        avatar: string | null;
        description: string;
      }>
    >(`/users/suggestions?limit=${limit}`);
    return Array.isArray((res as { data?: unknown }).data)
      ? (res as { data: unknown[] }).data
      : [];
  }

  async getFollowers(userId: string, limit: number = 20, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<{
      data?: Array<{
        id: string;
        username: string;
        avatar: string | null;
        isFollowing?: boolean;
      }>;
      total?: number;
      pageState?: string;
    }>(`/users/${userId}/followers?${q}`);
    const r = res as { data?: unknown[]; total?: number; pageState?: string };
    return {
      list: Array.isArray(r.data) ? r.data : [],
      total: r.total ?? 0,
      pageState: r.pageState,
    };
  }

  async getFollowing(userId: string, limit: number = 20, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<{
      data?: Array<{
        id: string;
        username: string;
        avatar: string | null;
        isFollowing?: boolean;
      }>;
      total?: number;
      pageState?: string;
    }>(`/users/${userId}/following?${q}`);
    const r = res as { data?: unknown[]; total?: number; pageState?: string };
    return {
      list: Array.isArray(r.data) ? r.data : [],
      total: r.total ?? 0,
      pageState: r.pageState,
    };
  }

  async getNotifications(limit: number = 20, cursor?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (cursor) q.set("cursor", cursor);
    const res = await this.api.get<{
      data?: { items?: NotificationItemRes[]; nextCursor?: string };
    }>(`/notifications?${q}`);
    const d = (
      res as { data?: { items?: NotificationItemRes[]; nextCursor?: string } }
    ).data;
    return {
      items: Array.isArray(d?.items) ? d.items : [],
      ...(d?.nextCursor != null &&
        d.nextCursor !== "" && { nextCursor: d.nextCursor }),
    };
  }

  async markNotificationRead(id: string) {
    await this.api.patch(`/notifications/${id}/read`, {});
  }

  async markNotificationsRead(ids: string[]) {
    await this.api.post("/notifications/read", { ids });
  }

  async markAllNotificationsRead() {
    await this.api.post("/notifications/read-all", {});
  }

  async getProfileStats(
    userId: string,
  ): Promise<{ followersCount: number; followingCount: number }> {
    const res = await this.api.get<{
      followersCount?: number;
      followingCount?: number;
    }>(`/users/${userId}`);
    const d = (
      res as { data?: { followersCount?: number; followingCount?: number } }
    ).data;
    return {
      followersCount: d?.followersCount ?? 0,
      followingCount: d?.followingCount ?? 0,
    };
  }
}
