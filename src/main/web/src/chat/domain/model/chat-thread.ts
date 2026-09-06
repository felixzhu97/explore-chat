import type { ClientDomainEvent, IncomingMessageProps } from "@/chat/domain/event";
import { Message } from "@/chat/domain/model/message";
import {
  ChatId,
  ClientMsgId,
  MessageDeliveryStatus,
  MessageId,
  type DeliveryStatusValue,
} from "@/chat/domain/vo";

function sortByCreatedAt(a: Message, b: Message): number {
  return a.createdAt.localeCompare(b.createdAt);
}

export class ChatThread {
  private events: ClientDomainEvent[] = [];

  private constructor(
    readonly chatId: ChatId,
    private messages: Message[],
  ) {}

  static empty(chatId: ChatId): ChatThread {
    return new ChatThread(chatId, []);
  }

  static rehydrate(chatId: ChatId, messages: Message[]): ChatThread {
    return new ChatThread(chatId, [...messages].sort(sortByCreatedAt));
  }

  timeline(): Message[] {
    return [...this.messages].sort(sortByCreatedAt);
  }

  hydrate(remote: IncomingMessageProps[]): void {
    const byKey = new Map<string, Message>();
    for (const m of this.messages) {
      byKey.set(m.id.value, m);
      if (m.clientMsgId) byKey.set(`c:${m.clientMsgId.value}`, m);
    }

    for (const r of remote) {
      const incoming = Message.create({
        id: r.id,
        chatId: this.chatId.value,
        senderId: r.senderId,
        content: r.content,
        createdAt: r.createdAt,
        status: r.status ?? "sent",
        type: r.type,
        clientMsgId: r.clientMsgId,
        mediaUrl: r.mediaUrl,
        senderName: r.senderName,
      });
      const existing =
        (r.clientMsgId && byKey.get(`c:${r.clientMsgId.value}`)) ||
        byKey.get(r.id.value);
      if (existing?.status.value === "sending" && r.clientMsgId) {
        existing.promote(r.id, r.createdAt);
      } else if (!existing) {
        this.messages.push(incoming);
        byKey.set(incoming.id.value, incoming);
        if (incoming.clientMsgId)
          byKey.set(`c:${incoming.clientMsgId.value}`, incoming);
      } else {
        const idx = this.messages.findIndex((m) => m.id.equals(existing.id));
        if (idx !== -1) this.messages[idx] = incoming;
      }
    }
    this.messages.sort(sortByCreatedAt);
    this.events.push({
      type: "ThreadHydrated",
      chatId: this.chatId.value,
      messageIds: this.messages.map((m) => m.id.value),
    });
    this.emitLastPreview();
  }

  accept(incoming: IncomingMessageProps): void {
    if (this.messages.some((m) => m.id.equals(incoming.id))) return;

    if (incoming.clientMsgId) {
      const optimistic = this.messages.find(
        (m) =>
          m.clientMsgId?.equals(incoming.clientMsgId!) ||
          m.id.value === incoming.clientMsgId!.value,
      );
      if (optimistic) {
        optimistic.promote(incoming.id, incoming.createdAt);
        this.events.push({
          type: "MessageAccepted",
          chatId: this.chatId.value,
          messageId: incoming.id.value,
        });
        this.emitLastPreview();
        return;
      }
    }

    const msg = Message.create({
      id: incoming.id,
      chatId: this.chatId.value,
      senderId: incoming.senderId,
      content: incoming.content,
      createdAt: incoming.createdAt,
      status: incoming.status ?? "delivered",
      type: incoming.type,
      clientMsgId: incoming.clientMsgId,
      mediaUrl: incoming.mediaUrl,
      senderName: incoming.senderName,
    });
    this.messages.push(msg);
    this.messages.sort(sortByCreatedAt);
    this.events.push({
      type: "MessageAccepted",
      chatId: this.chatId.value,
      messageId: msg.id.value,
    });
    this.emitLastPreview();
  }

  sendOptimistic(props: {
    content: string;
    senderId: string;
    type?: string;
    mediaUrl?: string;
    senderName?: string;
  }): { clientMsgId: ClientMsgId; message: Message } {
    const clientMsgId = ClientMsgId.create(
      `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    );
    const message = Message.create({
      id: MessageId.create(clientMsgId.value),
      chatId: this.chatId.value,
      senderId: props.senderId,
      content: props.content,
      createdAt: new Date().toISOString(),
      status: "sending",
      type: props.type ?? "text",
      clientMsgId,
      mediaUrl: props.mediaUrl,
      senderName: props.senderName ?? "我",
    });
    this.messages.push(message);
    this.events.push({
      type: "MessageAccepted",
      chatId: this.chatId.value,
      messageId: message.id.value,
    });
    this.emitLastPreview();
    return { clientMsgId, message };
  }

  markFailed(clientMsgId: ClientMsgId): void {
    const msg = this.messages.find((m) => m.clientMsgId?.equals(clientMsgId));
    if (!msg) return;
    if (msg.transition(MessageDeliveryStatus.of("failed"))) {
      this.events.push({
        type: "DeliveryStatusChanged",
        chatId: this.chatId.value,
        messageId: msg.id.value,
        status: "failed",
      });
    }
  }

  applyDelivery(
    messageId: MessageId,
    status: DeliveryStatusValue,
    clientMsgId?: ClientMsgId,
    contentHint?: string,
  ): void {
    let msg = this.messages.find((m) =>
      m.matchesIdentity(messageId, clientMsgId),
    );
    if (!msg && contentHint) {
      msg = this.messages.find(
        (m) => m.status.value === "sending" && m.content === contentHint,
      );
    }
    if (!msg) return;

    if (status === "sent" && msg.status.value === "sending") {
      msg.promote(messageId);
    } else {
      msg.transition(MessageDeliveryStatus.of(status));
    }
    this.events.push({
      type: "DeliveryStatusChanged",
      chatId: this.chatId.value,
      messageId: msg.id.value,
      status: msg.status.value,
    });
  }

  private emitLastPreview(): void {
    const last = this.timeline().at(-1);
    if (!last) return;
    this.events.push({
      type: "LastMessageChanged",
      chatId: this.chatId.value,
      messageId: last.id.value,
      content: last.content,
      at: last.createdAt,
    });
  }

  pullDomainEvents(): ClientDomainEvent[] {
    const out = [...this.events];
    this.events = [];
    return out;
  }
}
