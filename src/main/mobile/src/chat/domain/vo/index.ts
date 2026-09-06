export class ChatId {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static create(raw: string): ChatId {
    const v = raw.trim();
    if (!v) throw new Error("ChatId must be non-empty");
    return new ChatId(v);
  }
  equals(other: ChatId): boolean {
    return this.value === other.value;
  }
}

export class MessageId {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static create(raw: string): MessageId {
    const v = raw.trim();
    if (!v) throw new Error("MessageId must be non-empty");
    return new MessageId(v);
  }
  equals(other: MessageId): boolean {
    return this.value === other.value;
  }
}

export class ClientMsgId {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static create(raw: string): ClientMsgId {
    const v = raw.trim();
    if (!v) throw new Error("ClientMsgId must be non-empty");
    return new ClientMsgId(v);
  }
  equals(other: ClientMsgId): boolean {
    return this.value === other.value;
  }
}

export class SenderId {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static create(raw: string): SenderId {
    const v = raw.trim();
    if (!v) throw new Error("SenderId must be non-empty");
    return new SenderId(v);
  }
}

export class MessageBody {
  readonly text: string;
  private constructor(text: string) {
    this.text = text;
  }
  static create(raw: string): MessageBody {
    return new MessageBody(raw.trim());
  }
}

export type DeliveryStatusValue =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

const TRANSITIONS: Record<DeliveryStatusValue, DeliveryStatusValue[]> = {
  sending: ["sent", "failed"],
  sent: ["delivered", "read", "failed"],
  delivered: ["read"],
  read: [],
  failed: ["sending"],
};

export class MessageDeliveryStatus {
  readonly value: DeliveryStatusValue;
  private constructor(value: DeliveryStatusValue) {
    this.value = value;
  }
  static of(value: DeliveryStatusValue): MessageDeliveryStatus {
    return new MessageDeliveryStatus(value);
  }
  canTransition(to: MessageDeliveryStatus): boolean {
    return TRANSITIONS[this.value].includes(to.value);
  }
  equals(other: MessageDeliveryStatus): boolean {
    return this.value === other.value;
  }
}

export class ChatTitle {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static optional(raw?: string | null): ChatTitle | undefined {
    if (raw == null || !raw.trim()) return undefined;
    return new ChatTitle(raw.trim());
  }
}

export class AvatarURL {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static optional(raw?: string | null): AvatarURL | undefined {
    if (raw == null || !raw.trim()) return undefined;
    return new AvatarURL(raw.trim());
  }
}
