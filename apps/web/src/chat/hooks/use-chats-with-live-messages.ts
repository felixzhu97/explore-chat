"use client";

import { useCallback } from "react";
import {
  useChatsWithLiveMessages as useChatsWithLiveMessagesBase,
  type IChatsService as ImChatsService,
} from "@whatschat/im";
import { getChatsService } from "@/chat/services/chats.service";
import { getWebSocketAdapter } from "@/core/websocket";

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined,
) {
  const getChatsServiceStable = useCallback(
    () => getChatsService() as unknown as ImChatsService,
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
