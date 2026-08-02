import { useEffect, useRef, useCallback } from "react";
import {
  useSocketStore,
  useAuthStore,
  useAppDispatch,
  connectSocket,
  disconnectSocket,
} from "@/core/store/hooks";
import { mapServerMessagePayload } from "@/chat/message.mapper";
import { Message } from "@/chat/message.model";

type OnMessageReceived = (message: Message) => void;
type OnMessageSent = (message: Message) => void;

export function useSocket(
  onMessageReceived?: OnMessageReceived,
  onMessageSent?: OnMessageSent,
) {
  const dispatch = useAppDispatch();
  const token = useAuthStore((s) => s.token);
  const socket = useSocketStore((s) => s.socket);
  const connected = useSocketStore((s) => s.connected);
  const onReceivedRef = useRef(onMessageReceived);
  const onSentRef = useRef(onMessageSent);
  onReceivedRef.current = onMessageReceived;
  onSentRef.current = onMessageSent;

  useEffect(() => {
    if (token) dispatch(connectSocket(token));
    else dispatch(disconnectSocket());
  }, [token, dispatch]);

  useEffect(() => {
    if (!socket) return;
    const onReceived = (payload: Record<string, unknown>) => {
      onReceivedRef.current?.(mapServerMessagePayload(payload));
    };
    const onSent = (payload: Record<string, unknown>) => {
      onSentRef.current?.(mapServerMessagePayload(payload));
    };
    socket.on("message:received", onReceived);
    socket.on("message:sent", onSent);
    return () => {
      socket.off("message:received", onReceived);
      socket.off("message:sent", onSent);
    };
  }, [socket]);

  const sendMessage = useCallback(
    (chatId: string, content: string, type: string = "TEXT") => {
      if (socket?.connected) {
        socket.emit("message:send", { chatId, content, type });
      }
    },
    [socket],
  );

  return { sendMessage, connected, socket };
}
