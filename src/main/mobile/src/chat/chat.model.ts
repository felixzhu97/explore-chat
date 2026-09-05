import type { Chat as DomainChat } from "@whatschat/shared-types";
import { toOptionalDate } from "@/shared/value-coercion";

export enum ChatType {
  Individual = "individual",
  Group = "group",
  Broadcast = "broadcast",
}

export interface Chat extends Omit<DomainChat, "type"> {
  type: ChatType;
  name: string;
  participantIds: string[];
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  adminIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatEntity implements Chat {
  id: string;
  name: string;
  description?: string;
  type: ChatType;
  participantIds: string[];
  groupImage?: string;
  lastMessageId?: string;
  lastMessageContent?: string;
  lastMessageTime?: Date;
  lastMessageSender?: string;
  unreadCount: number;
  isMuted: boolean;
  mutedUntil?: Date;
  isPinned: boolean;
  isArchived: boolean;
  adminId?: string;
  adminIds: string[];
  createdAt: Date;
  updatedAt: Date;
  settings?: Record<string, unknown>;

  constructor(data: Chat) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.participantIds = data.participantIds;
    this.groupImage = data.groupImage;
    this.lastMessageId = data.lastMessageId;
    this.lastMessageContent = data.lastMessageContent;
    this.lastMessageTime = toOptionalDate(data.lastMessageTime);
    this.lastMessageSender = data.lastMessageSender;
    this.unreadCount = data.unreadCount ?? 0;
    this.isMuted = data.isMuted ?? false;
    this.mutedUntil = toOptionalDate(data.mutedUntil);
    this.isPinned = data.isPinned ?? false;
    this.isArchived = data.isArchived ?? false;
    this.adminId = data.adminId;
    this.adminIds = data.adminIds ?? [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.settings = data.settings;
  }

  copyWith(updates: Partial<Chat>): ChatEntity {
    return new ChatEntity({
      id: updates.id ?? this.id,
      name: updates.name ?? this.name,
      description: updates.description ?? this.description,
      type: updates.type ?? this.type,
      participantIds: updates.participantIds ?? this.participantIds,
      groupImage: updates.groupImage ?? this.groupImage,
      lastMessageId: updates.lastMessageId ?? this.lastMessageId,
      lastMessageContent: updates.lastMessageContent ?? this.lastMessageContent,
      lastMessageTime: updates.lastMessageTime ?? this.lastMessageTime,
      lastMessageSender: updates.lastMessageSender ?? this.lastMessageSender,
      unreadCount: updates.unreadCount ?? this.unreadCount,
      isMuted: updates.isMuted ?? this.isMuted,
      mutedUntil: updates.mutedUntil ?? this.mutedUntil,
      isPinned: updates.isPinned ?? this.isPinned,
      isArchived: updates.isArchived ?? this.isArchived,
      adminId: updates.adminId ?? this.adminId,
      adminIds: updates.adminIds ?? this.adminIds,
      createdAt: updates.createdAt ?? this.createdAt,
      updatedAt: updates.updatedAt ?? this.updatedAt,
      settings: updates.settings ?? this.settings,
    });
  }

  toMap(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      participantIds: this.participantIds,
      groupImage: this.groupImage,
      lastMessageId: this.lastMessageId,
      lastMessageContent: this.lastMessageContent,
      lastMessageTime: this.lastMessageTime?.getTime(),
      lastMessageSender: this.lastMessageSender,
      unreadCount: this.unreadCount,
      isMuted: this.isMuted,
      mutedUntil: this.mutedUntil?.getTime(),
      isPinned: this.isPinned,
      isArchived: this.isArchived,
      adminId: this.adminId,
      adminIds: this.adminIds,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
      settings: this.settings,
    };
  }

  static fromMap(map: Record<string, unknown>): ChatEntity {
    const chatTypeMap: Record<number, ChatType> = {
      0: ChatType.Individual,
      1: ChatType.Group,
      2: ChatType.Broadcast,
    };

    return new ChatEntity({
      id: (map.id as string) ?? "",
      name: (map.name as string) ?? "",
      description: map.description as string | undefined,
      type: chatTypeMap[(map.type as number) ?? 0] ?? ChatType.Individual,
      participantIds: Array.isArray(map.participantIds)
        ? (map.participantIds as string[])
        : [],
      groupImage: map.groupImage as string | undefined,
      lastMessageId: map.lastMessageId as string | undefined,
      lastMessageContent: map.lastMessageContent as string | undefined,
      lastMessageTime: map.lastMessageTime
        ? new Date(map.lastMessageTime as number)
        : undefined,
      lastMessageSender: map.lastMessageSender as string | undefined,
      unreadCount: (map.unreadCount as number) ?? 0,
      isMuted: (map.isMuted as boolean) ?? false,
      mutedUntil: map.mutedUntil
        ? new Date(map.mutedUntil as number)
        : undefined,
      isPinned: (map.isPinned as boolean) ?? false,
      isArchived: (map.isArchived as boolean) ?? false,
      adminId: map.adminId as string | undefined,
      adminIds: Array.isArray(map.adminIds) ? (map.adminIds as string[]) : [],
      createdAt: new Date(map.createdAt as number),
      updatedAt: new Date(map.updatedAt as number),
      settings: map.settings as Record<string, unknown> | undefined,
    });
  }

  get isGroup(): boolean {
    return this.type === ChatType.Group;
  }

  get isIndividual(): boolean {
    return this.type === ChatType.Individual;
  }

  get isBroadcast(): boolean {
    return this.type === ChatType.Broadcast;
  }

  toString(): string {
    return `Chat(id: ${this.id}, name: ${this.name}, type: ${this.type}, participantIds: ${this.participantIds.length})`;
  }

  equals(other: Chat): boolean {
    return this.id === other.id;
  }
}
