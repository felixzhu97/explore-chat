"use client";

import type React from "react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Sidebar } from "../common/sidebar";
import { InstagramMessagesSidebar } from "../instagram/instagram-messages-sidebar";
import { InstagramMessagesEmpty } from "../instagram/instagram-messages-empty";
import { ChatArea } from "../chat/chat-area";
import { WelcomeScreen } from "../pages/welcome-screen";
import { ProfilePage } from "../pages/profile-page";
import { InstagramNav } from "../instagram/instagram-nav";
import { InstagramFeed } from "../instagram/instagram-feed";
import { InstagramExploreGrid } from "../instagram/instagram-explore-grid";
import { InstagramReels } from "../instagram/instagram-reels";
import { InstagramRightSidebar } from "../instagram/instagram-right-sidebar";
import { StoryOverlay, type StorySlide } from "../instagram/story-overlay";
import { NotificationsSheet } from "../instagram/notifications-sheet";
import { CallsPage } from "../pages/calls-page";
import { StatusPage } from "../pages/status-page";
import { StarredMessagesPage } from "../pages/starred-messages-page";
import { MessageSearchPage } from "../pages/message-search-page";
import { SearchDrawer } from "../instagram/search-drawer";
import { GlobalSearchPage } from "../pages/global-search-page";
import { SettingsPage } from "../pages/settings-page";
import { CreateGroupDialog } from "../dialogs/create-group-dialog";
import { AddFriendDialog } from "../dialogs/add-friend-dialog";
import { AdvancedSearchDialog } from "../dialogs/advanced-search-dialog";
import { VideoGenerateDialog } from "../dialogs/video-generate-dialog";
import { TextGenerateDialog } from "../dialogs/text-generate-dialog";
import { ImageGenerateDialog } from "../dialogs/image-generate-dialog";
import { VoiceGenerateDialog } from "../dialogs/voice-generate-dialog";
import { RealIncomingCall } from "../call/real-incoming-call";
import { RealCallInterface } from "../call/real-call-interface";
import { useRealCall } from "../../hooks/use-real-call";
import { useMessages } from "../../hooks/use-messages";
import {
  useAnalytics,
  PAGE_VIEW,
  CHAT_OPEN,
  SEND_MESSAGE,
  CALL_START,
  CALL_END,
  AI_ACTION,
  POST_VIEW,
  POST_LIKE,
  POST_SAVE,
} from "@whatschat/analytics";
import { useSearch } from "../../hooks/use-search";
import { useDialogs } from "../../hooks/use-dialogs";
import { useNavigation } from "../../hooks/use-navigation";
import { useChatsWithLiveMessages } from "../../hooks/use-chats-with-live-messages";
import { useAuth } from "../../hooks/use-auth";
import { useFeed, useExplore, useProfileStats } from "../../hooks/use-feed";
import { useUserProfileView } from "../../hooks/use-user-profile-view";
import { useTranslation } from "@/src/shared/i18n";
import { FeedCommentsDialog } from "../dialogs/feed-comments-dialog";
import { CreatePostDialog } from "../dialogs/create-post-dialog";
import { FollowListModal } from "../dialogs/follow-list-modal";
import { styled } from "@/src/shared/utils/emotion";
import {
  mockContacts,
  mockMessages,
  mockUser,
} from "@/infrastructure/data/mock-data";
import { getMessagesForContact } from "@/shared/utils/message-utils";
import type {
  Contact,
  User,
  Message,
  FeedPost,
  StoryItem,
} from "@/shared/types";
import type {
  FollowListItem,
  IFollowListService,
} from "../dialogs/dialog-services.types";
import { AiApiAdapter } from "@/infrastructure/adapters/api/ai-api.adapter";
import { ImageApiAdapter } from "@/infrastructure/adapters/api/image-api.adapter";
import { VideoApiAdapter } from "@/infrastructure/adapters/api/video-api.adapter";
import { VoiceApiAdapter } from "@/infrastructure/adapters/api/voice-api.adapter";
import { FeedApiAdapter } from "@/infrastructure/adapters/api/feed-api.adapter";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";

const AppShell = styled.div`
  display: flex;
  height: 100vh;
  background-color: rgb(255 255 255);
`;

const CenterColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(255 255 255);
`;

const MessagesRow = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FloatingMessagesBtn = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: calc(320px + 1.5rem);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 24px;
  border: none;
  background-color: rgb(255 255 255);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.15);
  color: rgb(38 38 38);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: rgb(250 250 250);
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
`;

const ErrorToast = styled.div`
  position: fixed;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  z-index: 50;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  background-color: rgb(254 226 226);
  color: rgb(153 27 27);
`;

type InstagramView = "feed" | "messages";
type InstagramRoutePage =
  | "home"
  | "messages"
  | "reels"
  | "explore"
  | "profile"
  | "settings"
  | "status"
  | "calls"
  | "starred"
  | "search";

export function InstagramMain({
  routePage = "home",
  profileUserId,
}: {
  routePage?: InstagramRoutePage;
  profileUserId?: string;
}) {
  const router = useRouter();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [instagramView, setInstagramView] = useState<InstagramView>("feed");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [followListModal, setFollowListModal] = useState<
    "followers" | "following" | null
  >(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const analytics = useAnalytics();
  const { user: currentUser } = useAuth();
  const viewedUserId = profileUserId ?? currentUser?.id;
  const isSelfProfile =
    viewedUserId != null && currentUser?.id === viewedUserId;
  const feed = useFeed(currentUser?.id);
  const explore = useExplore(currentUser?.id);
  const profileStats = useProfileStats(viewedUserId);
  const otherUserProfile = useUserProfileView(
    viewedUserId,
    routePage === "profile" && !isSelfProfile,
  );
  const { t } = useTranslation();

  useEffect(() => {
    analytics.track(PAGE_VIEW, { path: "/", title: "Chat" });
    if (currentUser?.id) analytics.identify(currentUser.id);
  }, [currentUser?.id, analytics]);

  useEffect(() => {
    if (selectedContactId)
      analytics.track(CHAT_OPEN, { chatId: selectedContactId });
  }, [selectedContactId, analytics]);

  useEffect(() => {
    if (currentUser?.id && instagramView === "feed") {
      feed.loadFeed();
      feed.loadSuggestions();
    }
  }, [currentUser?.id, instagramView]);

  useEffect(() => {
    if (routePage === "messages") {
      setInstagramView("messages");
      return;
    }
    setInstagramView("feed");
  }, [routePage]);

  const chatsWithLive = useChatsWithLiveMessages(
    selectedContactId,
    currentUser?.id,
  );

  const contactsForList: Contact[] =
    chatsWithLive.apiChats.length > 0
      ? (chatsWithLive.apiChats as Contact[])
      : (mockContacts as Contact[]);
  const selectedContact =
    selectedContactId != null
      ? (contactsForList.find((c) => c.id === selectedContactId) ?? null)
      : null;

  const {
    handleProfileClick,
    handleReelsClick,
    handleExploreClick,
    handleStatusClick,
    handleCallsClick,
    handleStarredClick,
    handleSettingsClick,
    handleSearchPageClick,
    handleBackToChat,
  } = useNavigation();
  const currentPage =
    routePage === "home" || routePage === "messages" ? "chat" : routePage;
  const handleUserClick = useCallback(
    (userId: string) => {
      if (!userId) return;
      router.push(`/profile/${userId}`);
    },
    [router],
  );

  useEffect(() => {
    if (viewedUserId && currentPage === "profile") profileStats.load();
  }, [viewedUserId, currentPage, profileStats.load]);

  useEffect(() => {
    if (currentUser?.id && currentPage === "reels") feed.loadFeed();
  }, [currentUser?.id, currentPage]);

  useEffect(() => {
    if (currentUser?.id && currentPage === "explore") explore.loadExplore();
  }, [currentUser?.id, currentPage]);

  const {
    searchQuery,
    showSearchSuggestions,
    recentSearches,
    searchInputRef,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleRemoveRecentSearch,
    filterContacts,
  } = useSearch();

  const {
    showCreateGroupDialog,
    showAddFriendDialog,
    showAdvancedSearchDialog,
    handleCreateGroupClick,
    handleAddFriendClick,
    handleAdvancedSearchClick,
    closeCreateGroupDialog,
    closeAddFriendDialog,
    closeAdvancedSearchDialog,
  } = useDialogs();

  const messagesForSelected = chatsWithLive.isApiChat
    ? chatsWithLive.messagesForSelected
    : selectedContact
      ? [...getMessagesForContact(selectedContact.id, mockMessages)]
      : [];

  const {
    messageText,
    showEmojiPicker,
    replyingTo,
    editingMessage,
    isRecordingVoice,
    isTyping,
    handleMessageChange,
    handleKeyDown,
    handleSendMessage,
    handleEmojiSelect,
    handleToggleEmojiPicker,
    handleFileSelect,
    handleSendVoice,
    handleReply,
    handleEdit,
    handleDelete,
    handleForward,
    handleStar,
    handleInfo,
    handleCancelReply,
    handleCancelEdit,
    handleRecordingChange,
    clearInput,
  } = useMessages({
    selectedContactId,
    selectedContact: selectedContact ?? null,
    messages: mockMessages,
  });

  type SendMessageFn = (
    content: string,
    type?: "text" | "image" | "video" | "audio" | "file",
    options?: { mediaUrl?: string },
  ) => void;
  const handleSendMessageWrapper = (
    content: string,
    type: "text" | "image" | "video" | "audio" | "file" = "text",
    options?: { mediaUrl?: string },
  ) => {
    if (chatsWithLive.isApiChat) {
      (chatsWithLive.handleSendMessage as SendMessageFn)(
        content,
        type,
        options,
      );
      clearInput();
    } else {
      handleSendMessage(content, type);
    }
    if (selectedContactId) {
      analytics.track(SEND_MESSAGE, { chatId: selectedContactId, type });
    }
  };

  const apiClient = useMemo(() => getApiClient(), []);
  const aiApi = useMemo(() => new AiApiAdapter(apiClient), [apiClient]);
  const imageGenerateService = useMemo(
    () => new ImageApiAdapter(apiClient),
    [apiClient],
  );
  const videoGenerateService = useMemo(
    () => new VideoApiAdapter(apiClient),
    [apiClient],
  );
  const voiceGenerateService = useMemo(
    () => new VoiceApiAdapter(apiClient),
    [apiClient],
  );
  const feedApi = useMemo(() => new FeedApiAdapter(apiClient), [apiClient]);
  const followListService = useMemo(
    (): IFollowListService => ({
      getFollowers: (userId, limit, pageState) =>
        feedApi
          .getFollowers(userId, limit, pageState)
          .then((r) => ({
            list: r.list as FollowListItem[],
            pageState: r.pageState,
          })),
      getFollowing: (userId, limit, pageState) =>
        feedApi
          .getFollowing(userId, limit, pageState)
          .then((r) => ({
            list: r.list as FollowListItem[],
            pageState: r.pageState,
          })),
    }),
    [feedApi],
  );
  const handleSmartReplyClick = () => {
    const recent = chatsWithLive.messagesForSelected.slice(-10).map((m) => ({
      role: m.senderId === currentUser?.id ? "user" : "assistant",
      content: m.content,
    }));
    if (recent.length === 0) return;
    aiApi
      .postChat(recent)
      .then((res) => {
        if (res.success && res.data?.content)
          handleMessageChange(res.data.content);
      })
      .catch(() => {});
  };
  const chatIdForAnalytics = selectedContactId ?? undefined;
  const handleGenerateVideoClick = () => {
    analytics.track(AI_ACTION, {
      action: "video",
      step: "open",
      chatId: chatIdForAnalytics,
    });
    setShowVideoDialog(true);
  };
  const handleVideoGenerateSuccess = (videoUrl: string) => {
    analytics.track(AI_ACTION, {
      action: "video",
      step: "send_to_chat",
      chatId: chatIdForAnalytics,
    });
    handleSendMessageWrapper("", "video", { mediaUrl: videoUrl });
    setShowVideoDialog(false);
  };
  const handleGenerateTextClick = () => {
    analytics.track(AI_ACTION, {
      action: "text",
      step: "open",
      chatId: chatIdForAnalytics,
    });
    setShowTextDialog(true);
  };
  const handleTextGenerateSuccess = (content: string) => {
    analytics.track(AI_ACTION, {
      action: "text",
      step: "send_to_chat",
      chatId: chatIdForAnalytics,
    });
    handleSendMessageWrapper(content, "text");
    setShowTextDialog(false);
  };
  const handleGenerateImageClick = () => {
    analytics.track(AI_ACTION, {
      action: "image",
      step: "open",
      chatId: chatIdForAnalytics,
    });
    setShowImageDialog(true);
  };
  const handleImageGenerateSuccess = (imageUrl: string) => {
    analytics.track(AI_ACTION, {
      action: "image",
      step: "send_to_chat",
      chatId: chatIdForAnalytics,
    });
    handleSendMessageWrapper("", "image", { mediaUrl: imageUrl });
    setShowImageDialog(false);
  };
  const handleGenerateVoiceClick = () => {
    analytics.track(AI_ACTION, {
      action: "voice",
      step: "open",
      chatId: chatIdForAnalytics,
    });
    setShowVoiceDialog(true);
  };
  const handleVoiceGenerateSuccess = (audioUrl: string) => {
    analytics.track(AI_ACTION, {
      action: "voice",
      step: "send_to_chat",
      chatId: chatIdForAnalytics,
    });
    handleSendMessageWrapper("", "audio", { mediaUrl: audioUrl });
    setShowVoiceDialog(false);
  };

  const isConnected = chatsWithLive.isConnected;
  const {
    callState,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatDuration,
    error: callError,
  } = useRealCall();

  const filteredContacts = filterContacts(contactsForList, searchQuery);

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

  const SEEN_STORIES_KEY = "whatschat:seen_story_user_ids";
  const getSeenStoryUserIdsFromStorage = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(SEEN_STORIES_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  };
  const [seenStoryUserIds, setSeenStoryUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  useEffect(() => {
    setSeenStoryUserIds(getSeenStoryUserIdsFromStorage());
  }, []);
  const displayStorySlides = useMemo(
    () =>
      storySlidesWithPost.filter((s) => !seenStoryUserIds.has(s.story.userId)),
    [storySlidesWithPost, seenStoryUserIds],
  );
  const displayStories: StoryItem[] = useMemo(
    () => displayStorySlides.map((s) => s.story),
    [displayStorySlides],
  );

  const [storyOverlayIndex, setStoryOverlayIndex] = useState<number | null>(
    null,
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
      (analytics as any).track("ad_click", {
        adAccountId: post.adAccountId,
        adCampaignId: post.adCampaignId,
        adGroupId: post.adGroupId,
        adCreativeId: post.adCreativeId,
        placement: "FEED",
        ...(positionInFeed >= 0 && { positionInFeed }),
      });
    },
    [analytics, feed.posts],
  );

  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setInstagramView("messages");
  };

  const handleStartCall = (callType: "voice" | "video") => {
    if (!selectedContact?.id) return;
    const id = selectedContact.id;
    const name = selectedContact.name ?? "";
    const avatar = selectedContact.avatar ?? "";
    analytics.track(CALL_START, { chatId: id, callType });
    startCall(
      id,
      name,
      avatar,
      callType,
      isConnected ? { chatId: id } : undefined,
    );
  };

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

  const handleCreateGroup = (name: string, selectedMembers: Contact[]) => {
    const newGroup: Contact = {
      id: `group_${Date.now()}`,
      name,
      avatar: "/placeholder.svg?height=40&width=40&text=群",
      lastMessage: "群组已创建",
      timestamp: "刚刚",
      unreadCount: 0,
      isOnline: true,
      isGroup: true,
      members: [
        ...selectedMembers.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: "member" as const,
        })),
        {
          id: "current-user",
          name: mockUser.name || "我",
          avatar: mockUser.avatar || "",
          role: "owner" as const,
        },
      ],
    };
    closeCreateGroupDialog();
  };

  const handleAddFriend = (friendId: string) => {
    closeAddFriendDialog();
  };

  const handleAdvancedSearch = (_filters: unknown) => {
    closeAdvancedSearchDialog();
    setSearchDrawerOpen(true);
    handleBackToChat();
    setInstagramView("feed");
  };

  const handleSelectMessage = (contactId: string, messageId: string) => {
    const contact = mockContacts.find((c) => c.id === contactId);
    if (contact) {
      handleContactSelect(contact);
    }
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<Element>) => {
    handleKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>);
  };

  const renderCenterContent = () => {
    if (callState?.isActive) {
      return (
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
      );
    }

    if (currentPage === "chat" && instagramView === "feed") {
      return (
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
              analytics.track(POST_VIEW, {
                postId: post.id,
                authorId: post.userId,
              });
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
      );
    }

    if (currentPage === "chat" && instagramView === "messages") {
      return (
        <MessagesRow>
          <InstagramMessagesSidebar
            user={currentUser ?? mockUser}
            contacts={filteredContacts}
            selectedContact={selectedContact ?? null}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onContactSelect={handleContactSelect}
            onComposeClick={handleAddFriendClick}
            searchInputRef={searchInputRef}
          />
          <MainContent>
            {selectedContact ? (
              <ChatArea
                selectedContact={selectedContact}
                messages={messagesForSelected}
                currentUserId={currentUser?.id}
                messageText={messageText}
                showEmojiPicker={showEmojiPicker}
                replyingTo={replyingTo}
                editingMessage={editingMessage}
                isRecordingVoice={isRecordingVoice}
                isTyping={isTyping}
                isConnected={isConnected}
                onMessageChange={handleMessageChange}
                onKeyDown={handleKeyDownWrapper}
                onSendMessage={handleSendMessageWrapper}
                onEmojiSelect={handleEmojiSelect}
                onToggleEmojiPicker={handleToggleEmojiPicker}
                onFileSelect={handleFileSelect}
                onSendVoice={handleSendVoice}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onForward={handleForward}
                onStar={handleStar}
                onInfo={handleInfo}
                onVoiceCall={() => handleStartCall("voice")}
                onVideoCall={() => handleStartCall("video")}
                onShowInfo={() => {}}
                onCancelReply={handleCancelReply}
                onCancelEdit={handleCancelEdit}
                onRecordingChange={handleRecordingChange}
                onSmartReplyClick={
                  chatsWithLive.isApiChat ? handleSmartReplyClick : undefined
                }
                onGenerateVideoClick={
                  chatsWithLive.isApiChat ? handleGenerateVideoClick : undefined
                }
                onGenerateTextClick={
                  chatsWithLive.isApiChat ? handleGenerateTextClick : undefined
                }
                onGenerateImageClick={
                  chatsWithLive.isApiChat ? handleGenerateImageClick : undefined
                }
                onGenerateVoiceClick={
                  chatsWithLive.isApiChat ? handleGenerateVoiceClick : undefined
                }
              />
            ) : (
              <InstagramMessagesEmpty onSendMessage={handleAddFriendClick} />
            )}
          </MainContent>
        </MessagesRow>
      );
    }

    switch (currentPage) {
      case "reels":
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
      case "profile":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <ProfilePage
              user={
                isSelfProfile ? (currentUser ?? null) : otherUserProfile.user
              }
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
          </CenterColumn>
        );
      case "calls":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <CallsPage onBack={handleBackToChat} />
          </CenterColumn>
        );
      case "status":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <StatusPage onBack={handleBackToChat} />
          </CenterColumn>
        );
      case "starred":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <StarredMessagesPage onBack={handleBackToChat} />
          </CenterColumn>
        );
      case "search":
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
          </CenterColumn>
        );
      case "settings":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <SettingsPage
              onBack={handleBackToChat}
              onProfileClick={handleProfileClick}
            />
          </CenterColumn>
        );
      case "explore":
        return (
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
        );
      default:
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <InstagramFeed
              stories={displayStories}
              posts={feed.posts}
              loading={feed.loading}
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
  };

  const navActiveTab =
    currentPage === "profile"
      ? "profile"
      : currentPage === "reels"
        ? "reels"
        : currentPage === "explore"
          ? "explore"
          : searchDrawerOpen
            ? "search"
            : currentPage === "search"
              ? "search"
              : currentPage === "chat" && instagramView === "messages"
                ? "messages"
                : "home";

  return (
    <AppShell>
      <InstagramNav
        user={currentUser ?? mockUser}
        activeTab={navActiveTab}
        onHomeClick={() => {
          handleBackToChat();
          setInstagramView("feed");
        }}
        onMessagesClick={() => {
          router.push("/messages");
          setInstagramView("messages");
        }}
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

      {renderCenterContent()}

      {currentPage === "chat" && instagramView === "feed" && (
        <InstagramRightSidebar
          user={currentUser ?? mockUser}
          suggestions={feed.suggestions}
          onFollow={currentUser?.id ? feed.followSuggestion : undefined}
          onUserClick={handleUserClick}
        />
      )}

      {((currentPage === "chat" && instagramView === "feed") ||
        currentPage === "explore") && (
        <FloatingMessagesBtn
          type="button"
          onClick={() => {
            router.push("/messages");
            setInstagramView("messages");
          }}
        >
          <Send size={20} />
          {t("nav.messages")}
        </FloatingMessagesBtn>
      )}

      {callState?.status === "ringing" && (
        <FullscreenOverlay>
          <RealIncomingCall
            callState={callState}
            onAnswer={answerCall}
            onDecline={endCall}
          />
        </FullscreenOverlay>
      )}

      {storyOverlayIndex !== null && displayStorySlides.length > 0 && (
        <StoryOverlay
          slides={displayStorySlides}
          initialIndex={storyOverlayIndex}
          onClose={handleStoryOverlayClose}
        />
      )}

      {callError && <ErrorToast>{callError}</ErrorToast>}

      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={closeCreateGroupDialog}
        contacts={mockContacts.filter((c) => !c.isGroup)}
        onCreateGroup={handleCreateGroup}
      />

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

      <AddFriendDialog
        isOpen={showAddFriendDialog}
        onClose={closeAddFriendDialog}
        onAddFriend={handleAddFriend}
      />

      <AdvancedSearchDialog
        isOpen={showAdvancedSearchDialog}
        onClose={closeAdvancedSearchDialog}
        contacts={mockContacts}
        onSearch={handleAdvancedSearch}
      />

      <VideoGenerateDialog
        isOpen={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        onSuccess={handleVideoGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, {
            action: "video",
            step: "generate_success",
            chatId: chatIdForAnalytics,
          })
        }
        service={videoGenerateService}
      />

      <TextGenerateDialog
        isOpen={showTextDialog}
        onClose={() => setShowTextDialog(false)}
        onSuccess={handleTextGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, {
            action: "text",
            step: "generate_success",
            chatId: chatIdForAnalytics,
          })
        }
        service={aiApi}
      />

      <ImageGenerateDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onSuccess={handleImageGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, {
            action: "image",
            step: "generate_success",
            chatId: chatIdForAnalytics,
          })
        }
        service={imageGenerateService}
      />

      <VoiceGenerateDialog
        isOpen={showVoiceDialog}
        onClose={() => setShowVoiceDialog(false)}
        onSuccess={handleVoiceGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, {
            action: "voice",
            step: "generate_success",
            chatId: chatIdForAnalytics,
          })
        }
        service={voiceGenerateService}
      />
    </AppShell>
  );
}
