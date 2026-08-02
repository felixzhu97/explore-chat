"use client";

import { useCallback, useEffect, useState } from "react";
import { InstagramReels } from "@/reels/components/instagram-reels";
import { FeedCommentsDialog } from "@/feed/components/feed-comments-dialog";
import { useAuth } from "@/auth/use-auth";
import { useFeed } from "@/feed/use-feed";
import {
  useAnalytics,
  POST_VIEW,
  POST_LIKE,
  POST_SAVE,
} from "@whatschat/analytics";
import type { FeedPost } from "@/shared/types";
import { CenterColumn } from "@/layout/shell-styles";

export function ReelsPage() {
  const analytics = useAnalytics();
  const { user: currentUser } = useAuth();
  const feed = useFeed(currentUser?.id);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    if (currentUser?.id) feed.loadFeed();
  }, [currentUser?.id]);

  const trackAdClick = useCallback(
    (post: FeedPost) => {
      if (!post.isSponsored || !post.adAccountId || !post.adCampaignId) return;
      (analytics as { track: (event: string, props: object) => void }).track(
        "ad_click",
        {
          adAccountId: post.adAccountId,
          adCampaignId: post.adCampaignId,
          adGroupId: post.adGroupId,
          adCreativeId: post.adCreativeId,
          placement: "FEED",
        },
      );
    },
    [analytics],
  );

  return (
    <CenterColumn style={{ overflow: "hidden" }}>
      <InstagramReels
        reels={feed.posts.filter((p) => p.type === "VIDEO")}
        loading={feed.loading}
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
        onFollow={feed.followUser}
        currentUserId={currentUser?.id}
        onLikeClick={(post) => {
          feed.toggleLike(post.id);
          analytics.track(POST_LIKE, { postId: post.id });
        }}
        onSaveClick={(post) => {
          feed.toggleSave(post.id);
          analytics.track(POST_SAVE, { postId: post.id });
        }}
      />
      <FeedCommentsDialog
        post={commentPost}
        open={!!commentPost}
        onClose={() => setCommentPost(null)}
        currentUser={currentUser ?? undefined}
      />
    </CenterColumn>
  );
}
