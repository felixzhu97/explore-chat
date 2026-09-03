"use client";

import type { IWebSocketAdapter, WebSocketMessage } from "@whatschat/im";
import { io, Socket } from "socket.io-client";

const SOCKET_DEBUG = process.env.NEXT_PUBLIC_SOCKET_DEBUG === "true";

function logSocket(...args: unknown[]) {
  if (!SOCKET_DEBUG) return;
  console.log("[WS]", ...args);
}

export class WebSocketAdapter implements IWebSocketAdapter {
  private ioSocket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor() {
    logSocket("init adapter");
    this.connect();
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) this.sendMessage(message);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logSocket("reconnect failed after max attempts");
      return;
    }
    this.reconnectAttempts++;
    logSocket(
      "attempt reconnect",
      `${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
    );
    setTimeout(
      () => this.connect(),
      this.reconnectDelay * this.reconnectAttempts,
    );
  }

  private handleMessage(message: WebSocketMessage) {
    logSocket("dispatch message to listeners", message.type, message);
    this.emit(message.type, message);
  }

  private sendViaSocketIo(message: WebSocketMessage) {
    if (!this.ioSocket?.connected) return;
    const payload = message.data !== undefined ? message.data : { ...message };
    this.ioSocket.emit(message.type, payload);
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.ioSocket?.connected) {
      try {
        this.sendViaSocketIo(message);
      } catch (error) {
        logSocket("Socket.IO send failed, queue message", { error, message });
        this.messageQueue.push(message);
      }
    } else {
      logSocket("Socket.IO not connected, queue message", message);
      this.messageQueue.push(message);
    }
  }

  private connect() {
    if (this.ioSocket?.connected) {
      logSocket("Socket.IO already connected");
      return;
    }
    if (this.isConnecting) {
      logSocket("Socket.IO is connecting, skip duplicate connect");
      return;
    }
    this.isConnecting = true;
    const socketIoUrl =
      process.env.NEXT_PUBLIC_SOCKET_IO_URL || "http://localhost:9200";
    const token = this.getAuthToken();
    logSocket("Socket.IO connect", { socketIoUrl, hasToken: !!token });

    this.ioSocket = io(socketIoUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });

    this.ioSocket.on("connect", () => {
      logSocket("Socket.IO connected", this.ioSocket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit("connected", null);
      this.flushMessageQueue();
    });

    this.ioSocket.on("disconnect", (reason) => {
      logSocket("Socket.IO disconnected", reason);
      this.emit("disconnected", null);
    });

    this.ioSocket.on("connect_error", (error) => {
      logSocket("Socket.IO connect error", error);
      this.isConnecting = false;
      this.attemptReconnect();
    });

    this.ioSocket.on("message:received", (data: Record<string, unknown>) => {
      logSocket("Socket.IO event message:received", data);
      const message: WebSocketMessage = {
        type: "message",
        from: (data.senderId as string) ?? "",
        to: (data.chatId as string) ?? "",
        data: {
          id: (data.id as string) ?? "",
          text: (data.content as string) ?? "",
          type: ((data.type as string) || "TEXT").toString().toLowerCase(),
          mediaUrl: data.mediaUrl as string | undefined,
        },
        timestamp: new Date((data.createdAt as string) ?? Date.now()).getTime(),
      };
      this.handleMessage(message);
    });

    this.ioSocket.on(
      "message:typing",
      (payload: { chatId: string; userId: string; isTyping: boolean }) => {
        logSocket("Socket.IO event message:typing", payload);
        this.handleMessage({
          type: "typing",
          from: payload.userId,
          to: payload.chatId,
          data: { isTyping: payload.isTyping },
          timestamp: Date.now(),
        });
      },
    );

    this.ioSocket.on(
      "message:read",
      (payload: { messageId: string; userId: string }) => {
        logSocket("Socket.IO event message:read", payload);
        this.emit("message_status", {
          messageId: payload.messageId,
          status: "read",
        });
      },
    );

    const callEvents = [
      "call:incoming",
      "call:answer",
      "call:reject",
      "call:offer",
      "call:webrtc-answer",
      "call:ice-candidate",
      "call:end",
    ] as const;
    this.ioSocket.on("notification:new", (payload: Record<string, unknown>) => {
      logSocket("Socket.IO event notification:new", payload);
      this.emit("notification:new", payload);
    });

    callEvents.forEach((event) => {
      this.ioSocket!.on(event, (payload: Record<string, unknown>) => {
        logSocket("Socket.IO event", event, payload);
        this.handleMessage({
          type: event,
          from: (payload.userId ?? payload.initiatorId) as string,
          data: payload,
          timestamp: Date.now(),
        });
      });
    });
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token")
      );
    }
    return null;
  }

  send(message: WebSocketMessage): void {
    this.sendMessage(message);
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) callbacks.forEach((cb) => cb(data));
  }

  disconnect(): void {
    if (this.ioSocket) {
      this.ioSocket.disconnect();
      this.ioSocket = null;
    }
  }

  isConnected(): boolean {
    return this.ioSocket != null && this.ioSocket.connected;
  }

  setSimulatedMode(_enabled: boolean): void {}
}

let wsManager: WebSocketAdapter | null = null;

export const getWebSocketAdapter = (): IWebSocketAdapter => {
  if (!wsManager) wsManager = new WebSocketAdapter();
  return wsManager;
};
