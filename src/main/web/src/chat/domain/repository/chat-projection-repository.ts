import type { DeliveryStatusValue } from "@/chat/domain/vo";

export type ChatProjectionRow = {
  id: string;
  name?: string;
  avatar?: string;
  lastMessageId?: string;
  lastMessageContent?: string;
  lastMessageAt?: string;
  updatedAt?: string;
  type?: string;
};

export type MessageProjectionRow = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  status?: DeliveryStatusValue;
  type?: string;
  clientMsgId?: string;
  mediaUrl?: string;
  senderName?: string;
};

export interface ChatProjectionRepository {
  listChats(): Promise<ChatProjectionRow[]>;
  upsertChats(rows: ChatProjectionRow[]): Promise<void>;
  listMessages(chatId: string): Promise<MessageProjectionRow[]>;
  replaceMessages(chatId: string, rows: MessageProjectionRow[]): Promise<void>;
  upsertMessage(row: MessageProjectionRow): Promise<void>;
}
