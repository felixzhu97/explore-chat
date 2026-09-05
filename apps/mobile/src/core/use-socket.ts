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
import { ImWsEvents } from "@whatschat/shared-types";

type OnMessageReceived = (message: Message) => void;
type OnMessageSent = (message: Message) => void;
type OnMessageDelivered = (payload: {
  messageId: string;
  chatId: string;
  clientMsgId?: string;
}) => void;

function newClientMsgId(): string {
  return `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSocket(
  onMessageReceived?: OnMessageReceived,
  onMessageSent?: OnMessageSent,
  onMessageDelivered?: OnMessageDelivered,
) {
  const dispatch = useAppDispatch();
  const token = useAuthStore((s) => s.token);
  const socket = useSocketStore((s) => s.socket);
  const connected = useSocketStore((s) => s.connected);
  const onReceivedRef = useRef(onMessageReceived);
  const onSentRef = useRef(onMessageSent);
  const onDeliveredRef = useRef(onMessageDelivered);
  onReceivedRef.current = onMessageReceived;
  onSentRef.current = onMessageSent;
  onDeliveredRef.current = onMessageDelivered;

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
    const onDelivered = (payload: {
      messageId: string;
      chatId: string;
      clientMsgId?: string;
    }) => {
      onDeliveredRef.current?.(payload);
    };
    socket.on(ImWsEvents.messageReceived, onReceived);
    socket.on(ImWsEvents.messageSent, onSent);
    socket.on(ImWsEvents.messageDelivered, onDelivered);
    return () => {
      socket.off(ImWsEvents.messageReceived, onReceived);
      socket.off(ImWsEvents.messageSent, onSent);
      socket.off(ImWsEvents.messageDelivered, onDelivered);
    };
  }, [socket]);

  const sendMessage = useCallback(
    (
      chatId: string,
      content: string,
      type: string = "TEXT",
      clientMsgId: string = newClientMsgId(),
    ) => {
      if (socket?.connected) {
        socket.emit(ImWsEvents.messageSend, {
          chatId,
          content,
          type,
          clientMsgId,
        });
      }
      return clientMsgId;
    },
    [socket],
  );

  const joinChat = useCallback(
    (chatId: string) => {
      if (socket?.connected) {
        socket.emit(ImWsEvents.chatJoin, { chatId });
      }
    },
    [socket],
  );

  const leaveChat = useCallback(
    (chatId: string) => {
      if (socket?.connected) {
        socket.emit(ImWsEvents.chatLeave, { chatId });
      }
    },
    [socket],
  );

  return { sendMessage, joinChat, leaveChat, connected, socket };
}
