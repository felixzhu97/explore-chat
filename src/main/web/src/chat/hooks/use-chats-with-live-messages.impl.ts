"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ImWsEvents } from "@/shared/types/message";
import type { IWebSocketAdapter } from "@/shared/types/websocket.adapter";
import type { IChatsService, ChatListItem } from "@/chat/chats.service.types";
import type { Message } from "@/shared/types/message";
import type { SocketMessagePayload } from "@/shared/utils/message-mappers.impl";
import { ChatProjectionService } from "@/chat/service/chat-projection.service";
import { createMemoryChatProjectionRepository } from "@/chat/infra/memory-chat-projection-repository";

export interface UseChatsWithLiveMessagesOptions {
  getChatsService: () => IChatsService;
  getWebSocketAdapter: () => IWebSocketAdapter;
}

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined,
  options: UseChatsWithLiveMessagesOptions,
) {
  const { getChatsService, getWebSocketAdapter } = options;
  const chatsService = useMemo(() => getChatsService(), [getChatsService]);
  const ws = useMemo(() => getWebSocketAdapter(), [getWebSocketAdapter]);
  const projection = useMemo(
    () =>
      new ChatProjectionService(
        createMemoryChatProjectionRepository(),
        chatsService,
      ),
    [chatsService],
  );

  const [apiChats, setApiChats] = useState<ChatListItem[]>([]);
  const [messagesForSelected, setMessagesForSelected] = useState<Message[]>(
    [],
  );
  const [isConnected, setIsConnected] = useState(false);
  const [, bump] = useState(0);
  const refreshUi = useCallback(() => {
    setApiChats(projection.getChatListItems());
    if (selectedContactId) {
      setMessagesForSelected(projection.getMessagesForChat(selectedContactId));
    } else {
      setMessagesForSelected([]);
    }
    bump((n) => n + 1);
  }, [projection, selectedContactId]);

  useEffect(() => {
    void projection.refreshCatalog().then(() => refreshUi());
  }, [projection, chatsService, refreshUi]);

  useEffect(() => {
    if (
      !selectedContactId ||
      !apiChats.some((c) => c.id === selectedContactId)
    ) {
      setMessagesForSelected([]);
      return;
    }
    void projection.refreshThread(selectedContactId).then(() => refreshUi());

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
  }, [selectedContactId, apiChats, projection, ws, refreshUi]);

  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);

    const onIncoming = (payload: unknown) => {
      projection.acceptSocketPayload(
        payload as SocketMessagePayload,
        currentUserId,
      );
      refreshUi();
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
      projection.applySentAck(data);
      refreshUi();
    };

    const onDelivered = (payload: unknown) => {
      const data = payload as {
        messageId: string;
        chatId: string;
        clientMsgId?: string;
      };
      if (!data?.chatId || !data?.messageId) return;
      projection.applyDeliveryAck({ ...data, status: "delivered" });
      refreshUi();
    };

    const onRead = (payload: unknown) => {
      const data = payload as { messageId: string };
      if (!data?.messageId) return;
      projection.applyReadAck(data.messageId);
      refreshUi();
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
  }, [ws, currentUserId, projection, refreshUi]);

  const isApiChat =
    selectedContactId != null &&
    apiChats.some((c) => c.id === selectedContactId);

  const handleSendMessage = useCallback(
    (
      content: string,
      type: "text" | "image" | "video" | "audio" | "file" = "text",
      options?: { mediaUrl?: string },
    ) => {
      if (!isApiChat || !selectedContactId) return;
      const { clientMsgId } = projection.sendOptimistic(
        selectedContactId,
        content,
        currentUserId ?? "me",
        type,
        options,
      );
      refreshUi();

      if (!ws.isConnected()) {
        projection.markSendFailed(selectedContactId, clientMsgId);
        refreshUi();
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
    [
      isApiChat,
      selectedContactId,
      currentUserId,
      ws,
      projection,
      refreshUi,
    ],
  );

  return {
    apiChats,
    isApiChat,
    messagesForSelected,
    isConnected,
    handleSendMessage,
  };
}
