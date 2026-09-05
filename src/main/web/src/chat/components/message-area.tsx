"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { Contact, Message } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";

interface MessageAreaProps {
  messages: Message[];
  selectedContact: Contact | null;
  currentUserId?: string | null;
  isGroup?: boolean;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, text: string) => void;
  onDelete: (messageId: string) => void;
  onForward: (message: Message) => void;
  onStar: (messageId: string) => void;
  onInfo: (message: Message) => void;
}

const MessageAreaShell = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255);
`;

const EmptyText = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  background-color: rgb(255 255 255);
`;

const InnerEmpty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
`;

export function MessageArea({
  messages,
  selectedContact,
  currentUserId = null,
  isGroup = false,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedContact) {
    return (
      <MessageAreaShell>
        <EmptyText>选择一个联系人开始聊天</EmptyText>
      </MessageAreaShell>
    );
  }

  return (
    <MessageList>
      {messages.length === 0 ? (
        <InnerEmpty>
          <EmptyText>还没有消息，开始聊天吧！</EmptyText>
        </InnerEmpty>
      ) : (
        messages.map((message, index) => {
          const isOwn =
            currentUserId != null
              ? message.senderId === currentUserId ||
                message.senderId === "current-user" ||
                message.senderId === "me"
              : undefined;
          const prev = messages[index - 1];
          const sameSenderAbove = !!prev && prev.senderId === message.senderId;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isGroup={isGroup}
              isOwn={isOwn}
              sameSenderAbove={sameSenderAbove}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onForward={onForward}
              onStar={onStar}
              onInfo={onInfo}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </MessageList>
  );
}
