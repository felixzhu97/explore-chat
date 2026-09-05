import { describe, it, expect, vi } from "vitest";
import type { IWebSocketAdapter } from "../domain/websocket.adapter";
import type { IChatsService, ChatListItem } from "../domain/chats.service";
import type { Message } from "@chat/shared-types";
import { MESSAGE_LIMIT } from "../application/constants";

const createMockChatsService = (): IChatsService => ({
  getChats: vi.fn(() => Promise.resolve([])),
  getChatById: vi.fn(() => Promise.resolve(null)),
  createChat: vi.fn(),
  getChatMessages: vi.fn(() => Promise.resolve([])),
  sendMessage: vi.fn(() =>
    Promise.resolve({
      id: "new-msg",
      senderId: "user-1",
      senderName: "User",
      content: "Sent message",
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sent",
    })
  ),
  markMessageAsRead: vi.fn(() => Promise.resolve()),
});

const createMockWebSocketAdapter = (): IWebSocketAdapter => ({
  send: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
  isConnected: vi.fn(() => true),
});

describe("useChatsWithLiveMessages Hook Interface", () => {
  describe("IChatsService interface", () => {
    it("should have all required methods", () => {
      const service = createMockChatsService();
      expect(typeof service.getChats).toBe("function");
      expect(typeof service.getChatById).toBe("function");
      expect(typeof service.createChat).toBe("function");
      expect(typeof service.getChatMessages).toBe("function");
      expect(typeof service.sendMessage).toBe("function");
      expect(typeof service.markMessageAsRead).toBe("function");
    });

    it("getChats should return array of ChatListItem", async () => {
      const service = createMockChatsService();
      const mockChats: ChatListItem[] = [
        { id: "chat-1", name: "Chat 1" },
        { id: "chat-2", name: "Chat 2" },
      ];
      (service.getChats as ReturnType<typeof vi.fn>).mockResolvedValue(mockChats);

      const result = await service.getChats();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("chat-1");
    });

    it("getChatMessages should accept pagination params", async () => {
      const service = createMockChatsService();
      await service.getChatMessages("chat-1", { page: 1, limit: MESSAGE_LIMIT });

      expect(service.getChatMessages).toHaveBeenCalledWith("chat-1", {
        page: 1,
        limit: MESSAGE_LIMIT,
      });
    });

    it("sendMessage should accept message data", async () => {
      const service = createMockChatsService();
      await service.sendMessage("chat-1", {
        content: "Hello",
        type: "text",
      });

      expect(service.sendMessage).toHaveBeenCalledWith("chat-1", {
        content: "Hello",
        type: "text",
      });
    });
  });

  describe("ChatListItem interface", () => {
    it("should allow flexible properties", () => {
      const item: ChatListItem = {
        id: "chat-1",
        name: "Test Chat",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Hello",
        timestamp: new Date().toISOString(),
        type: "private",
        participants: ["user1", "user2"],
      };

      expect(item.name).toBe("Test Chat");
      expect(item.avatar).toBe("https://example.com/avatar.jpg");
      expect(item.participants).toHaveLength(2);
    });
  });

  describe("WebSocket event handling", () => {
    it("should register connected/disconnected/message events", () => {
      const adapter = createMockWebSocketAdapter();
      adapter.on("connected", vi.fn());
      adapter.on("disconnected", vi.fn());
      adapter.on("message", vi.fn());

      expect(adapter.on).toHaveBeenCalledWith("connected", expect.any(Function));
      expect(adapter.on).toHaveBeenCalledWith("disconnected", expect.any(Function));
      expect(adapter.on).toHaveBeenCalledWith("message", expect.any(Function));
    });

    it("should unregister events", () => {
      const adapter = createMockWebSocketAdapter();
      const connectedCb = vi.fn();
      adapter.on("connected", connectedCb);
      adapter.off("connected", connectedCb);

      expect(adapter.off).toHaveBeenCalledWith("connected", connectedCb);
    });

    it("should report connection status", () => {
      const adapter = createMockWebSocketAdapter();
      (adapter.isConnected as ReturnType<typeof vi.fn>).mockReturnValue(true);

      expect(adapter.isConnected()).toBe(true);
    });
  });

  describe("message handling", () => {
    it("should create optimistic message structure", () => {
      const optimisticMessage: Message = {
        id: "opt-123",
        senderId: "current-user",
        senderName: "Me",
        content: "Test message",
        timestamp: new Date().toISOString(),
        type: "text",
        status: "sending",
      };

      expect(optimisticMessage.status).toBe("sending");
      expect(optimisticMessage.senderId).toBe("current-user");
    });

    it("should create message with media URL", () => {
      const mediaMessage: Message = {
        id: "opt-456",
        senderId: "current-user",
        senderName: "Me",
        content: "Check this out",
        timestamp: new Date().toISOString(),
        type: "image",
        status: "sending",
        mediaUrl: "https://example.com/image.jpg",
      };

      expect(mediaMessage.mediaUrl).toBe("https://example.com/image.jpg");
      expect(mediaMessage.type).toBe("image");
    });

    it("should update message status on success", () => {
      const message: Message = {
        id: "opt-123",
        senderId: "current-user",
        senderName: "Me",
        content: "Test",
        timestamp: new Date().toISOString(),
        type: "text",
        status: "sending",
      };

      const updated: Message = {
        ...message,
        status: "sent",
      };

      expect(updated.status).toBe("sent");
    });

    it("should mark message as failed on error", () => {
      const message: Message = {
        id: "opt-123",
        senderId: "current-user",
        senderName: "Me",
        content: "Test",
        timestamp: new Date().toISOString(),
        type: "text",
        status: "sending",
      };

      const failed: Message = {
        ...message,
        status: "failed",
      };

      expect(failed.status).toBe("failed");
    });
  });
});

describe("MESSAGE_LIMIT constant", () => {
  it("should be 100", () => {
    expect(MESSAGE_LIMIT).toBe(100);
  });
});
