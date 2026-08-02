"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { InstagramExploreGrid } from "@/src/presentation/components/instagram/instagram-explore-grid";
import { FeedCommentsDialog } from "@/src/presentation/components/dialogs/feed-comments-dialog";
import { useAuth } from "@/src/presentation/hooks/use-auth";
import { useExplore } from "@/src/presentation/hooks/use-feed";
import { useAnalytics, POST_VIEW } from "@whatschat/analytics";
import { useTranslation } from "@/src/shared/i18n";
import type { FeedPost } from "@/shared/types";
import { CenterColumn, FloatingMessagesBtn } from "../shell/shell-styles";

export function ExplorePage() {
  const router = useRouter();
  const analytics = useAnalytics();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const explore = useExplore(currentUser?.id);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    if (currentUser?.id) explore.loadExplore();
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
    <>
      <CenterColumn style={{ overflow: "auto", maxWidth: "none" }}>
        <InstagramExploreGrid
          posts={explore.posts}
          loading={explore.loading}
          error={explore.error}
          onPostClick={(post) => {
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
        />
        <FeedCommentsDialog
          post={commentPost}
          open={!!commentPost}
          onClose={() => setCommentPost(null)}
          currentUser={currentUser ?? undefined}
        />
      </CenterColumn>

      <FloatingMessagesBtn
        type="button"
        onClick={() => router.push("/messages")}
      >
        <Send size={20} />
        {t("nav.messages")}
      </FloatingMessagesBtn>
    </>
  );
}
