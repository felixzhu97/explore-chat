"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalSearchPage } from "@/search/global-search-page";
import { FeedCommentsDialog } from "@/feed/components/feed-comments-dialog";
import { useAuth } from "@/auth/use-auth";
import { useFeed } from "@/feed/use-feed";
import { useNavigation } from "@/layout/use-navigation";
import type { FeedPost } from "@/shared/types";
import { CenterColumn } from "@/layout/shell-styles";

export function SearchPageContainer() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const feed = useFeed(currentUser?.id);
  const { handleBackToChat } = useNavigation();
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  const handleUserClick = useCallback(
    (userId: string) => {
      if (!userId) return;
      router.push(`/profile/${userId}`);
    },
    [router],
  );

  return (
    <CenterColumn style={{ overflow: "auto" }}>
      <GlobalSearchPage
        variant="page"
        onBack={handleBackToChat}
        onUserClick={handleUserClick}
        onPostClick={(postId) => {
          const post = feed.posts.find((p) => p.id === postId);
          if (post) setCommentPost(post);
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
