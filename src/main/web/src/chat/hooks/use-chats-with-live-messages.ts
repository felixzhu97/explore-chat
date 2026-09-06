"use client";

import { useCallback } from "react";
import { useChatsWithLiveMessages as useChatsWithLiveMessagesBase } from "./use-chats-with-live-messages.impl";
import type { IChatsService } from "@/chat/chats.service.types";
import { getChatsService } from "@/chat/services/chats.service";
import { getWebSocketAdapter } from "@/chat/websocket";

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined,
) {
  const getChatsServiceStable = useCallback(
    () => getChatsService() as unknown as IChatsService,
    [],
  );
  const getWebSocketAdapterStable = useCallback(
    () => getWebSocketAdapter(),
    [],
  );

  return useChatsWithLiveMessagesBase(selectedContactId, currentUserId, {
    getChatsService: getChatsServiceStable,
    getWebSocketAdapter: getWebSocketAdapterStable,
  });
}
