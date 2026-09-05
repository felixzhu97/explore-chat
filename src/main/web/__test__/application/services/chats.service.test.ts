import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatsService } from "@/chat/services/chats.service";

describe("ChatsService", () => {
  let mockChatApi: any;
  let chatsService: ChatsService;

  beforeEach(() => {
    mockChatApi = {
      getChats: vi.fn(),
      getChatById: vi.fn(),
      createChat: vi.fn(),
      getChatMessages: vi.fn(),
      sendMessage: vi.fn(),
      markMessageAsRead: vi.fn(),
    };
    chatsService = new ChatsService(mockChatApi);
  });

  describe("getChats", () => {
    it("should return empty array when no data", async () => {
      mockChatApi.getChats.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await chatsService.getChats();

      expect(result).toEqual([]);
    });

    it("should return chats array when success", async () => {
      const mockChats = [
        { id: "chat-1", name: "Chat 1" },
        { id: "chat-2", name: "Chat 2" },
      ];
      mockChatApi.getChats.mockResolvedValue({
        success: true,
        data: mockChats,
      });

      const result = await chatsService.getChats();

      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      mockChatApi.getChats.mockRejectedValue(new Error("Network error"));

      const result = await chatsService.getChats();

      expect(result).toEqual([]);
    });
  });

  describe("getChatById", () => {
    it("should return null when no data", async () => {
      mockChatApi.getChatById.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await chatsService.getChatById("chat-1");

      expect(result).toBeNull();
    });

    it("should return chat when found", async () => {
      mockChatApi.getChatById.mockResolvedValue({
        success: true,
        data: { id: "chat-1", name: "Chat 1" },
      });

      const result = await chatsService.getChatById("chat-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("chat-1");
    });

    it("should return null on error", async () => {
      mockChatApi.getChatById.mockRejectedValue(new Error("Network error"));

      const result = await chatsService.getChatById("chat-1");

      expect(result).toBeNull();
    });
  });

  describe("createChat", () => {
    it("should create chat successfully", async () => {
      const createData = {
        participantIds: ["user-1", "user-2"],
        type: "private" as const,
        name: "New Chat",
      };
      mockChatApi.createChat.mockResolvedValue({
        success: true,
        data: { id: "new-chat", name: "New Chat" },
      });

      const result = await chatsService.createChat(createData);

      expect(result.id).toBe("new-chat");
      expect(mockChatApi.createChat).toHaveBeenCalledWith(createData);
    });

    it("should throw error on failure", async () => {
      mockChatApi.createChat.mockResolvedValue({
        success: false,
        message: "Create failed",
      });

      await expect(
        chatsService.createChat({
          participantIds: ["user-1"],
          type: "private",
        }),
      ).rejects.toThrow("创建聊天失败");
    });
  });

  describe("getChatMessages", () => {
    it("should return empty array when no data", async () => {
      mockChatApi.getChatMessages.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await chatsService.getChatMessages("chat-1");

      expect(result).toEqual([]);
    });

    it("should return messages array", async () => {
      const mockMessages = [
        { id: "msg-1", content: "Hello", senderId: "user-1" },
        { id: "msg-2", content: "Hi", senderId: "user-2" },
      ];
      mockChatApi.getChatMessages.mockResolvedValue({
        success: true,
        data: mockMessages,
      });

      const result = await chatsService.getChatMessages("chat-1");

      expect(result).toHaveLength(2);
    });

    it("should pass pagination params", async () => {
      mockChatApi.getChatMessages.mockResolvedValue({
        success: true,
        data: [],
      });

      await chatsService.getChatMessages("chat-1", { page: 1, limit: 20 });

      expect(mockChatApi.getChatMessages).toHaveBeenCalledWith("chat-1", {
        page: 1,
        limit: 20,
      });
    });

    it("should return empty array on error", async () => {
      mockChatApi.getChatMessages.mockRejectedValue(new Error("Network error"));

      const result = await chatsService.getChatMessages("chat-1");

      expect(result).toEqual([]);
    });
  });

  describe("sendMessage", () => {
    it("should send message successfully", async () => {
      mockChatApi.sendMessage.mockResolvedValue({
        success: true,
        data: { id: "msg-new", content: "Hello", senderId: "user-1" },
      });

      const result = await chatsService.sendMessage("chat-1", {
        content: "Hello",
        type: "text",
      });

      expect(result.id).toBe("msg-new");
      expect(result.content).toBe("Hello");
    });

    it("should throw error on failure", async () => {
      mockChatApi.sendMessage.mockResolvedValue({
        success: false,
        message: "Send failed",
      });

      await expect(
        chatsService.sendMessage("chat-1", { content: "Hello" }),
      ).rejects.toThrow("发送消息失败");
    });
  });

  describe("markMessageAsRead", () => {
    it("should call markMessageAsRead API", async () => {
      mockChatApi.markMessageAsRead.mockResolvedValue({ success: true });

      await chatsService.markMessageAsRead("chat-1", "msg-1");

      expect(mockChatApi.markMessageAsRead).toHaveBeenCalledWith(
        "chat-1",
        "msg-1",
      );
    });

    it("should throw error on failure", async () => {
      mockChatApi.markMessageAsRead.mockRejectedValue(new Error("Failed"));

      await expect(
        chatsService.markMessageAsRead("chat-1", "msg-1"),
      ).rejects.toThrow();
    });
  });
});
