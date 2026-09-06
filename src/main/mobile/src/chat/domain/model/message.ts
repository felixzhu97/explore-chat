import {
  ClientMsgId,
  MessageDeliveryStatus,
  MessageId,
  type DeliveryStatusValue,
} from "@/chat/domain/vo";

export class Message {
  private constructor(
    private _id: MessageId,
    readonly chatId: string,
    readonly senderId: string,
    readonly content: string,
    private _createdAt: string,
    private _status: MessageDeliveryStatus,
    readonly type: string,
    private _clientMsgId: ClientMsgId | undefined,
    readonly mediaUrl: string | undefined,
    readonly senderName: string | undefined,
  ) {}

  static create(props: {
    id: MessageId;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
    status?: DeliveryStatusValue;
    type?: string;
    clientMsgId?: ClientMsgId;
    mediaUrl?: string;
    senderName?: string;
  }): Message {
    return new Message(
      props.id,
      props.chatId,
      props.senderId,
      props.content,
      props.createdAt,
      MessageDeliveryStatus.of(props.status ?? "sent"),
      props.type ?? "text",
      props.clientMsgId,
      props.mediaUrl,
      props.senderName,
    );
  }

  get id(): MessageId {
    return this._id;
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get status(): MessageDeliveryStatus {
    return this._status;
  }
  get clientMsgId(): ClientMsgId | undefined {
    return this._clientMsgId;
  }

  promote(toServerId: MessageId, createdAt?: string): void {
    this._id = toServerId;
    if (createdAt) this._createdAt = createdAt;
    const sent = MessageDeliveryStatus.of("sent");
    if (this._status.canTransition(sent) || this._status.value === "sending") {
      this._status = sent;
    }
  }

  transition(to: MessageDeliveryStatus): boolean {
    if (!this._status.canTransition(to)) return false;
    this._status = to;
    return true;
  }

  matchesIdentity(messageId: MessageId, clientMsgId?: ClientMsgId): boolean {
    if (this._id.equals(messageId)) return true;
    if (clientMsgId && this._clientMsgId?.equals(clientMsgId)) return true;
    if (this._clientMsgId && this._clientMsgId.value === messageId.value)
      return true;
    return false;
  }

  toSnapshot(): {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
    status: DeliveryStatusValue;
    type: string;
    clientMsgId?: string;
    mediaUrl?: string;
    senderName?: string;
  } {
    return {
      id: this._id.value,
      chatId: this.chatId,
      senderId: this.senderId,
      content: this.content,
      createdAt: this._createdAt,
      status: this._status.value,
      type: this.type,
      ...(this._clientMsgId && { clientMsgId: this._clientMsgId.value }),
      ...(this.mediaUrl != null && { mediaUrl: this.mediaUrl }),
      ...(this.senderName != null && { senderName: this.senderName }),
    };
  }
}
