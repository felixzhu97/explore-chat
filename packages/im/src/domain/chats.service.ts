import type { Message } from "@chat/shared-types";

export interface ChatListItem {
  id: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  type?: string;
  participants?: unknown[];
  [key: string]: unknown;
}

export interface IChatsService {
  getChats(): Promise<ChatListItem[]>;
  getChatById(chatId: string): Promise<ChatListItem | null>;
  createChat(data: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<ChatListItem>;
  getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number }
  ): Promise<Message[]>;
  sendMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "video" | "audio" | "file";
      replyToMessageId?: string;
    }
  ): Promise<Message>;
  markMessageAsRead(chatId: string, messageId: string): Promise<void>;
}
