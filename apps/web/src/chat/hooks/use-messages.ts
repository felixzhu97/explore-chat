import { useState, useCallback } from "react";
import type { Message, Contact } from "@/shared/types";
import {
  createMessage,
  addMessageToContact,
  simulateGroupResponse,
  simulateIndividualResponse,
} from "@/shared/utils/message-utils";

export interface UseMessagesProps {
  selectedContactId: string | null;
  selectedContact: Contact | null;
  messages: Record<string, Message[]>;
}

export function useMessages({
  selectedContactId,
  selectedContact,
  messages,
}: UseMessagesProps) {
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleMessageChange = useCallback(
    (text: string) => {
      setMessageText(text);
      if (text.trim() && !isTyping) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    },
    [isTyping],
  );

  const handleSendMessage = useCallback(
    (
      content: string,
      type: "text" | "image" | "video" | "audio" | "file" = "text",
    ) => {
      if (!content.trim() && type === "text") return;
      if (!selectedContactId) return;

      // Create new message
      const newMessage = createMessage(content, type);

      // Add to messages
      addMessageToContact(selectedContactId, newMessage, messages);

      // Clear input
      setMessageText("");
      setReplyingTo(null);
      setEditingMessage(null);
      setIsTyping(false);

      // Simulate response
      simulateResponse(selectedContactId, selectedContact);
    },
    [selectedContactId, selectedContact, messages],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = (e.target as HTMLTextAreaElement).value?.trim() ?? "";
        if (text) {
          handleSendMessage(text);
        }
      }
    },
    [handleSendMessage],
  );

  const simulateResponse = useCallback(
    (contactId: string, contact: Contact | null) => {
      const isGroupChat = contact?.isGroup;

      setTimeout(
        () => {
          if (isGroupChat) {
            simulateGroupResponse(contactId, messages);
          } else {
            simulateIndividualResponse(
              contactId,
              contact?.name || "联系人",
              messages,
            );
          }
        },
        1000 + Math.random() * 2000,
      );
    },
    [messages],
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessageText((prev) => prev + emoji);
  }, []);

  const handleToggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
            ? "audio"
            : "file";

      handleSendMessage(file.name, fileType);
    },
    [handleSendMessage],
  );

  const handleSendVoice = useCallback(
    (audioBlob: Blob, duration: number) => {
      handleSendMessage(`语音消息 ${Math.round(duration)}秒`, "audio");
    },
    [handleSendMessage],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const handleEdit = useCallback((message: Message) => {
    setEditingMessage(message);
    setMessageText(message.content);
  }, []);

  const handleDelete = useCallback((_message: Message) => {}, []);

  const handleForward = useCallback((_message: Message) => {}, []);

  const handleStar = useCallback((_message: Message) => {}, []);

  const handleInfo = useCallback((_message: Message) => {}, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageText("");
  }, []);

  const handleRecordingChange = useCallback((isRecording: boolean) => {
    setIsRecordingVoice(isRecording);
  }, []);

  const clearInput = useCallback(() => {
    setMessageText("");
    setReplyingTo(null);
    setEditingMessage(null);
    setIsTyping(false);
  }, []);

  return {
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
  };
}
