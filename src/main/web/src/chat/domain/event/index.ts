import type { ChatId, ClientMsgId, MessageId } from "@/chat/domain/vo";
import type { DeliveryStatusValue } from "@/chat/domain/vo";

export type ClientDomainEvent =
  | { type: "ThreadHydrated"; chatId: string; messageIds: string[] }
  | { type: "MessageAccepted"; chatId: string; messageId: string }
  | {
      type: "LastMessageChanged";
      chatId: string;
      messageId: string;
      content: string;
      at: string;
    }
  | {
      type: "DeliveryStatusChanged";
      chatId: string;
      messageId: string;
      status: DeliveryStatusValue;
    }
  | { type: "CatalogReplaced"; chatIds: string[] }
  | {
      type: "ChatPreviewChanged";
      chatId: string;
      lastMessageId: string;
      content: string;
      at: string;
    };

export type IncomingMessageProps = {
  id: MessageId;
  chatId: ChatId;
  senderId: string;
  content: string;
  createdAt: string;
  type?: string;
  status?: DeliveryStatusValue;
  clientMsgId?: ClientMsgId;
  mediaUrl?: string;
  senderName?: string;
};
