"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { Message } from "@chat/shared-types";
import { ImWsEvents } from "@chat/shared-types";
import type { IWebSocketAdapter } from "../domain/websocket.adapter";
import type { IChatsService, ChatListItem } from "../domain/chats.service";
import type {
  ApiMessageLike,
  SocketMessagePayload,
} from "../application/message-mapping.types";
import {
  mapApiMessageToMessage,
  mapSocketPayloadToMessage,
  mergeAndSortMessages,
} from "../application/mappers";
import { MESSAGE_LIMIT } from "../application/constants";

export interface UseChatsWithLiveMessagesOptions {
  getChatsService: () => IChatsService;
  getWebSocketAdapter: () => IWebSocketAdapter;
}

function newClientMsgId(): string {
  return `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function patchMessage(
  list: Message[],
  match: (m: Message) => boolean,
  patch: Partial<Message>,
): Message[] {
  return list.map((m) => (match(m) ? { ...m, ...patch } : m));
}

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined,
  options: UseChatsWithLiveMessagesOptions,
) {
  const { getChatsService, getWebSocketAdapter } = options;
  const chatsService = useMemo(() => getChatsService(), [getChatsService]);
  const ws = useMemo(() => getWebSocketAdapter(), [getWebSocketAdapter]);
  const [apiChats, setApiChats] = useState<ChatListItem[]>([]);
  const [apiMessagesByChatId, setApiMessagesByChatId] = useState<
    Record<string, Message[]>
  >({});
  const [liveMessagesByChatId, setLiveMessagesByChatId] = useState<
    Record<string, Message[]>
  >({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    chatsService
      .getChats()
      .then((chats) => setApiChats(chats))
      .catch(() => setApiChats([]));
  }, [chatsService]);

  useEffect(() => {
    if (
      !selectedContactId ||
      !apiChats.some((c) => c.id === selectedContactId)
    ) {
      return;
    }
    chatsService
      .getChatMessages(selectedContactId, { limit: MESSAGE_LIMIT })
      .then((list) => {
        const msgs = list.map((m) =>
          mapApiMessageToMessage(m as unknown as ApiMessageLike),
        );
        setApiMessagesByChatId((prev) => ({
          ...prev,
          [selectedContactId]: msgs,
        }));
      })
      .catch(() => {});

    ws.send({
      type: ImWsEvents.chatJoin,
      data: { chatId: selectedContactId },
    });

    return () => {
      ws.send({
        type: ImWsEvents.chatLeave,
        data: { chatId: selectedContactId },
      });
    };
  }, [selectedContactId, apiChats, chatsService, ws]);

  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);

    const onIncoming = (payload: unknown) => {
      const p = payload as SocketMessagePayload;
      const chatId = p.to;
      if (!chatId || !p.from) return;
      if (p.from === currentUserId) return;
      const msg = mapSocketPayloadToMessage(p);
      setLiveMessagesByChatId((prev) => {
        const existing = prev[chatId] ?? [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [chatId]: [...existing, msg] };
      });
    };

    const onSent = (payload: unknown) => {
      const data = payload as {
        id: string;
        chatId: string;
        clientMsgId?: string;
        createdAt?: string;
        content?: string;
        mediaUrl?: string;
      };
      if (!data?.chatId || !data?.id) return;
      const match = (m: Message) =>
        (data.clientMsgId != null && m.clientMsgId === data.clientMsgId) ||
        m.id === data.clientMsgId ||
        (m.status === "sending" && m.content === data.content);
      setApiMessagesByChatId((prev) => ({
        ...prev,
        [data.chatId]: patchMessage(prev[data.chatId] ?? [], match, {
          id: data.id,
          status: "sent",
          ...(data.createdAt != null && { timestamp: data.createdAt }),
          ...(data.mediaUrl != null && { mediaUrl: data.mediaUrl }),
        }),
      }));
    };

    const onDelivered = (payload: unknown) => {
      const data = payload as {
        messageId: string;
        chatId: string;
        clientMsgId?: string;
      };
      if (!data?.chatId || !data?.messageId) return;
      const match = (m: Message) =>
        m.id === data.messageId ||
        (data.clientMsgId != null && m.clientMsgId === data.clientMsgId);
      setApiMessagesByChatId((prev) => ({
        ...prev,
        [data.chatId]: patchMessage(prev[data.chatId] ?? [], match, {
          status: "delivered",
        }),
      }));
    };

    const onRead = (payload: unknown) => {
      const data = payload as { messageId: string; userId?: string };
      if (!data?.messageId) return;
      setApiMessagesByChatId((prev) => {
        const next: Record<string, Message[]> = {};
        for (const [chatId, list] of Object.entries(prev)) {
          next[chatId] = patchMessage(list, (m) => m.id === data.messageId, {
            status: "read",
          });
        }
        return next;
      });
    };

    ws.on("connected", onConnected);
    ws.on("disconnected", onDisconnected);
    ws.on("message", onIncoming);
    ws.on(ImWsEvents.messageSent, onSent);
    ws.on(ImWsEvents.messageDelivered, onDelivered);
    ws.on(ImWsEvents.messageRead, onRead);
    setIsConnected(ws.isConnected());
    return () => {
      ws.off("connected", onConnected);
      ws.off("disconnected", onDisconnected);
      ws.off("message", onIncoming);
      ws.off(ImWsEvents.messageSent, onSent);
      ws.off(ImWsEvents.messageDelivered, onDelivered);
      ws.off(ImWsEvents.messageRead, onRead);
    };
  }, [ws, currentUserId]);

  const isApiChat =
    selectedContactId != null &&
    apiChats.some((c) => c.id === selectedContactId);
  const messagesForSelected =
    selectedContactId && isApiChat
      ? mergeAndSortMessages(
          apiMessagesByChatId[selectedContactId] ?? [],
          liveMessagesByChatId[selectedContactId] ?? [],
        )
      : [];

  const handleSendMessage = useCallback(
    (
      content: string,
      type: "text" | "image" | "video" | "audio" | "file" = "text",
      options?: { mediaUrl?: string },
    ) => {
      if (!isApiChat || !selectedContactId) return;
      const clientMsgId = newClientMsgId();
      const optimistic: Message = {
        id: clientMsgId,
        clientMsgId,
        chatId: selectedContactId,
        senderId: currentUserId ?? "me",
        senderName: "我",
        content,
        timestamp: new Date().toISOString(),
        type,
        status: "sending",
        ...(options?.mediaUrl != null && { mediaUrl: options.mediaUrl }),
      };
      setApiMessagesByChatId((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] ?? []), optimistic],
      }));

      if (!ws.isConnected()) {
        setApiMessagesByChatId((prev) => ({
          ...prev,
          [selectedContactId]: patchMessage(
            prev[selectedContactId] ?? [],
            (m) => m.clientMsgId === clientMsgId,
            { status: "failed" },
          ),
        }));
        return;
      }

      ws.send({
        type: ImWsEvents.messageSend,
        data: {
          chatId: selectedContactId,
          content,
          type: type.toUpperCase(),
          clientMsgId,
          ...(options?.mediaUrl != null && { mediaUrl: options.mediaUrl }),
        },
      });
    },
    [isApiChat, selectedContactId, currentUserId, ws],
  );

  return {
    apiChats,
    isApiChat,
    messagesForSelected,
    isConnected,
    handleSendMessage,
  };
}
