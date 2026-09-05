"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InstagramMessagesSidebar } from "@/chat/components/instagram-messages-sidebar";
import { InstagramMessagesEmpty } from "@/chat/components/instagram-messages-empty";
import { ChatArea } from "@/chat/components/chat-area";
import { CreateGroupDialog } from "@/chat/components/create-group-dialog";
import { AddFriendDialog } from "@/chat/components/add-friend-dialog";
import { AdvancedSearchDialog } from "@/search/advanced-search-dialog";
import { VideoGenerateDialog } from "@/ai/components/video-generate-dialog";
import { TextGenerateDialog } from "@/ai/components/text-generate-dialog";
import { ImageGenerateDialog } from "@/ai/components/image-generate-dialog";
import { VoiceGenerateDialog } from "@/ai/components/voice-generate-dialog";
import { useSharedRealCall } from "@/layout/real-call-context";
import { useMessages } from "@/chat/hooks/use-messages";
import {
  useAnalytics,
  CHAT_OPEN,
  SEND_MESSAGE,
  CALL_START,
  AI_ACTION,
} from "@whatschat/analytics";
import { useSearch } from "@/search/use-search";
import { useDialogs } from "@/layout/use-dialogs";
import { useChatsWithLiveMessages } from "@/chat/hooks/use-chats-with-live-messages";
import { useAuth } from "@/auth/use-auth";
import { AiApi } from "@/ai/apis/ai.api";
import { ImageApi } from "@/ai/apis/image.api";
import { VideoApi } from "@/ai/apis/video.api";
import { VoiceApi } from "@/ai/apis/voice.api";
import { getApiClient } from "@/auth/api-client";
import { mockContacts, mockMessages } from "@/chat/mock-data";
import { mockUser } from "@/profile/users.service";
import { getMessagesForContact } from "@/shared/utils/message-utils";
import type { Contact } from "@/shared/types";
import { CenterColumn, MainContent, MessagesRow } from "@/layout/shell-styles";

export function MessagesPage() {
  const router = useRouter();
  const analytics = useAnalytics();
  const { user: currentUser } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);

  useEffect(() => {
    if (selectedContactId)
      analytics.track(CHAT_OPEN, { chatId: selectedContactId });
  }, [selectedContactId, analytics]);

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

  const { searchQuery, searchInputRef, handleSearchChange, filterContacts } =
    useSearch();

  const {
    showCreateGroupDialog,
    showAddFriendDialog,
    showAdvancedSearchDialog,
    handleAddFriendClick,
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
  const aiApi = useMemo(() => new AiApi(apiClient), [apiClient]);
  const imageGenerateService = useMemo(
    () => new ImageApi(apiClient),
    [apiClient],
  );
  const videoGenerateService = useMemo(
    () => new VideoApi(apiClient),
    [apiClient],
  );
  const voiceGenerateService = useMemo(
    () => new VoiceApi(apiClient),
    [apiClient],
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
  const { startCall } = useSharedRealCall();
  const filteredContacts = filterContacts(contactsForList, searchQuery);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
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

  const handleCreateGroup = (_name: string, _selectedMembers: Contact[]) => {
    closeCreateGroupDialog();
  };

  const handleAddFriend = (_friendId: string) => {
    closeAddFriendDialog();
  };

  const handleAdvancedSearch = (_filters: unknown) => {
    closeAdvancedSearchDialog();
    router.push("/search");
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<Element>) => {
    handleKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>);
  };

  return (
    <CenterColumn>
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

      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={closeCreateGroupDialog}
        contacts={mockContacts.filter((c) => !c.isGroup)}
        onCreateGroup={handleCreateGroup}
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
    </CenterColumn>
  );
}
