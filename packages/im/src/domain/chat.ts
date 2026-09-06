import type { User } from "./user";
import type { Message } from "./message";

export type ChatType = "PRIVATE" | "GROUP" | "private" | "group" | "individual" | "broadcast";

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  avatar?: string;
  description?: string;
  participants?: User[];
  participantIds?: string[];
  lastMessage?: Message;
  lastMessageId?: string;
  lastMessageContent?: string;
  lastMessageTime?: Date | string;
  lastMessageSender?: string;
  unreadCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  groupImage?: string;
  isMuted?: boolean;
  mutedUntil?: Date | string;
  isPinned?: boolean;
  isArchived?: boolean;
  adminId?: string;
  adminIds?: string[];
  settings?: Record<string, unknown>;
}
