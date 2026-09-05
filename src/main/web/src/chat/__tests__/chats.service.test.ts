import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChatsService } from "../services/chats.service";
import { ChatApi } from "@/chat/services/chats.service";
import type { ApiChatRow, ApiMessageRow } from "../services/chats.service";

const createMockChatApi = (): Partial<ChatApi> => ({
  getChats: vi.fn(),
  getChatById: vi.fn(),
  createChat: vi.fn(),
  getChatMessages: vi.fn(),
  sendMessage: vi.fn(),
  markMessageAsRead: vi.fn(),
});

describe("ChatsService", () => {
  let chatsService: ChatsService;
  let mockChatApi: Partial<ChatApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChatApi = createMockChatApi();
    chatsService = new ChatsService(mockChatApi as ChatApi);
  });

  describe("getChats", () => {
    it("should return array of contacts when API returns success", async () => {
      const mockChats: ApiChatRow[] = [
        {
          id: "chat-1",
          name: "Chat One",
          avatar: "avatar1.jpg",
          lastMessage: { content: "Hello" },
          updatedAt: "2024-01-01T00:00:00Z",
          type: "INDIVIDUAL",
          participants: [{ isOnline: true }],
        },
        {
          id: "chat-2",
          name: "Chat Two",
          lastMessage: { content: "Hi there" },
          updatedAt: "2024-01-02T00:00:00Z",
          type: "GROUP",
        },
      ];
      mockChatApi.getChats = vi.fn().mockResolvedValue({
        success: true,
        data: mockChats,
      });

      const result = await chatsService.getChats();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("chat-1");
      expect(result[0].name).toBe("Chat One");
      expect(result[0].isOnline).toBe(true);
      expect(result[1].id).toBe("chat-2");
      expect(result[1].isGroup).toBe(true);
    });

    it("should return empty array when API returns no data", async () => {
      mockChatApi.getChats = vi.fn().mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await chatsService.getChats();

      expect(result).toEqual([]);
    });

    it("should return empty array when API returns empty array", async () => {
      mockChatApi.getChats = vi.fn().mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await chatsService.getChats();

      expect(result).toEqual([]);
    });

    it("should return empty array and log error when API fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChatApi.getChats = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));

      const result = await chatsService.getChats();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "获取聊天列表失败:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("should handle chats without optional fields", async () => {
      const mockChats: ApiChatRow[] = [
        {
          id: "chat-1",
          type: "INDIVIDUAL",
        },
      ];
      mockChatApi.getChats = vi.fn().mockResolvedValue({
        success: true,
        data: mockChats,
      });

      const result = await chatsService.getChats();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("chat-1");
      expect(result[0].name).toBe("Chat");
      expect(result[0].avatar).toBe("");
      expect(result[0].lastMessage).toBe("");
    });
  });

  describe("getChatById", () => {
    it("should return contact when API returns success", async () => {
      const mockChat: ApiChatRow = {
        id: "chat-1",
        name: "Test Chat",
        avatar: "test.jpg",
        type: "INDIVIDUAL",
      };
      mockChatApi.getChatById = vi.fn().mockResolvedValue({
        success: true,
        data: mockChat,
      });

      const result = await chatsService.getChatById("chat-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("chat-1");
      expect(result?.name).toBe("Test Chat");
    });

    it("should return null when API returns no data", async () => {
      mockChatApi.getChatById = vi.fn().mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await chatsService.getChatById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null when API fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChatApi.getChatById = vi
        .fn()
        .mockRejectedValue(new Error("Chat not found"));

      const result = await chatsService.getChatById("nonexistent");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "获取聊天详情失败:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("createChat", () => {
    it("should create private chat successfully", async () => {
      const mockChat: ApiChatRow = {
        id: "new-chat",
        name: "New Private Chat",
        type: "INDIVIDUAL",
      };
      mockChatApi.createChat = vi.fn().mockResolvedValue({
        success: true,
        data: mockChat,
      });

      const result = await chatsService.createChat({
        participantIds: ["user-1", "user-2"],
        type: "private",
      });

      expect(result.id).toBe("new-chat");
      expect(result.name).toBe("New Private Chat");
      expect(mockChatApi.createChat).toHaveBeenCalledWith({
        participantIds: ["user-1", "user-2"],
        type: "private",
      });
    });

    it("should create group chat with name successfully", async () => {
      const mockChat: ApiChatRow = {
        id: "group-chat",
        name: "Team Group",
        type: "GROUP",
      };
      mockChatApi.createChat = vi.fn().mockResolvedValue({
        success: true,
        data: mockChat,
      });

      const result = await chatsService.createChat({
        participantIds: ["user-1", "user-2", "user-3"],
        type: "group",
        name: "Team Group",
      });

      expect(result.id).toBe("group-chat");
      expect(result.name).toBe("Team Group");
      expect(mockChatApi.createChat).toHaveBeenCalledWith({
        participantIds: ["user-1", "user-2", "user-3"],
        type: "group",
        name: "Team Group",
      });
    });

    it("should throw error when createChat fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChatApi.createChat = vi
        .fn()
        .mockRejectedValue(new Error("Creation failed"));

      await expect(
        chatsService.createChat({
          participantIds: ["user-1"],
          type: "private",
        }),
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "创建聊天失败:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("should throw error when API returns failure response", async () => {
      mockChatApi.createChat = vi.fn().mockResolvedValue({
        success: false,
        message: "Failed to create chat",
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
    it("should return array of messages when API returns success", async () => {
      const mockMessages: ApiMessageRow[] = [
        {
          id: "msg-1",
          senderId: "user-1",
          sender: { username: "Alice" },
          content: "Hello",
          timestamp: "2024-01-01T00:00:00Z",
          type: "TEXT",
        },
        {
          id: "msg-2",
          senderId: "user-2",
          sender: { username: "Bob" },
          content: "Hi there!",
          timestamp: "2024-01-01T00:01:00Z",
          type: "TEXT",
        },
      ];
      mockChatApi.getChatMessages = vi.fn().mockResolvedValue({
        success: true,
        data: mockMessages,
      });

      const result = await chatsService.getChatMessages("chat-1");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("msg-1");
      expect(result[0].content).toBe("Hello");
      expect(result[0].senderName).toBe("Alice");
      expect(result[1].id).toBe("msg-2");
      expect(result[1].senderName).toBe("Bob");
    });

    it("should return empty array when API returns no data", async () => {
      mockChatApi.getChatMessages = vi.fn().mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await chatsService.getChatMessages("chat-1");

      expect(result).toEqual([]);
    });

    it("should return empty array when API fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChatApi.getChatMessages = vi
        .fn()
        .mockRejectedValue(new Error("Failed to fetch"));

      const result = await chatsService.getChatMessages("chat-1");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "获取聊天消息失败:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("should pass pagination params to API", async () => {
      mockChatApi.getChatMessages = vi.fn().mockResolvedValue({
        success: true,
        data: [],
      });

      await chatsService.getChatMessages("chat-1", { page: 2, limit: 20 });

      expect(mockChatApi.getChatMessages).toHaveBeenCalledWith("chat-1", {
        page: 2,
        limit: 20,
      });
    });

    it("should handle messages with media", async () => {
      const mockMessages: ApiMessageRow[] = [
        {
          id: "msg-1",
          senderId: "user-1",
          content: "Check this out",
          timestamp: "2024-01-01T00:00:00Z",
          type: "IMAGE",
          mediaUrl: "https://example.com/image.jpg",
        },
      ];
      mockChatApi.getChatMessages = vi.fn().mockResolvedValue({
        success: true,
        data: mockMessages,
      });

      const result = await chatsService.getChatMessages("chat-1");

      expect(result[0].mediaUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("sendMessage", () => {
    it("should send text message successfully", async () => {
      const mockMessage: ApiMessageRow = {
        id: "msg-new",
        senderId: "user-1",
        sender: { username: "Alice" },
        content: "New message",
        timestamp: "2024-01-01T00:00:00Z",
        type: "TEXT",
      };
      mockChatApi.sendMessage = vi.fn().mockResolvedValue({
        success: true,
        data: mockMessage,
      });

      const result = await chatsService.sendMessage("chat-1", {
        content: "New message",
        type: "text",
      });

      expect(result.id).toBe("msg-new");
      expect(result.content).toBe("New message");
      expect(mockChatApi.sendMessage).toHaveBeenCalledWith("chat-1", {
        content: "New message",
        type: "text",
      });
    });

    it("should send image message with media URL", async () => {
      const mockMessage: ApiMessageRow = {
        id: "msg-image",
        senderId: "user-1",
        content: "",
        timestamp: "2024-01-01T00:00:00Z",
        type: "IMAGE",
        mediaUrl: "https://example.com/photo.jpg",
      };
      mockChatApi.sendMessage = vi.fn().mockResolvedValue({
        success: true,
        data: mockMessage,
      });

      const result = await chatsService.sendMessage("chat-1", {
        content: "Look at this photo",
        type: "image",
        mediaUrl: "https://example.com/photo.jpg",
      });

      expect(result.mediaUrl).toBe("https://example.com/photo.jpg");
    });

    it("should send reply message with replyToMessageId", async () => {
      const mockMessage: ApiMessageRow = {
        id: "msg-reply",
        senderId: "user-1",
        content: "Reply content",
        timestamp: "2024-01-01T00:00:00Z",
        type: "TEXT",
      };
      mockChatApi.sendMessage = vi.fn().mockResolvedValue({
        success: true,
        data: mockMessage,
      });

      await chatsService.sendMessage("chat-1", {
        content: "Reply content",
        replyToMessageId: "msg-original",
      });

      expect(mockChatApi.sendMessage).toHaveBeenCalledWith("chat-1", {
        content: "Reply content",
        replyToMessageId: "msg-original",
      });
    });

    it("should throw error when sendMessage fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChatApi.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error("Send failed"));

      await expect(
        chatsService.sendMessage("chat-1", { content: "Test" }),
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "发送消息失败:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("should throw error when API returns failure response", async () => {
      mockChatApi.sendMessage = vi.fn().mockResolvedValue({
        success: false,
        message: "Message too long",
      });

      await expect(
        chatsService.sendMessage("chat-1", { content: "Test" }),
      ).rejects.toThrow("发送消息失败");
    });
  });

  describe("markMessageAsRead", () => {
    it("should mark message as read successfully", async () => {
      mockChatApi.markMessageAsRead = vi.fn().mockResolvedValue(undefined);

      await expect(
        chatsService.markMessageAsRead("chat-1", "msg-1"),
      ).resolves.toBeUndefined();

      expect(mockChatApi.markMessageAsRead).toHaveBeenCalledWith(
        "chat-1",
        "msg-1",
      );
    });

    it("should throw error when markMessageAsRead fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChatApi.markMessageAsRead = vi
        .fn()
        .mockRejectedValue(new Error("Failed to mark as read"));

      await expect(
        chatsService.markMessageAsRead("chat-1", "msg-1"),
      ).rejects.toThrow(expect.any(Error));

      expect(consoleSpy).toHaveBeenCalledWith(
        "标记消息为已读失败:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
