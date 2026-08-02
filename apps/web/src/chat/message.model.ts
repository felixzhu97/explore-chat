export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "voice";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

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

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: MessageType;
  status: MessageStatus;
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: string;
  isStarred?: boolean;
  isForwarded?: boolean;
  attachments?: Attachment[];
  duration?: number;
  fileName?: string;
  fileSize?: string;
  location?: Location;
  mediaUrl?: string;
}

export function mapMessage(
  data: Partial<Message> &
    Pick<Message, "id" | "senderId" | "senderName" | "content" | "timestamp">,
): Message {
  return {
    type: data.type ?? "text",
    status: data.status ?? "sending",
    ...data,
  };
}

export function editMessage(message: Message, newContent: string): Message {
  return {
    ...message,
    content: newContent,
    isEdited: true,
    editedAt: new Date().toISOString(),
  };
}

export function toggleStarMessage(message: Message): Message {
  return { ...message, isStarred: !message.isStarred };
}
