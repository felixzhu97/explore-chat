import { ChatThread } from "@/chat/domain/model";
import { ChatId, ClientMsgId, MessageId } from "@/chat/domain/vo";
import type { Message } from "@/chat/message.model";
import {
  mapDomainMessageToEntity,
  mapUiMessageToIncoming,
} from "@/chat/mapper/chat-thread.mapper";

/** Application orchestration for a single chat thread (mobile). */
export class ChatThreadService {
  private thread: ChatThread;

  constructor(chatId: string) {
    this.thread = ChatThread.empty(ChatId.create(chatId));
  }

  hydrateFromList(messages: Message[]): Message[] {
    this.thread.hydrate(messages.map(mapUiMessageToIncoming));
    this.thread.pullDomainEvents();
    return this.timeline();
  }

  acceptIncoming(message: Message): Message[] {
    this.thread.accept(mapUiMessageToIncoming(message));
    this.thread.pullDomainEvents();
    return this.timeline();
  }

  applySent(message: Message): Message[] {
    this.thread.applyDelivery(
      MessageId.create(message.id),
      "sent",
      message.clientMsgId != null
        ? ClientMsgId.create(message.clientMsgId)
        : undefined,
      message.content,
    );
    this.thread.pullDomainEvents();
    return this.timeline();
  }

  applyDelivered(payload: {
    messageId: string;
    clientMsgId?: string;
  }): Message[] {
    this.thread.applyDelivery(
      MessageId.create(payload.messageId),
      "delivered",
      payload.clientMsgId != null
        ? ClientMsgId.create(payload.clientMsgId)
        : undefined,
    );
    this.thread.pullDomainEvents();
    return this.timeline();
  }

  sendOptimistic(props: {
    content: string;
    senderId: string;
  }): { clientMsgId: string; messages: Message[] } {
    const { clientMsgId } = this.thread.sendOptimistic({
      content: props.content,
      senderId: props.senderId,
      type: "text",
      senderName: "我",
    });
    this.thread.pullDomainEvents();
    return { clientMsgId: clientMsgId.value, messages: this.timeline() };
  }

  markFailed(clientMsgId: string): Message[] {
    this.thread.markFailed(ClientMsgId.create(clientMsgId));
    this.thread.pullDomainEvents();
    return this.timeline();
  }

  timeline(): Message[] {
    return this.thread.timeline().map(mapDomainMessageToEntity);
  }
}
