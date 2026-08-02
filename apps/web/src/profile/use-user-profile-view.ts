"use client";

import { useCallback, useEffect, useState } from "react";
import { FeedApi } from "@/feed/feed.api";
import { getApiClient } from "@/core/api-client";
import type { FeedPost } from "@/src/shared/types";
import { mapDetailToFeedPost } from "@/feed/use-feed";
import { getUsersService } from "@/profile/users.service";

const feedApi = new FeedApi(getApiClient());
const usersService = getUsersService();

export type ViewedUserProfile = {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
} | null;

type PostRow = {
  postId: string;
  userId: string;
  createdAt: string;
  caption: string;
  type: string;
  mediaUrls?: string[];
  location?: string;
  coverUrl?: string;
};

export function useUserProfileView(
  userId: string | undefined,
  enabled: boolean,
) {
  const [user, setUser] = useState<ViewedUserProfile>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await usersService.getUserById(userId);
      if (!profile) {
        setUser(null);
        setPosts([]);
        return;
      }

      const res = await feedApi.getPostsByUser(userId, 48);
      const rows = Array.isArray(res.posts) ? (res.posts as PostRow[]) : [];
      const mapped = rows.map((p) =>
        mapDetailToFeedPost({
          postId: p.postId,
          userId: p.userId,
          createdAt: p.createdAt,
          caption: p.caption,
          type: p.type,
          mediaUrls: p.mediaUrls ?? [],
          coverUrl: p.coverUrl,
          username: profile.username,
          avatar: profile.avatar,
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          isSaved: false,
        }),
      );

      setUser({
        id: profile.id,
        username: profile.username,
        name: profile.name,
        avatar: profile.avatar,
      });
      setPosts(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { user, posts, loading, error, reload: load };
}
