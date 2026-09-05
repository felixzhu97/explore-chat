"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstagramNav } from "@/layout/instagram-nav";
import { NotificationsSheet } from "@/layout/notifications-sheet";
import { SearchDrawer } from "@/layout/search-drawer";
import { CreatePostDialog } from "@/feed/components/create-post-dialog";
import { RealIncomingCall } from "@/calls/components/real-incoming-call";
import { RealCallInterface } from "@/calls/components/real-call-interface";
import { useSharedRealCall } from "./real-call-context";
import { useAuth } from "@/auth/use-auth";
import { useFeed } from "@/feed/use-feed";
import { useNavigation } from "@/layout/use-navigation";
import { useAnalytics, PAGE_VIEW, CALL_END } from "@whatschat/analytics";
import { mockUser } from "@/profile/users.service";
import { AppShell, FullscreenOverlay, ErrorToast } from "./shell-styles";
import { useActiveTab } from "./use-active-tab";

export function AuthenticatedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const analytics = useAnalytics();
  const { user: currentUser } = useAuth();
  const feed = useFeed(currentUser?.id);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const activeTab = useActiveTab(searchDrawerOpen);

  const {
    handleProfileClick,
    handleReelsClick,
    handleExploreClick,
    handleSearchPageClick,
    handleBackToChat,
  } = useNavigation();

  const {
    callState,
    localStream,
    remoteStream,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatDuration,
    error: callError,
  } = useSharedRealCall();

  useEffect(() => {
    analytics.track(PAGE_VIEW, { path: "/", title: "Chat" });
    if (currentUser?.id) analytics.identify(currentUser.id);
  }, [currentUser?.id, analytics]);

  useEffect(() => {
    if (currentUser?.id) {
      feed.loadSuggestions();
    }
  }, [currentUser?.id]);

  const handleUserClick = useCallback(
    (userId: string) => {
      if (!userId) return;
      router.push(`/profile/${userId}`);
    },
    [router],
  );

  const handleEndCallWrapper = () => {
    if (callState?.contactId) {
      analytics.track(CALL_END, {
        chatId: callState.contactId,
        callType: callState.callType,
        duration: callState.duration,
      });
    }
    endCall();
  };

  const centerContent = callState?.isActive ? (
    <RealCallInterface
      callState={callState}
      localStream={localStream as MediaStream | null}
      remoteStream={remoteStream as MediaStream | null}
      onEndCall={handleEndCallWrapper}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
      onToggleSpeaker={toggleSpeaker}
      formatDuration={formatDuration}
    />
  ) : (
    children
  );

  return (
    <AppShell>
      <InstagramNav
        user={currentUser ?? mockUser}
        activeTab={activeTab}
        onHomeClick={handleBackToChat}
        onMessagesClick={() => router.push("/messages")}
        onProfileClick={handleProfileClick}
        onReelsClick={handleReelsClick}
        onExploreClick={handleExploreClick}
        onSearchClick={handleSearchPageClick}
        onCreateClick={
          currentUser ? () => setShowCreatePostDialog(true) : undefined
        }
        onNotificationsClick={() => setNotificationsOpen(true)}
      />

      <SearchDrawer
        open={searchDrawerOpen}
        onOpenChange={setSearchDrawerOpen}
        onPostClick={() => {}}
        onUserClick={handleUserClick}
      />

      <NotificationsSheet
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        suggestions={feed.suggestions}
        onFollow={currentUser?.id ? feed.followSuggestion : undefined}
        onUserClick={handleUserClick}
      />

      {centerContent}

      {callState?.status === "ringing" && (
        <FullscreenOverlay>
          <RealIncomingCall
            callState={callState}
            onAnswer={answerCall}
            onDecline={endCall}
          />
        </FullscreenOverlay>
      )}

      {callError && <ErrorToast>{callError}</ErrorToast>}

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
    </AppShell>
  );
}
