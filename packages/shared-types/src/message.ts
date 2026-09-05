export const MessageTypeValues = [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "FILE",
  "LOCATION",
  "CONTACT",
  "VOICE",
  "text",
  "image",
  "video",
  "audio",
  "file",
  "location",
  "contact",
  "voice",
  "sticker",
  "gif",
  "system",
] as const;

export type MessageType = (typeof MessageTypeValues)[number];

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt?: Date | string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  type: "image" | "video" | "audio" | "file";
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

/** Minimal C→S send envelope (REST body or WS `message:send`). */
export interface SendMessagePayload {
  chatId: string;
  content: string;
  type?: MessageType | string;
  clientMsgId?: string;
  mediaUrl?: string;
  replyToMessageId?: string;
}

/** Socket.IO event names for the single IM path. */
export const ImWsEvents = {
  messageSend: "message:send",
  messageSent: "message:sent",
  messageReceived: "message:received",
  messageDelivered: "message:delivered",
  messageRead: "message:read",
  messageTyping: "message:typing",
  chatJoin: "chat:join",
  chatLeave: "chat:leave",
} as const;

export type ImWsEvent = (typeof ImWsEvents)[keyof typeof ImWsEvents];

export interface Message {
  id: string;
  chatId?: string;
  /** Client-generated id echoed on ack for optimistic reconcile. */
  clientMsgId?: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  status?: MessageStatus;
  timestamp?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  size?: number;
  fileName?: string;
  fileSize?: number | string;
  fileUrl?: string;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  location?: Location;
  contactInfo?: ContactInfo;
  isEdited?: boolean;
  isDeleted?: boolean;
  isForwarded?: boolean;
  originalMessageId?: string;
  replyToMessageId?: string;
  replyToId?: string;
  replyTo?: string;
  replyToContent?: string;
  reactions?: MessageReaction[];
  readBy?: string[];
  attachments?: Attachment[];
  isStarred?: boolean;
  editedAt?: string;
  forwardedFrom?: string[];
  metadata?: Record<string, unknown>;
}
