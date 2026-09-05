import type { Message as DomainMessage } from "@chat/shared-types";
import { toOptionalDate, toOptionalNumber } from "@/shared/value-coercion";

export enum MessageType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Location = "location",
  Contact = "contact",
  Sticker = "sticker",
  Gif = "gif",
  Voice = "voice",
  System = "system",
}

export enum MessageStatus {
  Sending = "sending",
  Sent = "sent",
  Delivered = "delivered",
  Read = "read",
  Failed = "failed",
}

export interface Message extends Omit<DomainMessage, "type" | "status"> {
  chatId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  isForwarded: boolean;
  forwardedFrom: string[];
}

export class MessageEntity implements Message {
  id: string;
  chatId: string;
  clientMsgId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  updatedAt?: Date;
  fileName?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  duration?: number;
  replyToId?: string;
  replyToContent?: string;
  isForwarded: boolean;
  forwardedFrom: string[];
  metadata?: Record<string, unknown>;

  constructor(data: Message) {
    this.id = data.id;
    this.chatId = data.chatId;
    this.clientMsgId = data.clientMsgId;
    this.senderId = data.senderId;
    this.senderName = data.senderName;
    this.senderAvatar = data.senderAvatar;
    this.content = data.content;
    this.type = data.type;
    this.status = data.status ?? MessageStatus.Sent;
    this.timestamp = data.timestamp;
    this.updatedAt = toOptionalDate(data.updatedAt);
    this.fileName = data.fileName;
    this.fileUrl = data.fileUrl;
    this.thumbnailUrl = data.thumbnailUrl;
    this.fileSize = toOptionalNumber(data.fileSize);
    this.mimeType = data.mimeType;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.locationName = data.locationName;
    this.duration = data.duration;
    this.replyToId = data.replyToId;
    this.replyToContent = data.replyToContent;
    this.isForwarded = data.isForwarded ?? false;
    this.forwardedFrom = data.forwardedFrom ?? [];
    this.metadata = data.metadata;
  }

  copyWith(updates: Partial<Message>): MessageEntity {
    return new MessageEntity({
      id: updates.id ?? this.id,
      chatId: updates.chatId ?? this.chatId,
      clientMsgId: updates.clientMsgId ?? this.clientMsgId,
      senderId: updates.senderId ?? this.senderId,
      senderName: updates.senderName ?? this.senderName,
      senderAvatar: updates.senderAvatar ?? this.senderAvatar,
      content: updates.content ?? this.content,
      type: updates.type ?? this.type,
      status: updates.status ?? this.status,
      timestamp: updates.timestamp ?? this.timestamp,
      updatedAt: updates.updatedAt ?? this.updatedAt,
      fileName: updates.fileName ?? this.fileName,
      fileUrl: updates.fileUrl ?? this.fileUrl,
      thumbnailUrl: updates.thumbnailUrl ?? this.thumbnailUrl,
      fileSize: updates.fileSize ?? this.fileSize,
      mimeType: updates.mimeType ?? this.mimeType,
      latitude: updates.latitude ?? this.latitude,
      longitude: updates.longitude ?? this.longitude,
      locationName: updates.locationName ?? this.locationName,
      duration: updates.duration ?? this.duration,
      replyToId: updates.replyToId ?? this.replyToId,
      replyToContent: updates.replyToContent ?? this.replyToContent,
      isForwarded: updates.isForwarded ?? this.isForwarded,
      forwardedFrom: updates.forwardedFrom ?? this.forwardedFrom,
      metadata: updates.metadata ?? this.metadata,
    });
  }

  toMap(): Record<string, unknown> {
    return {
      id: this.id,
      chatId: this.chatId,
      senderId: this.senderId,
      senderName: this.senderName,
      senderAvatar: this.senderAvatar,
      content: this.content,
      type: this.type,
      status: this.status,
      timestamp: this.timestamp.getTime(),
      updatedAt: this.updatedAt?.getTime(),
      fileName: this.fileName,
      fileUrl: this.fileUrl,
      thumbnailUrl: this.thumbnailUrl,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      latitude: this.latitude,
      longitude: this.longitude,
      locationName: this.locationName,
      duration: this.duration,
      replyToId: this.replyToId,
      replyToContent: this.replyToContent,
      isForwarded: this.isForwarded,
      forwardedFrom: this.forwardedFrom,
      metadata: this.metadata,
    };
  }

  static fromMap(map: Record<string, unknown>): MessageEntity {
    const messageTypeMap: Record<number, MessageType> = {
      0: MessageType.Text,
      1: MessageType.Image,
      2: MessageType.Video,
      3: MessageType.Audio,
      4: MessageType.File,
      5: MessageType.Location,
      6: MessageType.Contact,
      7: MessageType.Sticker,
      8: MessageType.Gif,
      9: MessageType.Voice,
      10: MessageType.System,
    };

    const messageStatusMap: Record<number, MessageStatus> = {
      0: MessageStatus.Sent,
      1: MessageStatus.Delivered,
      2: MessageStatus.Read,
      3: MessageStatus.Failed,
    };

    return new MessageEntity({
      id: (map.id as string) ?? "",
      chatId: (map.chatId as string) ?? "",
      senderId: (map.senderId as string) ?? "",
      senderName: (map.senderName as string) ?? "",
      senderAvatar: map.senderAvatar as string | undefined,
      content: (map.content as string) ?? "",
      type: messageTypeMap[(map.type as number) ?? 0] ?? MessageType.Text,
      status:
        messageStatusMap[(map.status as number) ?? 0] ?? MessageStatus.Sent,
      timestamp: new Date(map.timestamp as number),
      updatedAt: map.updatedAt ? new Date(map.updatedAt as number) : undefined,
      fileName: map.fileName as string | undefined,
      fileUrl: map.fileUrl as string | undefined,
      thumbnailUrl: map.thumbnailUrl as string | undefined,
      fileSize: map.fileSize as number | undefined,
      mimeType: map.mimeType as string | undefined,
      latitude: map.latitude as number | undefined,
      longitude: map.longitude as number | undefined,
      locationName: map.locationName as string | undefined,
      duration: map.duration as number | undefined,
      replyToId: map.replyToId as string | undefined,
      replyToContent: map.replyToContent as string | undefined,
      isForwarded: (map.isForwarded as boolean) ?? false,
      forwardedFrom: Array.isArray(map.forwardedFrom)
        ? (map.forwardedFrom as string[])
        : [],
      metadata: map.metadata as Record<string, unknown> | undefined,
    });
  }

  toString(): string {
    return `Message(id: ${this.id}, type: ${this.type}, content: ${this.content}, timestamp: ${this.timestamp})`;
  }

  equals(other: Message): boolean {
    return this.id === other.id;
  }
}
