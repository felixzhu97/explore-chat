"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalSearchPage } from "@/src/presentation/components/pages/global-search-page";
import { FeedCommentsDialog } from "@/src/presentation/components/dialogs/feed-comments-dialog";
import { useAuth } from "@/src/presentation/hooks/use-auth";
import { useFeed } from "@/src/presentation/hooks/use-feed";
import { useNavigation } from "@/src/presentation/hooks/use-navigation";
import type { FeedPost } from "@/shared/types";
import { CenterColumn } from "../shell/shell-styles";

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
