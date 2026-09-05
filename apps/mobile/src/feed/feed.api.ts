import { SearchScopes } from "@whatschat/shared-types";
import type { HttpClient } from "@/core/api-client";
import type { FeedPost } from "@/feed/feed-post.model";
import type { StoryUser } from "@/feed/story-user.model";
import type { UserProfile } from "@/profile/user-profile.model";
import compact from "lodash/compact";
import keyBy from "lodash/keyBy";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { mapFeedPostResToFeedPost, type FeedPostRes } from "@/feed/feed.mapper";

interface FeedGraphqlBody {
  errors?: Array<{ message?: string }>;
  data?: {
    feed?: {
      pageState?: string | null;
      entries?: Array<{ postId: string; post?: FeedPostRes | null }>;
    };
    reels?: {
      pageState?: string | null;
      entries?: Array<{ postId: string; post?: FeedPostRes | null }>;
    };
  };
}

export class FeedApi {
  constructor(private readonly http: HttpClient) {}

  async getFeed(
    limit: number,
    pageState?: string,
  ): Promise<{
    posts: FeedPost[];
    nextPageState?: string;
  }> {
    const query = `query Feed($limit: Int, $pageState: String) {
      feed(limit: $limit, pageState: $pageState) {
        pageState
        entries {
          postId
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
    const feedGraphRes = await this.http.post<FeedGraphqlBody>("/graphql", {
      query,
      variables,
    });
    const body = feedGraphRes.data;
    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? "GraphQL error");
    }
    const feed = body.data?.feed;
    const entries = Array.isArray(feed?.entries) ? feed?.entries : [];
    const posts = entries
      .map((e) => e.post)
      .filter((p): p is FeedPostRes => p != null)
      .map(mapFeedPostResToFeedPost);
    const next = feed?.pageState ?? undefined;
    return {
      posts,
      nextPageState: next && next !== "" ? next : undefined,
    };
  }

  async getReels(
    limit: number,
    pageState?: string,
  ): Promise<{
    posts: FeedPost[];
    nextPageState?: string;
  }> {
    const query = `query Reels($limit: Int, $pageState: String) {
      reels(limit: $limit, pageState: $pageState) {
        pageState
        entries {
          postId
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
    const reelsGraphRes = await this.http.post<FeedGraphqlBody>("/graphql", {
      query,
      variables,
    });
    const body = reelsGraphRes.data;
    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? "GraphQL error");
    }
    const reels = body.data?.reels;
    const entries = Array.isArray(reels?.entries) ? reels?.entries : [];
    const posts = entries
      .map((e) => e.post)
      .filter((p): p is FeedPostRes => p != null)
      .map(mapFeedPostResToFeedPost);
    const next = reels?.pageState ?? undefined;
    return {
      posts,
      nextPageState: next && next !== "" ? next : undefined,
    };
  }

  async getSuggestions(limit: number): Promise<StoryUser[]> {
    const suggestionsRes = await this.http.get<{
      users?: Array<{
        id: string;
        username: string;
        avatar: string | null;
        description: string;
      }>;
    }>(`/users/suggestions?page_size=${limit}`);
    const list = Array.isArray(suggestionsRes.data?.users)
      ? suggestionsRes.data.users
      : [];
    return uniqBy(
      list.filter((u) => Boolean(u.id)),
      "id",
    ).map<StoryUser>((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar ?? "",
    }));
  }

  async getPostById(postId: string): Promise<FeedPost | null> {
    try {
      const postRes = await this.http.get<FeedPostRes>(`/posts/${postId}`);
      const raw = postRes.data;
      if (!raw?.postId) return null;
      const createdAt =
        typeof raw.createdAt === "string"
          ? raw.createdAt
          : raw.createdAt != null
            ? String(raw.createdAt)
            : "";
      return mapFeedPostResToFeedPost({ ...(raw as FeedPostRes), createdAt });
    } catch {
      return null;
    }
  }

  async getExplore(
    limit: number,
    pageToken?: string,
  ): Promise<{
    posts: FeedPost[];
    total: number;
    fetchedEntryCount: number;
    nextPageToken?: string;
  }> {
    const params = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) params.set("page_token", pageToken);
    const exploreRes = await this.http.get<{
      entries?: Array<{ postId: string; isSponsored?: boolean }>;
      total_size?: number;
      next_page_token?: string;
    }>(`/posts/explore?${params.toString()}`);
    const top = exploreRes.data;
    const rawEntries = Array.isArray(top.entries) ? top.entries : [];
    const filtered = rawEntries.filter((e) => !e.isSponsored);
    const entries = filtered.length > 0 ? filtered : rawEntries;
    const total = typeof top.total_size === "number" ? top.total_size : 0;
    const postIds = entries.map((e) => e.postId).filter(Boolean);
    const details = await Promise.all(
      postIds.map((id) => this.getPostById(id)),
    );
    const posts = details.filter((p): p is FeedPost => p != null);
    return {
      posts,
      total,
      fetchedEntryCount: rawEntries.length,
      nextPageToken: top.next_page_token,
    };
  }

  async searchPosts(
    q: string,
    limit: number,
    pageToken?: string,
  ): Promise<{ posts: FeedPost[]; nextCursor?: string; total?: number }> {
    const trimmed = q.trim();
    if (!trimmed) return { posts: [] };
    const params = new URLSearchParams({
      q: trimmed,
      type: SearchScopes.Posts,
      page_size: String(limit),
    });
    if (pageToken) params.set("page_token", pageToken);
    const searchRes = await this.http.get<{
      hits?: unknown[];
      next_page_token?: string;
      total_size?: number;
    }>(`/search?${params.toString()}`);
    const payload = searchRes.data;
    const hits = Array.isArray(payload?.hits) ? payload.hits : [];
    const nextCursor = payload?.next_page_token;
    const total = payload?.total_size;
    const orderedIds = hits
      .map((h) => {
        const o = h as Record<string, unknown>;
        return String(o.postId ?? o.id ?? "");
      })
      .filter(Boolean);
    const unique = uniq(orderedIds);
    const loaded = await Promise.all(unique.map((id) => this.getPostById(id)));
    const byId = keyBy(compact(loaded), "id");
    const posts = compact(orderedIds.map((id) => byId[id]));
    return { posts, nextCursor, total };
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileRes = await this.http.get<UserProfile>(`/users/${userId}`);
      const u = profileRes.data;
      if (!u || typeof u !== "object") return null;
      return u as UserProfile;
    } catch {
      return null;
    }
  }

  async getUserPosts(
    userId: string,
    limit: number,
    pageToken?: string,
  ): Promise<{ posts: FeedPost[]; nextPageState?: string }> {
    const params = new URLSearchParams({ page_size: String(limit) });
    if (pageToken) params.set("page_token", pageToken);
    const userPostsRes = await this.http.get<{
      posts?: FeedPostRes[];
      next_page_token?: string | null;
    }>(`/posts/user/${userId}?${params.toString()}`);
    const body = userPostsRes.data;
    const rawPosts = Array.isArray(body.posts) ? body.posts : [];
    const next = body.next_page_token;
    const posts = rawPosts.map((r) => {
      const createdAt =
        typeof r.createdAt === "string"
          ? r.createdAt
          : r.createdAt != null
            ? String(r.createdAt)
            : "";
      return mapFeedPostResToFeedPost({ ...(r as FeedPostRes), createdAt });
    });
    return {
      posts,
      nextPageState: next && next !== "" ? String(next) : undefined,
    };
  }
}
