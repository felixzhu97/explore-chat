"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { getApiClient } from "@/auth/api-client";
import { FeedApi, type PostDetailRes } from "@/feed/feed.api";
import type { FeedPost, SuggestedUser } from "@/shared/types";

const api = new FeedApi(getApiClient());

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return `${Math.floor(diff / 604800000)}周前`;
}

function toSuggestedUser(raw: {
  id: string;
  username: string;
  avatar: string | null;
  description: string;
}): SuggestedUser {
  return {
    id: raw.id,
    username: raw.username,
    avatar: raw.avatar ?? "",
    description: raw.description,
  };
}

const INITIAL_FEED_LIMIT = 3;
const LOAD_MORE_FEED_LIMIT = 5;

export function useFeed(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [followingByUserId, setFollowingByUserId] = useState<
    Record<string, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!currentUserId) return;
    if (pageState === undefined && !hasMore) return;
    setLoading(true);
    setError(null);
    const isInitial = pageState === undefined;
    const limit = isInitial ? INITIAL_FEED_LIMIT : LOAD_MORE_FEED_LIMIT;
    try {
      const { entries, pageState: next } = await api.getFeedGraphql(
        limit,
        pageState,
      );
      setHasMore(next != null && next !== "");
      setPageState(next ?? undefined);
      const details = entries
        .map((e) => ({ entry: e, post: e.post }))
        .filter((x) => x.post != null);
      const list: FeedPost[] = details.map(({ entry, post }) => {
        const p = post as PostDetailRes;
        const entryAny = entry as any;
        const autoTags = Array.isArray((p as any).autoTags)
          ? (p as any).autoTags
          : undefined;
        return {
          id: p.postId,
          userId: p.userId,
          username: p.username ?? p.userId?.slice(0, 8) ?? "",
          avatar: p.avatar ?? "/placeholder.svg?height=32&width=32",
          timestamp: formatTime(p.createdAt),
          imageUrl: p.mediaUrls?.[0] ?? "/placeholder.svg?height=600&width=600",
          likeCount: String(p.likeCount ?? 0),
          commentCount: String(p.commentCount ?? 0),
          caption: p.caption ?? "",
          isLiked: Boolean(p.isLiked),
          isSaved: Boolean(p.isSaved),
          isFollowing: false,
          type: p.type,
          videoUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
          coverImageUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
          mediaUrls: p.mediaUrls ?? [],
          ...(autoTags ? { autoTags } : {}),
          isSponsored: Boolean(entryAny.isSponsored),
          adAccountId: entryAny.adAccountId ?? undefined,
          adCampaignId: entryAny.adCampaignId ?? undefined,
          adGroupId: entryAny.adGroupId ?? undefined,
          adCreativeId: entryAny.adCreativeId ?? undefined,
        };
      });
      setPosts((prev) => {
        if (isInitial) return list;
        return uniqBy([...prev, ...list], "id");
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, pageState, hasMore]);

  const authorIds = useMemo(() => {
    const ids = compact(
      posts.map((p) =>
        typeof p.userId === "string" && p.userId.length > 0
          ? p.userId
          : undefined,
      ),
    );
    const unique = uniq(ids);
    return currentUserId ? unique.filter((id) => id !== currentUserId) : unique;
  }, [posts, currentUserId]);

  const authorIdsKey = useMemo(
    () => authorIds.slice().sort().join("|"),
    [authorIds],
  );

  useEffect(() => {
    if (!currentUserId) return;
    if (authorIds.length === 0) {
      setFollowingByUserId({});
      setPosts((prev) => prev.map((p) => ({ ...p, isFollowing: false })));
      return;
    }
    api
      .checkFollowingUsers(authorIds)
      .then((list) => {
        const map: Record<string, boolean> = {};
        for (const x of list) map[x.userId] = x.isFollowing;
        setFollowingByUserId(map);
        setPosts((prev) =>
          prev.map((p) => ({ ...p, isFollowing: map[p.userId] ?? false })),
        );
      })
      .catch(() => {
        setFollowingByUserId({});
      });
  }, [authorIdsKey, currentUserId]);

  const createPost = useCallback(
    async (
      caption: string,
      type: string = "TEXT",
      author?: { username?: string; avatar?: string },
      mediaFiles?: File[],
      coverFile?: File,
    ) => {
      if (!currentUserId) return;
      let uploadedMediaUrls: string[] = [];
      if (Array.isArray(mediaFiles) && mediaFiles.length > 0) {
        const uploaded = await Promise.all(
          mediaFiles.map((file) => api.uploadMedia(file, "posts")),
        );
        uploadedMediaUrls = uploaded
          .map((item) => item?.url)
          .filter(
            (url): url is string => typeof url === "string" && url.length > 0,
          );
      }
      let uploadedCoverUrl: string | undefined;
      if (coverFile != null) {
        const uploadedCover = await api.uploadMedia(coverFile, "covers");
        if (uploadedCover?.url) uploadedCoverUrl = uploadedCover.url;
      }
      const data = await api.createPost(
        caption,
        type,
        uploadedMediaUrls,
        uploadedCoverUrl,
      );
      if (data?.postId) {
        const p = await api.getPost(data.postId);
        if (p) {
          const newPost = mapDetailToFeedPost({
            ...p,
            postId: p.postId,
            username: author?.username ?? p.username,
            avatar: author?.avatar ?? p.avatar,
          });
          setPosts((prev) => [newPost, ...prev]);
        }
      }
    },
    [currentUserId],
  );

  const loadSuggestions = useCallback(async () => {
    if (!currentUserId) return;
    setSuggestionsLoading(true);
    try {
      const list = await api.getSuggestions(10);
      const mapped = (
        list as Array<{
          id: string;
          username: string;
          avatar: string | null;
          description: string;
        }>
      ).map(toSuggestedUser);
      setSuggestions(uniqBy(mapped, "id"));
    } finally {
      setSuggestionsLoading(false);
    }
  }, [currentUserId]);

  const followUser = useCallback(
    async (userId: string) => {
      if (!currentUserId || userId === currentUserId) return;
      const currentlyFollowing = followingByUserId[userId] === true;
      try {
        if (currentlyFollowing) {
          await api.unfollowUser(userId);
          setFollowingByUserId((prev) => ({ ...prev, [userId]: false }));
          setPosts((prev) =>
            prev.map((p) =>
              p.userId === userId ? { ...p, isFollowing: false } : p,
            ),
          );
        } else {
          await api.followUser(userId);
          setFollowingByUserId((prev) => ({ ...prev, [userId]: true }));
          setPosts((prev) =>
            prev.map((p) =>
              p.userId === userId ? { ...p, isFollowing: true } : p,
            ),
          );
        }
      } catch {
        return;
      }
    },
    [currentUserId, followingByUserId],
  );

  const unfollowUser = useCallback(
    async (userId: string) => {
      if (!currentUserId || userId === currentUserId) return;
      try {
        await api.unfollowUser(userId);
        setFollowingByUserId((prev) => ({ ...prev, [userId]: false }));
        setPosts((prev) =>
          prev.map((p) =>
            p.userId === userId ? { ...p, isFollowing: false } : p,
          ),
        );
      } catch {
        return;
      }
    },
    [currentUserId],
  );

  const followSuggestion = useCallback(
    async (userId: string) => {
      if (!currentUserId || userId === currentUserId) return;
      await api.followUser(userId);
      setFollowingByUserId((prev) => ({ ...prev, [userId]: true }));
      setPosts((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, isFollowing: true } : p,
        ),
      );
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
    },
    [currentUserId],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      const wasLiked = post?.isLiked ?? false;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const nextLiked = !wasLiked;
          const delta = nextLiked ? 1 : -1;
          return {
            ...p,
            isLiked: nextLiked,
            likeCount: String(Math.max(0, parseInt(p.likeCount, 10) + delta)),
          };
        }),
      );
      try {
        if (wasLiked) await api.unlikePost(postId);
        else await api.likePost(postId);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount }
              : p,
          ),
        );
      }
    },
    [posts],
  );

  const toggleSave = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      const wasSaved = post?.isSaved ?? false;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: !wasSaved } : p)),
      );
      try {
        if (wasSaved) await api.unsavePost(postId);
        else await api.savePost(postId);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isSaved: !p.isSaved } : p,
          ),
        );
      }
    },
    [posts],
  );

  const initialLoading = loading && posts.length === 0;
  const loadingMore = loading && posts.length > 0;

  return {
    posts,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    loadFeed,
    createPost,
    suggestions,
    suggestionsLoading,
    loadSuggestions,
    followUser,
    followSuggestion,
    unfollowUser,
    toggleLike,
    toggleSave,
  };
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:")) return /^data:video\//i.test(url);
  return VIDEO_EXT.test(url);
}

export function mapDetailToFeedPost(p: {
  postId: string;
  userId: string;
  username?: string;
  avatar?: string;
  createdAt: string;
  mediaUrls?: string[];
  coverUrl?: string;
  likeCount?: number;
  commentCount?: number;
  caption?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  type?: string;
  autoTags?: string[];
}): FeedPost {
  const urls = p.mediaUrls ?? [];
  const first = urls[0];
  const isVideoType =
    p.type === "VIDEO" || (first != null && isVideoUrl(first));
  let imageUrl = first ?? "/placeholder.svg?height=600&width=600";
  let videoUrl: string | undefined;
  let coverImageUrl: string | undefined;
  const storedCover =
    p.coverUrl != null && p.coverUrl !== "" ? p.coverUrl : undefined;

  if (isVideoType && first != null && isVideoUrl(first)) {
    videoUrl = first;
    const poster = storedCover ?? urls.find((u) => u && !isVideoUrl(u));
    if (poster) {
      coverImageUrl = poster;
      imageUrl = poster;
    } else {
      coverImageUrl = undefined;
      imageUrl = first;
    }
  }

  return {
    id: p.postId,
    userId: p.userId,
    username: p.username ?? p.userId?.slice(0, 8) ?? "",
    avatar: p.avatar ?? "/placeholder.svg?height=32&width=32",
    timestamp: formatTime(p.createdAt),
    imageUrl,
    likeCount: String(p.likeCount ?? 0),
    commentCount: String(p.commentCount ?? 0),
    caption: p.caption ?? "",
    isLiked: Boolean(p.isLiked),
    isSaved: Boolean(p.isSaved),
    type: p.type,
    videoUrl,
    coverImageUrl,
    ...(storedCover && { coverUrl: storedCover }),
    mediaUrls: urls,
    ...(Array.isArray(p.autoTags) &&
      p.autoTags.length > 0 && { autoTags: p.autoTags }),
  };
}

export function useExplore(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExplore = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const { entries } = await api.getExplore(20);
      const details = await Promise.all(
        entries.map((e: { postId: string }) =>
          api.getPost(e.postId).catch(() => null),
        ),
      );
      const list = details
        .filter(Boolean)
        .map((p: any) => mapDetailToFeedPost(p));
      setPosts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const toggleLike = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      const wasLiked = post?.isLiked ?? false;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const nextLiked = !wasLiked;
          const delta = nextLiked ? 1 : -1;
          return {
            ...p,
            isLiked: nextLiked,
            likeCount: String(Math.max(0, parseInt(p.likeCount, 10) + delta)),
          };
        }),
      );
      try {
        if (wasLiked) await api.unlikePost(postId);
        else await api.likePost(postId);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount }
              : p,
          ),
        );
      }
    },
    [posts],
  );

  const toggleSave = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      const wasSaved = post?.isSaved ?? false;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: !wasSaved } : p)),
      );
      try {
        if (wasSaved) await api.unsavePost(postId);
        else await api.savePost(postId);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isSaved: !p.isSaved } : p,
          ),
        );
      }
    },
    [posts],
  );

  return {
    posts,
    loading,
    error,
    loadExplore,
    toggleLike,
    toggleSave,
  };
}

export type PostComment = {
  id: string;
  userId: string;
  username?: string;
  content: string;
  createdAt: string;
};

export function usePostComments(postId: string | null) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const list = await api.getComments(postId, 50);
      setComments(
        list.map(
          (c: {
            id: string;
            userId: string;
            content: string;
            createdAt: string;
          }) => ({
            id: c.id,
            userId: c.userId,
            content: c.content,
            createdAt: c.createdAt,
          }),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const add = useCallback(
    async (content: string, author?: { userId: string; username?: string }) => {
      if (!postId) return;
      const optimisticId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimisticComment: PostComment = {
        id: optimisticId,
        userId: author?.userId ?? "",
        username: author?.username,
        content,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, optimisticComment]);
      try {
        const data = await api.addComment(postId, content);
        if (data?.id) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === optimisticId ? { ...c, id: data.id } : c,
            ),
          );
        }
      } catch (e) {
        setComments((prev) => prev.filter((c) => c.id !== optimisticId));
        throw e;
      }
    },
    [postId],
  );

  return { comments, loading, load, add };
}

export function useProfileStats(userId: string | undefined) {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const stats = await api.getProfileStats(userId);
      setFollowersCount(stats.followersCount);
      setFollowingCount(stats.followingCount);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { followersCount, followingCount, loading, load };
}
