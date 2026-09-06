import type { IncomingMessageProps } from "@/chat/domain/event";
import type { ChatSummaryProps } from "@/chat/domain/model";
import { Message } from "@/chat/domain/model";
import {
  AvatarURL,
  ChatId,
  ChatTitle,
  ClientMsgId,
  MessageId,
  type DeliveryStatusValue,
} from "@/chat/domain/vo";
import type { ChatListItem } from "@/chat/chats.service.types";
import type { Message as UiMessage } from "@/shared/types/message";
import type {
  ApiMessageLike,
  SocketMessagePayload,
} from "@/shared/utils/message-mappers.impl";

export function mapApiMessageToIncoming(m: ApiMessageLike): IncomingMessageProps {
  return {
    id: MessageId.create(m.id),
    chatId: ChatId.create(
      (m as { chatId?: string }).chatId ?? "unknown",
    ),
    senderId: m.senderId,
    content: m.content,
    createdAt:
      typeof m.timestamp === "string"
        ? m.timestamp
        : (m.createdAt ?? new Date().toISOString()),
    type: m.type?.toLowerCase() ?? "text",
    status: (m.status as DeliveryStatusValue | undefined) ?? "sent",
    ...(m.clientMsgId != null && {
      clientMsgId: ClientMsgId.create(m.clientMsgId),
    }),
    ...((m as { mediaUrl?: string }).mediaUrl != null && {
      mediaUrl: (m as { mediaUrl?: string }).mediaUrl,
    }),
    ...(m.senderName != null && { senderName: m.senderName }),
  };
}

export function mapSocketToIncoming(
  p: SocketMessagePayload,
  fallbackChatId: string,
): IncomingMessageProps | null {
  if (!p.from) return null;
  const chatId = p.to ?? fallbackChatId;
  if (!chatId) return null;
  return {
    id: MessageId.create(p.data?.id ?? `live-${Date.now()}`),
    chatId: ChatId.create(chatId),
    senderId: p.from,
    content: p.data?.text ?? "",
    createdAt: new Date(p.timestamp ?? Date.now()).toISOString(),
    type: (p.data?.type ?? "text").toLowerCase() || "text",
    status: "delivered",
    ...(p.data?.clientMsgId != null && {
      clientMsgId: ClientMsgId.create(p.data.clientMsgId),
    }),
  };
}

export function mapDomainMessageToUi(m: Message): UiMessage {
  const s = m.toSnapshot();
  return {
    id: s.id,
    chatId: s.chatId,
    senderId: s.senderId,
    senderName: s.senderName ?? "",
    content: s.content,
    timestamp: s.createdAt,
    type: s.type as UiMessage["type"],
    status: s.status,
    ...(s.clientMsgId != null && { clientMsgId: s.clientMsgId }),
    ...(s.mediaUrl != null && { mediaUrl: s.mediaUrl }),
  };
}

export function mapChatListItemToSummary(item: ChatListItem): ChatSummaryProps {
  return {
    id: ChatId.create(item.id),
    name: ChatTitle.optional(item.name),
    avatar: AvatarURL.optional(item.avatar),
    lastMessage:
      typeof item.lastMessage === "string" ? item.lastMessage : undefined,
    updatedAt: item.timestamp,
    type: item.type,
  };
}

export function mapSummaryToChatListItem(s: ChatSummaryProps): ChatListItem {
  return {
    id: s.id.value,
    name: s.name?.value,
    avatar: s.avatar?.value,
    lastMessage: s.lastMessage,
    timestamp: s.updatedAt,
    type: s.type,
  };
}
