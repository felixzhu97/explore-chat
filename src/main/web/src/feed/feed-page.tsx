"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { InstagramFeed } from "@/feed/components/instagram-feed";
import { InstagramRightSidebar } from "@/feed/components/instagram-right-sidebar";
import { StoryOverlay, type StorySlide } from "@/feed/components/story-overlay";
import { FeedCommentsDialog } from "@/feed/components/feed-comments-dialog";
import { useAuth } from "@/auth/use-auth";
import { useFeed } from "@/feed/use-feed";
import {
  useAnalytics,
  POST_VIEW,
  POST_LIKE,
  POST_SAVE,
} from "@chat/analytics";
import { useTranslation } from "@/src/shared/i18n";
import { mockUser } from "@/profile/users.service";
import type { FeedPost, StoryItem } from "@/shared/types";
import { CenterColumn, FloatingMessagesBtn } from "@/layout/shell-styles";

const SEEN_STORIES_KEY = "chat:seen_story_user_ids";

function getSeenStoryUserIdsFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_STORIES_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function FeedPage() {
  const router = useRouter();
  const analytics = useAnalytics();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const feed = useFeed(currentUser?.id);
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [seenStoryUserIds, setSeenStoryUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [storyOverlayIndex, setStoryOverlayIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (currentUser?.id) {
      feed.loadFeed();
      feed.loadSuggestions();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setSeenStoryUserIds(getSeenStoryUserIdsFromStorage());
  }, []);

  const handleUserClick = useCallback(
    (userId: string) => {
      if (!userId) return;
      router.push(`/profile/${userId}`);
    },
    [router],
  );

  const reelStories: StoryItem[] = useMemo(() => {
    if (feed.suggestions.length > 0) {
      return feed.suggestions.map((s) => ({
        id: s.id,
        userId: s.id,
        username: s.username,
        avatar: s.avatar || "/placeholder.svg?height=64&width=64",
        hasUnseen: false,
      }));
    }
    const seen = new Set<string>();
    return feed.posts
      .filter((p) => {
        if (seen.has(p.userId)) return false;
        seen.add(p.userId);
        return true;
      })
      .slice(0, 12)
      .map((p) => ({
        id: p.userId,
        userId: p.userId,
        username: p.username,
        avatar: p.avatar || "/placeholder.svg?height=64&width=64",
        hasUnseen: false,
      }));
  }, [feed.suggestions, feed.posts]);

  const storySlidesWithPost: StorySlide[] = useMemo(() => {
    return reelStories
      .filter((story) => feed.posts.some((p) => p.userId === story.userId))
      .map((story) => ({
        story,
        post: feed.posts.find((p) => p.userId === story.userId) ?? null,
      }))
      .filter((s): s is StorySlide => s.post !== null);
  }, [reelStories, feed.posts]);

  const displayStorySlides = useMemo(
    () =>
      storySlidesWithPost.filter((s) => !seenStoryUserIds.has(s.story.userId)),
    [storySlidesWithPost, seenStoryUserIds],
  );

  const displayStories: StoryItem[] = useMemo(
    () => displayStorySlides.map((s) => s.story),
    [displayStorySlides],
  );

  const handleStoryClick = useCallback(
    (story: StoryItem) => {
      const i = displayStorySlides.findIndex((s) => s.story.id === story.id);
      if (i >= 0) setStoryOverlayIndex(i);
    },
    [displayStorySlides],
  );

  const handleStoryOverlayClose = useCallback((viewedUserIds: string[]) => {
    setStoryOverlayIndex(null);
    setSeenStoryUserIds((prev) => {
      const next = new Set([...prev, ...viewedUserIds]);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            SEEN_STORIES_KEY,
            JSON.stringify([...next]),
          );
        } catch {
          /**/
        }
      }
      return next;
    });
  }, []);

  const trackAdClick = useCallback(
    (post: FeedPost) => {
      if (!post.isSponsored || !post.adAccountId || !post.adCampaignId) return;
      const positionInFeed = feed.posts.findIndex((p) => p.id === post.id);
      (analytics as { track: (event: string, props: object) => void }).track(
        "ad_click",
        {
          adAccountId: post.adAccountId,
          adCampaignId: post.adCampaignId,
          adGroupId: post.adGroupId,
          adCreativeId: post.adCreativeId,
          placement: "FEED",
          ...(positionInFeed >= 0 && { positionInFeed }),
        },
      );
    },
    [analytics, feed.posts],
  );

  return (
    <>
      <CenterColumn
        ref={feedScrollRef}
        style={{ overflow: "auto", scrollBehavior: "smooth" }}
      >
        <InstagramFeed
          stories={displayStories}
          posts={feed.posts}
          loading={feed.loading}
          initialLoading={feed.initialLoading}
          loadingMore={feed.loadingMore}
          error={feed.error}
          currentUser={currentUser ?? undefined}
          onStoryClick={handleStoryClick}
          onUserClick={handleUserClick}
          onCommentClick={(post) => {
            setCommentPost(post);
            if (post.isSponsored) {
              trackAdClick(post);
            } else {
              analytics.track(POST_VIEW, {
                postId: post.id,
                authorId: post.userId,
              });
            }
          }}
          onLikeClick={(post) => {
            feed.toggleLike(post.id);
            analytics.track(POST_LIKE, { postId: post.id });
          }}
          onSaveClick={(post) => {
            feed.toggleSave(post.id);
            analytics.track(POST_SAVE, { postId: post.id });
          }}
          scrollContainerRef={feedScrollRef}
          onLoadMore={feed.loadFeed}
          hasMore={feed.hasMore}
        />
        <FeedCommentsDialog
          post={commentPost}
          open={!!commentPost}
          onClose={() => setCommentPost(null)}
          currentUser={currentUser ?? undefined}
        />
      </CenterColumn>

      <InstagramRightSidebar
        user={currentUser ?? mockUser}
        suggestions={feed.suggestions}
        onFollow={currentUser?.id ? feed.followSuggestion : undefined}
        onUserClick={handleUserClick}
      />

      <FloatingMessagesBtn
        type="button"
        onClick={() => router.push("/messages")}
      >
        <Send size={20} />
        {t("nav.messages")}
      </FloatingMessagesBtn>

      {storyOverlayIndex !== null && displayStorySlides.length > 0 && (
        <StoryOverlay
          slides={displayStorySlides}
          initialIndex={storyOverlayIndex}
          onClose={handleStoryOverlayClose}
        />
      )}
    </>
  );
}
