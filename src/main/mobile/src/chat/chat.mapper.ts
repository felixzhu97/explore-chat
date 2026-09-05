import { Chat, ChatEntity, ChatType } from "@/chat/chat.model";

export interface ServerChatPayload {
  id: string;
  name?: string | null;
  type?: string;
  avatar?: string | null;
  isArchived?: boolean;
  isMuted?: boolean;
  participants?: {
    id: string;
    userId?: string;
    user?: { id: string; username?: string; avatar?: string | null };
    username?: string;
    avatar?: string | null;
  }[];
  lastMessage?: {
    content: string;
    createdAt: string;
    sender?: { id: string; username?: string; avatar?: string | null };
  } | null;
  updatedAt: string;
}

export function mapServerChatPayloadToChat(c: ServerChatPayload): Chat {
  const updatedAt = c.updatedAt ? new Date(c.updatedAt) : new Date();
  return new ChatEntity({
    id: c.id,
    name: c.name ?? "Chat",
    type: c.type === "GROUP" ? ChatType.Group : ChatType.Individual,
    participantIds:
      c.participants?.map((p) => p.userId ?? p.user?.id ?? p.id) ?? [],
    groupImage: c.avatar ?? undefined,
    lastMessageContent: c.lastMessage?.content,
    lastMessageTime: c.lastMessage?.createdAt
      ? new Date(c.lastMessage.createdAt)
      : undefined,
    lastMessageSender: c.lastMessage?.sender?.username,
    unreadCount: 0,
    isMuted: c.isMuted ?? false,
    isPinned: false,
    isArchived: c.isArchived ?? false,
    adminIds: [],
    createdAt: updatedAt,
    updatedAt,
  });
}
