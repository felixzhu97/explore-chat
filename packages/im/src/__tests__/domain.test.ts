import { describe, it, expect, vi } from "vitest";
import type { WebSocketMessage, IWebSocketAdapter } from "../domain/websocket.adapter";
import type { ChatListItem, IChatsService } from "../domain/chats.service";

describe("Domain Types", () => {
  describe("WebSocketMessage", () => {
    it("should accept valid message type", () => {
      const message: WebSocketMessage = {
        type: "message",
        data: { text: "Hello" },
        from: "user1",
        to: "user2",
        timestamp: Date.now(),
      };
      expect(message.type).toBe("message");
      expect(message.data.text).toBe("Hello");
    });

    it("should accept all valid message types", () => {
      const types: WebSocketMessage["type"][] = [
        "message",
        "typing",
        "call_offer",
        "call_answer",
        "call_ice_candidate",
        "call_end",
        "call:incoming",
        "call:answer",
        "call:reject",
        "call:offer",
        "call:webrtc-answer",
        "call:ice-candidate",
        "call:end",
        "user_status",
        "message_read",
      ];

      types.forEach((type) => {
        const message: WebSocketMessage = { type, data: {} };
        expect(message.type).toBe(type);
      });
    });

    it("should allow optional fields to be undefined", () => {
      const message: WebSocketMessage = {
        type: "message",
        data: { text: "Hello" },
      };
      expect(message.from).toBeUndefined();
      expect(message.to).toBeUndefined();
      expect(message.timestamp).toBeUndefined();
    });
  });
});

describe("IWebSocketAdapter Interface", () => {
  it("should define all required methods", () => {
    const mockAdapter: IWebSocketAdapter = {
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn(() => true),
      setSimulatedMode: vi.fn(),
    };

    expect(typeof mockAdapter.send).toBe("function");
    expect(typeof mockAdapter.on).toBe("function");
    expect(typeof mockAdapter.off).toBe("function");
    expect(typeof mockAdapter.disconnect).toBe("function");
    expect(typeof mockAdapter.isConnected).toBe("function");
    expect(typeof mockAdapter.setSimulatedMode).toBe("function");
  });

  it("send should accept WebSocketMessage", () => {
    const send = vi.fn();
    const mockAdapter: IWebSocketAdapter = {
      send,
      on: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn(() => false),
    };

    const message: WebSocketMessage = {
      type: "message",
      data: { text: "test" },
      to: "user2",
    };

    mockAdapter.send(message);
    expect(send).toHaveBeenCalledWith(message);
  });

  it("on and off should register and unregister callbacks", () => {
    const on = vi.fn();
    const off = vi.fn();
    const callback = vi.fn();

    const mockAdapter: IWebSocketAdapter = {
      send: vi.fn(),
      on,
      off,
      disconnect: vi.fn(),
      isConnected: vi.fn(() => false),
    };

    mockAdapter.on("message", callback);
    expect(on).toHaveBeenCalledWith("message", callback);

    mockAdapter.off("message", callback);
    expect(off).toHaveBeenCalledWith("message", callback);
  });
});

describe("IChatsService Interface", () => {
  it("should define all required methods", () => {
    const mockService: IChatsService = {
      getChats: vi.fn(() => Promise.resolve([])),
      getChatById: vi.fn(() => Promise.resolve(null)),
      createChat: vi.fn(() =>
        Promise.resolve({
          id: "1",
          name: "Test Chat",
        })
      ),
      getChatMessages: vi.fn(() => Promise.resolve([])),
      sendMessage: vi.fn(() =>
        Promise.resolve({
          id: "1",
          senderId: "user1",
          senderName: "User 1",
          content: "Hello",
          timestamp: new Date().toISOString(),
          type: "text" as const,
          status: "sent" as const,
        })
      ),
      markMessageAsRead: vi.fn(() => Promise.resolve()),
    };

    expect(typeof mockService.getChats).toBe("function");
    expect(typeof mockService.getChatById).toBe("function");
    expect(typeof mockService.createChat).toBe("function");
    expect(typeof mockService.getChatMessages).toBe("function");
    expect(typeof mockService.sendMessage).toBe("function");
    expect(typeof mockService.markMessageAsRead).toBe("function");
  });

  it("getChats should return array of ChatListItem", async () => {
    const getChats = vi.fn(() =>
      Promise.resolve([
        {
          id: "chat1",
          name: "Test Chat",
          lastMessage: "Hello",
          timestamp: new Date().toISOString(),
        },
      ])
    );

    const mockService: IChatsService = {
      getChats,
      getChatById: vi.fn(),
      createChat: vi.fn(),
      getChatMessages: vi.fn(),
      sendMessage: vi.fn(),
      markMessageAsRead: vi.fn(),
    };

    const result = await mockService.getChats();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("chat1");
  });

  it("createChat should accept correct parameters", async () => {
    const createChat = vi.fn((data: { participantIds: string[]; type: "private" | "group"; name?: string }) =>
      Promise.resolve({
        id: "new-chat-id",
        name: data.name ?? "New Chat",
        type: data.type,
        participants: data.participantIds,
      })
    );

    const mockService: IChatsService = {
      getChats: vi.fn(),
      getChatById: vi.fn(),
      createChat,
      getChatMessages: vi.fn(),
      sendMessage: vi.fn(),
      markMessageAsRead: vi.fn(),
    };

    const result = await mockService.createChat({
      participantIds: ["user1", "user2"],
      type: "group",
      name: "Team Chat",
    });

    expect(createChat).toHaveBeenCalledWith({
      participantIds: ["user1", "user2"],
      type: "group",
      name: "Team Chat",
    });
    expect(result.id).toBe("new-chat-id");
  });
});

describe("ChatListItem", () => {
  it("should allow flexible additional properties", () => {
    const item: ChatListItem = {
      id: "1",
      name: "Chat Name",
      avatar: "https://example.com/avatar.jpg",
      lastMessage: "Hello",
      timestamp: new Date().toISOString(),
      type: "private",
      participants: ["user1", "user2"],
      customField: "custom value",
    };

    expect(item.customField).toBe("custom value");
  });
});
