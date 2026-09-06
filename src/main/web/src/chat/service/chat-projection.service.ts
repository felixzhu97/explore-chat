import { ChatCatalog, ChatThread, Message } from "@/chat/domain/model";
import type { ChatProjectionRepository } from "@/chat/domain/repository";
import type { ClientDomainEvent } from "@/chat/domain/event";
import {
  ChatId,
  ClientMsgId,
  MessageId,
  type DeliveryStatusValue,
} from "@/chat/domain/vo";
import type { ChatListItem } from "@/chat/chats.service.types";
import type { IChatsService } from "@/chat/chats.service.types";
import {
  mapApiMessageToIncoming,
  mapChatListItemToSummary,
  mapDomainMessageToUi,
  mapSocketToIncoming,
  mapSummaryToChatListItem,
} from "@/chat/mapper/chat-projection.mapper";
import type { Message as UiMessage } from "@/shared/types/message";
import type {
  ApiMessageLike,
  SocketMessagePayload,
} from "@/shared/utils/message-mappers.impl";
import { MESSAGE_LIMIT } from "@/chat/message-constants";

export class ChatProjectionService {
  private catalog = ChatCatalog.empty();
  private threads = new Map<string, ChatThread>();

  constructor(
    private readonly repo: ChatProjectionRepository,
    private readonly chatsService: IChatsService,
  ) {}

  getChatListItems(): ChatListItem[] {
    return this.catalog.list().map(mapSummaryToChatListItem);
  }

  getMessagesForChat(chatId: string): UiMessage[] {
    const thread = this.threads.get(chatId);
    if (!thread) return [];
    return thread.timeline().map(mapDomainMessageToUi);
  }

  async refreshCatalog(): Promise<ChatListItem[]> {
    const chats = await this.chatsService.getChats().catch(() => []);
    this.catalog.replaceAll(chats.map(mapChatListItemToSummary));
    await this.repo.upsertChats(
      chats.map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        lastMessageContent:
          typeof c.lastMessage === "string" ? c.lastMessage : undefined,
        updatedAt: c.timestamp,
        type: c.type,
      })),
    );
    await this.drain(this.catalog.pullDomainEvents());
    return this.getChatListItems();
  }

  async refreshThread(chatId: string): Promise<UiMessage[]> {
    const id = ChatId.create(chatId);
    let thread = this.threads.get(chatId);
    if (!thread) {
      const stored = await this.repo.listMessages(chatId);
      thread = ChatThread.rehydrate(
        id,
        stored.map((r) =>
          Message.create({
            id: MessageId.create(r.id),
            chatId: r.chatId,
            senderId: r.senderId,
            content: r.content,
            createdAt: r.createdAt ?? new Date().toISOString(),
            status: r.status,
            type: r.type,
            ...(r.clientMsgId != null && {
              clientMsgId: ClientMsgId.create(r.clientMsgId),
            }),
            mediaUrl: r.mediaUrl,
            senderName: r.senderName,
          }),
        ),
      );
      this.threads.set(chatId, thread);
    }

    const list = await this.chatsService
      .getChatMessages(chatId, { limit: MESSAGE_LIMIT })
      .catch(() => []);
    const incoming = list.map((m) => {
      const props = mapApiMessageToIncoming(m as unknown as ApiMessageLike);
      return { ...props, chatId: id };
    });
    thread.hydrate(incoming);
    await this.repo.replaceMessages(
      chatId,
      thread.timeline().map((m) => m.toSnapshot()),
    );
    await this.applyEvents(thread.pullDomainEvents());
    return this.getMessagesForChat(chatId);
  }

  acceptSocketPayload(
    payload: SocketMessagePayload,
    currentUserId: string | undefined,
  ): void {
    if (!payload.from || payload.from === currentUserId) return;
    const chatId = payload.to;
    if (!chatId) return;
    const incoming = mapSocketToIncoming(payload, chatId);
    if (!incoming) return;
    const thread = this.ensureThread(chatId);
    thread.accept(incoming);
    void this.persistThread(thread);
  }

  applySentAck(data: {
    id: string;
    chatId: string;
    clientMsgId?: string;
    createdAt?: string;
    content?: string;
    mediaUrl?: string;
  }): void {
    const thread = this.ensureThread(data.chatId);
    thread.applyDelivery(
      MessageId.create(data.id),
      "sent",
      data.clientMsgId != null
        ? ClientMsgId.create(data.clientMsgId)
        : undefined,
      data.content,
    );
    void this.persistThread(thread);
  }

  applyDeliveryAck(data: {
    messageId: string;
    chatId: string;
    clientMsgId?: string;
    status: DeliveryStatusValue;
  }): void {
    const thread = this.ensureThread(data.chatId);
    thread.applyDelivery(
      MessageId.create(data.messageId),
      data.status,
      data.clientMsgId != null
        ? ClientMsgId.create(data.clientMsgId)
        : undefined,
    );
    void this.persistThread(thread);
  }

  applyReadAck(messageId: string): void {
    const mid = MessageId.create(messageId);
    for (const thread of this.threads.values()) {
      thread.applyDelivery(mid, "read");
      void this.persistThread(thread);
    }
  }

  sendOptimistic(
    chatId: string,
    content: string,
    senderId: string,
    type: string,
    options?: { mediaUrl?: string },
  ): { clientMsgId: string; messages: UiMessage[] } {
    const thread = this.ensureThread(chatId);
    const { clientMsgId } = thread.sendOptimistic({
      content,
      senderId,
      type,
      mediaUrl: options?.mediaUrl,
    });
    void this.persistThread(thread);
    return {
      clientMsgId: clientMsgId.value,
      messages: this.getMessagesForChat(chatId),
    };
  }

  markSendFailed(chatId: string, clientMsgId: string): void {
    const thread = this.threads.get(chatId);
    if (!thread) return;
    thread.markFailed(ClientMsgId.create(clientMsgId));
    void this.persistThread(thread);
  }

  private ensureThread(chatId: string): ChatThread {
    let thread = this.threads.get(chatId);
    if (!thread) {
      thread = ChatThread.empty(ChatId.create(chatId));
      this.threads.set(chatId, thread);
    }
    return thread;
  }

  private async persistThread(thread: ChatThread): Promise<void> {
    const events = thread.pullDomainEvents();
    for (const m of thread.timeline()) {
      await this.repo.upsertMessage(m.toSnapshot());
    }
    await this.applyEvents(events);
  }

  private async applyEvents(events: ClientDomainEvent[]): Promise<void> {
    for (const e of events) {
      if (e.type === "LastMessageChanged" || e.type === "ChatPreviewChanged") {
        const chatId =
          e.type === "LastMessageChanged" ? e.chatId : e.chatId;
        const messageId =
          e.type === "LastMessageChanged" ? e.messageId : e.lastMessageId;
        const content = e.content;
        const at = e.at;
        this.catalog.applyPreview(ChatId.create(chatId), {
          messageId,
          content,
          at,
        });
        const previewEvents = this.catalog.pullDomainEvents();
        await this.repo.upsertChats([
          {
            id: chatId,
            lastMessageId: messageId,
            lastMessageContent: content,
            lastMessageAt: at,
            updatedAt: at,
          },
        ]);
        void previewEvents;
      }
    }
    await this.drain(events);
  }

  private async drain(_events: ClientDomainEvent[]): Promise<void> {
    // Side effects already applied; hook re-reads snapshots.
  }
}
