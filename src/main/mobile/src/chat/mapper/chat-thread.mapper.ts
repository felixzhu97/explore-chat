import { Message as DomainMessage } from "@/chat/domain/model";
import {
  MessageEntity,
  MessageStatus,
  MessageType,
  type Message,
} from "@/chat/message.model";
import {
  ChatId,
  ClientMsgId,
  MessageId,
  type DeliveryStatusValue,
} from "@/chat/domain/vo";
import type { IncomingMessageProps } from "@/chat/domain/event";

const statusMap: Record<DeliveryStatusValue, MessageStatus> = {
  sending: MessageStatus.Sending,
  sent: MessageStatus.Sent,
  delivered: MessageStatus.Delivered,
  read: MessageStatus.Read,
  failed: MessageStatus.Failed,
};

export function mapDomainMessageToEntity(m: DomainMessage): Message {
  const s = m.toSnapshot();
  return new MessageEntity({
    id: s.id,
    chatId: s.chatId,
    clientMsgId: s.clientMsgId,
    senderId: s.senderId,
    senderName: s.senderName ?? "",
    content: s.content,
    type: (s.type as MessageType) || MessageType.Text,
    status: statusMap[s.status] ?? MessageStatus.Sent,
    timestamp: new Date(s.createdAt),
    isForwarded: false,
    forwardedFrom: [],
    ...(s.mediaUrl != null && { fileUrl: s.mediaUrl }),
  });
}

export function mapUiMessageToIncoming(message: Message): IncomingMessageProps {
  return {
    id: MessageId.create(message.id),
    chatId: ChatId.create(message.chatId),
    senderId: message.senderId,
    content: message.content,
    createdAt:
      message.timestamp instanceof Date
        ? message.timestamp.toISOString()
        : String(message.timestamp),
    type: message.type,
    status: message.status as DeliveryStatusValue,
    ...(message.clientMsgId != null && {
      clientMsgId: ClientMsgId.create(message.clientMsgId),
    }),
  };
}
