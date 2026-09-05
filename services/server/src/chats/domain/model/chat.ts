import { User } from "@/users/domain/model/user";
import { Message } from "@/messages/domain/model/message";

export type ChatType = "PRIVATE" | "GROUP";

export class Chat {
  constructor(
    public readonly id: string,
    public readonly type: ChatType,
    public readonly name?: string,
    public readonly avatar?: string,
    public readonly participants: User[] = [],
    public readonly lastMessage?: Message,
    public readonly unreadCount: number = 0,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id: string;
    type: ChatType;
    name?: string;
    avatar?: string;
    participants?: User[];
    lastMessage?: Message;
    unreadCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Chat {
    return new Chat(
      data.id,
      data.type,
      data.name,
      data.avatar,
      data.participants ?? [],
      data.lastMessage,
      data.unreadCount ?? 0,
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date(),
    );
  }

  updateLastMessage(message: Message): Chat {
    return new Chat(
      this.id,
      this.type,
      this.name,
      this.avatar,
      this.participants,
      message,
      this.unreadCount,
      this.createdAt,
      new Date(),
    );
  }

  incrementUnreadCount(): Chat {
    return new Chat(
      this.id,
      this.type,
      this.name,
      this.avatar,
      this.participants,
      this.lastMessage,
      this.unreadCount + 1,
      this.createdAt,
      new Date(),
    );
  }

  resetUnreadCount(): Chat {
    return new Chat(
      this.id,
      this.type,
      this.name,
      this.avatar,
      this.participants,
      this.lastMessage,
      0,
      this.createdAt,
      new Date(),
    );
  }

  /** User must already be a chat participant. */
  ensureParticipant(userId: string): void {
    const isParticipant = this.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new Error("No permission to send messages to this chat");
    }
  }
}
