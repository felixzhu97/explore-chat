"use client";

import { useRealChat as useRealChatBase } from "@whatschat/im";
import { getWebSocketAdapter } from "@/core/websocket";

const storageAdapter =
  typeof window !== "undefined"
    ? {
        getItem: (key: string) => window.localStorage.getItem(key),
        setItem: (key: string, value: string) =>
          window.localStorage.setItem(key, value),
      }
    : undefined;

export function useRealChat(contactId: string) {
  return useRealChatBase(contactId, {
    getWebSocketAdapter,
    storage: storageAdapter,
  });
}
