"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfilePage } from "@/src/presentation/components/pages/profile-page";
import { FeedCommentsDialog } from "@/src/presentation/components/dialogs/feed-comments-dialog";
import { FollowListModal } from "@/src/presentation/components/dialogs/follow-list-modal";
import { CreatePostDialog } from "@/src/presentation/components/dialogs/create-post-dialog";
import type {
  FollowListItem,
  IFollowListService,
} from "@/src/presentation/components/dialogs/dialog-services.types";
import { useAuth } from "@/src/presentation/hooks/use-auth";
import { useFeed, useProfileStats } from "@/src/presentation/hooks/use-feed";
import { useUserProfileView } from "@/src/presentation/hooks/use-user-profile-view";
import { useNavigation } from "@/src/presentation/hooks/use-navigation";
import { FeedApiAdapter } from "@/infrastructure/adapters/api/feed-api.adapter";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";
import type { FeedPost } from "@/shared/types";
import { CenterColumn } from "../shell/shell-styles";

export function ProfilePageContainer({
  profileUserId,
}: {
  profileUserId?: string;
}) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const feed = useFeed(currentUser?.id);
  const viewedUserId = profileUserId ?? currentUser?.id;
  const isSelfProfile =
    viewedUserId != null && currentUser?.id === viewedUserId;
  const profileStats = useProfileStats(viewedUserId);
  const otherUserProfile = useUserProfileView(viewedUserId, !isSelfProfile);
  const { handleSettingsClick } = useNavigation();
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [followListModal, setFollowListModal] = useState<
    "followers" | "following" | null
  >(null);

  useEffect(() => {
    if (viewedUserId) profileStats.load();
  }, [viewedUserId, profileStats.load]);

  const handleUserClick = useCallback(
    (userId: string) => {
      if (!userId) return;
      router.push(`/profile/${userId}`);
    },
    [router],
  );

  const apiClient = useMemo(() => getApiClient(), []);
  const feedApi = useMemo(() => new FeedApiAdapter(apiClient), [apiClient]);
  const followListService = useMemo(
    (): IFollowListService => ({
      getFollowers: (userId, limit, pageState) =>
        feedApi.getFollowers(userId, limit, pageState).then((r) => ({
          list: r.list as FollowListItem[],
          pageState: r.pageState,
        })),
      getFollowing: (userId, limit, pageState) =>
        feedApi.getFollowing(userId, limit, pageState).then((r) => ({
          list: r.list as FollowListItem[],
          pageState: r.pageState,
        })),
    }),
    [feedApi],
  );

  return (
    <CenterColumn style={{ overflow: "auto" }}>
      <ProfilePage
        user={isSelfProfile ? (currentUser ?? null) : otherUserProfile.user}
        posts={isSelfProfile ? feed.posts : otherUserProfile.posts}
        followersCount={profileStats.followersCount}
        followingCount={profileStats.followingCount}
        onEditProfile={isSelfProfile ? handleSettingsClick : undefined}
        onNewPost={
          isSelfProfile ? () => setShowCreatePostDialog(true) : undefined
        }
        onPostClick={setCommentPost}
        onFollowersClick={() => setFollowListModal("followers")}
        onFollowingClick={() => setFollowListModal("following")}
      />
      <FeedCommentsDialog
        post={commentPost}
        open={!!commentPost}
        onClose={() => setCommentPost(null)}
        currentUser={currentUser ?? undefined}
      />
      <FollowListModal
        open={followListModal !== null}
        onClose={() => {
          setFollowListModal(null);
          profileStats.load();
        }}
        title={followListModal ?? "followers"}
        userId={viewedUserId ?? ""}
        currentUserId={currentUser?.id}
        onFollow={feed.followUser}
        onUnfollow={feed.unfollowUser}
        followListService={followListService}
        onUserClick={handleUserClick}
      />
      {isSelfProfile && (
        <CreatePostDialog
          open={showCreatePostDialog}
          onClose={() => setShowCreatePostDialog(false)}
          onSubmit={async (caption, mediaFiles, type, coverFile) => {
            await feed.createPost(
              caption,
              type ?? (mediaFiles?.length ? "IMAGE" : "TEXT"),
              {
                username: currentUser?.username,
                avatar: currentUser?.avatar,
              },
              mediaFiles,
              coverFile,
            );
          }}
          currentUser={currentUser ?? undefined}
        />
      )}
    </CenterColumn>
  );
}
