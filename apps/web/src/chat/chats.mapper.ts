import type { Contact } from "./contact.model";
import { mapContact } from "./contact.model";
import type { Message } from "./message.model";
import { mapMessage } from "./message.model";

export type ApiChatRow = {
  id: string;
  name?: string;
  avatar?: string;
  lastMessage?: { content?: string };
  updatedAt?: string;
  type?: string;
  participants?: { isOnline?: boolean }[];
};

export type ApiMessageRow = {
  id: string;
  senderId: string;
  sender?: { username?: string };
  content: string;
  timestamp?: string;
  createdAt?: string;
  type?: string;
  mediaUrl?: string;
};

export function mapApiChatRowToContact(chat: ApiChatRow): Contact {
  return mapContact({
    id: chat.id,
    name: chat.name || "Chat",
    avatar: chat.avatar || "",
    lastMessage: chat.lastMessage?.content ?? "",
    timestamp: chat.updatedAt ?? "",
    unreadCount: 0,
    isOnline: chat.participants?.some((p) => p.isOnline) ?? false,
    isGroup: chat.type === "GROUP",
  });
}

export function mapApiMessageRowToMessage(msg: ApiMessageRow): Message {
  const ts =
    typeof msg.timestamp === "string"
      ? msg.timestamp
      : (msg.createdAt ?? new Date().toISOString());
  const typeRaw = msg.type?.toLowerCase() ?? "text";
  return mapMessage({
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.sender?.username ?? "",
    content: msg.content,
    timestamp: ts,
    type: typeRaw as Message["type"],
    status: "delivered",
    ...(msg.mediaUrl != null && { mediaUrl: msg.mediaUrl }),
  });
}

export function mapUnknownToContactCreate(data: unknown): Contact {
  return mapContact(data as Parameters<typeof mapContact>[0]);
}

export function mapUnknownToMessageCreate(data: unknown): Message {
  return mapMessage(data as Parameters<typeof mapMessage>[0]);
}
