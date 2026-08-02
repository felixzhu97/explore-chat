import {
  Message,
  MessageEntity,
  MessageType,
  MessageStatus,
} from "@/chat/message.model";

const SERVER_TYPE_MAP: Record<string, MessageType> = {
  TEXT: MessageType.Text,
  IMAGE: MessageType.Image,
  VIDEO: MessageType.Video,
  AUDIO: MessageType.Audio,
  FILE: MessageType.File,
  LOCATION: MessageType.Location,
  CONTACT: MessageType.Contact,
};

export function mapServerMessagePayloadToMessage(m: {
  id: string;
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  sender?: { id: string; username: string; avatar?: string };
}): Message {
  return new MessageEntity({
    id: m.id,
    chatId: m.chatId,
    senderId: m.senderId,
    senderName: m.sender?.username ?? "",
    senderAvatar: m.sender?.avatar,
    content: m.content,
    type: SERVER_TYPE_MAP[m.type] ?? MessageType.Text,
    status: MessageStatus.Sent,
    timestamp: new Date(m.createdAt),
    updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
    isForwarded: false,
    forwardedFrom: [],
  });
}

export function mapRecordToServerMessagePayload(p: Record<string, unknown>): {
  id: string;
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  sender?: { id: string; username: string; avatar?: string };
} {
  return {
    id: p.id as string,
    chatId: p.chatId as string,
    senderId: p.senderId as string,
    type: (p.type as string) ?? "TEXT",
    content: (p.content as string) ?? "",
    createdAt: (p.createdAt as string) ?? new Date().toISOString(),
    updatedAt: p.updatedAt as string | undefined,
    sender: p.sender as
      | { id: string; username: string; avatar?: string }
      | undefined,
  };
}

export function mapServerMessagePayload(p: Record<string, unknown>): Message {
  return mapServerMessagePayloadToMessage(mapRecordToServerMessagePayload(p));
}
