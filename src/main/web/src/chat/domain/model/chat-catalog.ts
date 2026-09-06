import type { ClientDomainEvent } from "@/chat/domain/event";
import { ChatId, ChatTitle, AvatarURL } from "@/chat/domain/vo";

export type ChatSummaryProps = {
  id: ChatId;
  name?: ChatTitle;
  avatar?: AvatarURL;
  lastMessage?: string;
  lastMessageId?: string;
  updatedAt?: string;
  type?: string;
};

export class ChatCatalog {
  private events: ClientDomainEvent[] = [];

  private constructor(private chats: ChatSummaryProps[]) {}

  static empty(): ChatCatalog {
    return new ChatCatalog([]);
  }

  static of(chats: ChatSummaryProps[]): ChatCatalog {
    return new ChatCatalog([...chats]);
  }

  list(): ChatSummaryProps[] {
    return [...this.chats].sort((a, b) =>
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
    );
  }

  replaceAll(summaries: ChatSummaryProps[]): void {
    this.chats = [...summaries];
    this.events.push({
      type: "CatalogReplaced",
      chatIds: summaries.map((c) => c.id.value),
    });
  }

  applyPreview(
    chatId: ChatId,
    last: { messageId: string; content: string; at: string },
  ): void {
    const idx = this.chats.findIndex((c) => c.id.equals(chatId));
    if (idx === -1) {
      this.chats.push({
        id: chatId,
        lastMessage: last.content,
        lastMessageId: last.messageId,
        updatedAt: last.at,
      });
    } else {
      this.chats[idx] = {
        ...this.chats[idx],
        lastMessage: last.content,
        lastMessageId: last.messageId,
        updatedAt: last.at,
      };
    }
    this.events.push({
      type: "ChatPreviewChanged",
      chatId: chatId.value,
      lastMessageId: last.messageId,
      content: last.content,
      at: last.at,
    });
  }

  pullDomainEvents(): ClientDomainEvent[] {
    const out = [...this.events];
    this.events = [];
    return out;
  }
}
