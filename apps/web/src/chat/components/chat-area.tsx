"use client";

import type React from "react";

import { ChatHeader } from "./chat-header";
import { MessageArea } from "./message-area";
import { MessageInput } from "./message-input";
import type { Contact, Message } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

interface ChatAreaProps {
  selectedContact: Contact;
  messages: Message[];
  currentUserId?: string | null;
  messageText: string;
  showEmojiPicker: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null;
  isRecordingVoice: boolean;
  isTyping: boolean;
  isConnected: boolean;
  onMessageChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSendMessage: (
    content: string,
    type?: "text" | "image" | "video" | "audio" | "file",
    options?: { mediaUrl?: string },
  ) => void;
  onSmartReplyClick?: () => void;
  onGenerateVideoClick?: () => void;
  onGenerateTextClick?: () => void;
  onGenerateImageClick?: () => void;
  onGenerateVoiceClick?: () => void;
  onEmojiSelect: (emoji: string) => void;
  onToggleEmojiPicker: () => void;
  onFileSelect: (file: File) => void;
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onForward: (message: Message) => void;
  onStar: (message: Message) => void;
  onInfo: (message: Message) => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onShowInfo: () => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onRecordingChange: (isRecording: boolean) => void;
}

const ChatAreaRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(255 255 255);
`;

const TypingIndicator = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

export function ChatArea({
  selectedContact,
  messages,
  currentUserId = null,
  messageText,
  showEmojiPicker,
  replyingTo,
  editingMessage,
  isRecordingVoice,
  isTyping,
  isConnected,
  onMessageChange,
  onKeyDown,
  onSendMessage,
  onEmojiSelect,
  onToggleEmojiPicker,
  onFileSelect,
  onSendVoice,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
  onVoiceCall,
  onVideoCall,
  onShowInfo,
  onCancelReply,
  onCancelEdit,
  onRecordingChange,
  onSmartReplyClick,
  onGenerateVideoClick,
  onGenerateTextClick,
  onGenerateImageClick,
  onGenerateVoiceClick,
}: ChatAreaProps) {
  return (
    <ChatAreaRoot>
      <ChatHeader
        contact={selectedContact}
        isTyping={isTyping}
        isGroup={selectedContact.isGroup ?? false}
        onVoiceCall={onVoiceCall}
        onVideoCall={onVideoCall}
        onShowInfo={onShowInfo}
      />

      <MessageArea
        messages={messages}
        selectedContact={selectedContact}
        currentUserId={currentUserId}
        isGroup={selectedContact.isGroup ?? false}
        onReply={onReply}
        onEdit={(messageId: string, text: string) => {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            onEdit({ ...message, content: text });
          }
        }}
        onDelete={(messageId: string) => {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            onDelete(message);
          }
        }}
        onForward={onForward}
        onStar={(messageId: string) => {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            onStar(message);
          }
        }}
        onInfo={onInfo}
      />

      {isTyping && (
        <TypingIndicator>{selectedContact.name} 正在输入...</TypingIndicator>
      )}

      <MessageInput
        messageText={messageText}
        showEmojiPicker={showEmojiPicker}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        isRecordingVoice={isRecordingVoice}
        onMessageChange={onMessageChange}
        onKeyDown={onKeyDown}
        onSendMessage={() => onSendMessage(messageText, "text")}
        onEmojiSelect={onEmojiSelect}
        onToggleEmojiPicker={onToggleEmojiPicker}
        onFileSelect={onFileSelect}
        onSendVoice={onSendVoice}
        onCancelReply={onCancelReply}
        onCancelEdit={onCancelEdit}
        onRecordingChange={onRecordingChange}
        onSmartReplyClick={onSmartReplyClick}
        onGenerateVideoClick={onGenerateVideoClick}
        onGenerateTextClick={onGenerateTextClick}
        onGenerateImageClick={onGenerateImageClick}
        onGenerateVoiceClick={onGenerateVoiceClick}
      />
    </ChatAreaRoot>
  );
}
