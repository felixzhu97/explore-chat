import type { MessageReaction, ContactInfo } from "@whatschat/shared-types";
import { MessageTypeValues } from "@whatschat/shared-types";

export type MessageType = (typeof MessageTypeValues)[number];

export type { MessageReaction, ContactInfo };

export class Message {
  constructor(
    public readonly id: string,
    public readonly chatId: string,
    public readonly senderId: string,
    public readonly type: MessageType,
    public readonly content: string,
    public readonly mediaUrl?: string,
    public readonly thumbnailUrl?: string,
    public readonly duration?: number,
    public readonly size?: number,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly contactInfo?: ContactInfo,
    public readonly isEdited: boolean = false,
    public readonly isDeleted: boolean = false,
    public readonly isForwarded: boolean = false,
    public readonly originalMessageId?: string,
    public readonly replyToMessageId?: string,
    public readonly reactions: MessageReaction[] = [],
    public readonly readBy: string[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id: string;
    chatId: string;
    senderId: string;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    size?: number;
    latitude?: number;
    longitude?: number;
    contactInfo?: ContactInfo;
    isEdited?: boolean;
    isDeleted?: boolean;
    isForwarded?: boolean;
    originalMessageId?: string;
    replyToMessageId?: string;
    reactions?: MessageReaction[];
    readBy?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Message {
    return new Message(
      data.id,
      data.chatId,
      data.senderId,
      data.type,
      data.content,
      data.mediaUrl,
      data.thumbnailUrl,
      data.duration,
      data.size,
      data.latitude,
      data.longitude,
      data.contactInfo,
      data.isEdited ?? false,
      data.isDeleted ?? false,
      data.isForwarded ?? false,
      data.originalMessageId,
      data.replyToMessageId,
      data.reactions ?? [],
      data.readBy ?? [],
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date(),
    );
  }

  edit(content: string): Message {
    return new Message(
      this.id,
      this.chatId,
      this.senderId,
      this.type,
      content,
      this.mediaUrl,
      this.thumbnailUrl,
      this.duration,
      this.size,
      this.latitude,
      this.longitude,
      this.contactInfo,
      true,
      this.isDeleted,
      this.isForwarded,
      this.originalMessageId,
      this.replyToMessageId,
      this.reactions,
      this.readBy,
      this.createdAt,
      new Date(),
    );
  }

  delete(): Message {
    return new Message(
      this.id,
      this.chatId,
      this.senderId,
      this.type,
      this.content,
      this.mediaUrl,
      this.thumbnailUrl,
      this.duration,
      this.size,
      this.latitude,
      this.longitude,
      this.contactInfo,
      this.isEdited,
      true,
      this.isForwarded,
      this.originalMessageId,
      this.replyToMessageId,
      this.reactions,
      this.readBy,
      this.createdAt,
      new Date(),
    );
  }

  addReaction(userId: string, emoji: string): Message {
    const existingReaction = this.reactions.find(
      (r) => r.userId === userId && r.emoji === emoji,
    );
    if (existingReaction) {
      return this;
    }

    return new Message(
      this.id,
      this.chatId,
      this.senderId,
      this.type,
      this.content,
      this.mediaUrl,
      this.thumbnailUrl,
      this.duration,
      this.size,
      this.latitude,
      this.longitude,
      this.contactInfo,
      this.isEdited,
      this.isDeleted,
      this.isForwarded,
      this.originalMessageId,
      this.replyToMessageId,
      [...this.reactions, { userId, emoji, createdAt: new Date() }],
      this.readBy,
      this.createdAt,
      new Date(),
    );
  }

  markAsRead(userId: string): Message {
    if (this.readBy.includes(userId)) {
      return this;
    }

    return new Message(
      this.id,
      this.chatId,
      this.senderId,
      this.type,
      this.content,
      this.mediaUrl,
      this.thumbnailUrl,
      this.duration,
      this.size,
      this.latitude,
      this.longitude,
      this.contactInfo,
      this.isEdited,
      this.isDeleted,
      this.isForwarded,
      this.originalMessageId,
      this.replyToMessageId,
      this.reactions,
      [...this.readBy, userId],
      this.createdAt,
      new Date(),
    );
  }
}
