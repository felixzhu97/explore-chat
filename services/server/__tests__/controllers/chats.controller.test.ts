import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatsController } from "@/chats/controller/chats.controller";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("ChatsController", () => {
  let chatsController: ChatsController;
  let mockChatsService: any;

  const mockUser = { id: "user-1", email: "test@example.com" };

  const mockChat = {
    id: "chat-1",
    type: "PRIVATE" as const,
    name: null,
    avatar: null,
    participants: [
      {
        user: {
          id: "user-1",
          username: "user1",
          avatar: null,
          isOnline: true,
          status: "online",
        },
      },
    ],
    messages: [],
    updatedAt: new Date(),
  };

  const mockChatListItem = {
    id: "chat-1",
    type: "PRIVATE",
    name: "user2",
    avatar: null,
    isArchived: false,
    isMuted: false,
    participants: [
      {
        id: "user-1",
        username: "user1",
        avatar: null,
        isOnline: true,
        status: "online",
      },
    ],
    lastMessage: null,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockChatsService = {
      getChats: vi.fn(),
      createChat: vi.fn(),
      getChatById: vi.fn(),
      updateChat: vi.fn(),
      deleteChat: vi.fn(),
      archiveChat: vi.fn(),
      muteChat: vi.fn(),
    };

    chatsController = new ChatsController(mockChatsService);
  });

  describe("getChats", () => {
    it("should return list of chats", async () => {
      mockChatsService.getChats.mockResolvedValue([mockChatListItem]);

      const result = await chatsController.getChats(mockUser);

      expect(result).toEqual({
        success: true,
        message: "获取聊天列表成功",
        data: [mockChatListItem],
      });
      expect(mockChatsService.getChats).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return empty array when no chats exist", async () => {
      mockChatsService.getChats.mockResolvedValue([]);

      const result = await chatsController.getChats(mockUser);

      expect(result.data).toEqual([]);
    });

    it("should throw NotFoundException when service fails", async () => {
      mockChatsService.getChats.mockRejectedValue(
        new NotFoundException("User not found"),
      );

      await expect(chatsController.getChats(mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("createChat", () => {
    const createChatDto = {
      type: "PRIVATE" as const,
      participantIds: ["user-2"],
    };

    it("should create a new chat", async () => {
      mockChatsService.createChat.mockResolvedValue(mockChat);

      const result = await chatsController.createChat(mockUser, createChatDto);

      expect(result).toEqual({
        success: true,
        message: "创建聊天成功",
        data: mockChat,
      });
      expect(mockChatsService.createChat).toHaveBeenCalledWith(
        mockUser.id,
        createChatDto,
      );
    });

    it("should create a group chat", async () => {
      const groupChatDto = {
        type: "GROUP" as const,
        name: "Test Group",
        avatar: "https://example.com/avatar.png",
        participantIds: ["user-2", "user-3"],
      };
      const groupChat = { ...mockChat, type: "GROUP", name: "Test Group" };
      mockChatsService.createChat.mockResolvedValue(groupChat);

      const result = await chatsController.createChat(mockUser, groupChatDto);

      expect(result.data.type).toBe("GROUP");
      expect(result.data.name).toBe("Test Group");
    });

    it("should throw BadRequestException for invalid participants", async () => {
      mockChatsService.createChat.mockRejectedValue(
        new BadRequestException("部分参与者不存在"),
      );

      await expect(
        chatsController.createChat(mockUser, createChatDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getChat", () => {
    it("should return chat details", async () => {
      mockChatsService.getChatById.mockResolvedValue(mockChat);

      const result = await chatsController.getChat(mockUser, "chat-1");

      expect(result).toEqual({
        success: true,
        message: "获取聊天详情成功",
        data: mockChat,
      });
      expect(mockChatsService.getChatById).toHaveBeenCalledWith(
        "chat-1",
        mockUser.id,
      );
    });

    it("should throw NotFoundException when chat not found", async () => {
      mockChatsService.getChatById.mockRejectedValue(
        new NotFoundException("聊天不存在"),
      );

      await expect(
        chatsController.getChat(mockUser, "non-existent-chat"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when user is not a participant", async () => {
      mockChatsService.getChatById.mockRejectedValue(
        new BadRequestException("无权访问此聊天"),
      );

      await expect(chatsController.getChat(mockUser, "chat-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("updateChat", () => {
    const updateData = { name: "New Name", avatar: "new-avatar.png" };

    it("should update chat successfully", async () => {
      const updatedChat = { ...mockChat, ...updateData };
      mockChatsService.updateChat.mockResolvedValue(updatedChat);

      const result = await chatsController.updateChat(
        mockUser,
        "chat-1",
        updateData,
      );

      expect(result).toEqual({
        success: true,
        message: "更新聊天信息成功",
        data: updatedChat,
      });
      expect(mockChatsService.updateChat).toHaveBeenCalledWith(
        "chat-1",
        mockUser.id,
        updateData,
      );
    });

    it("should throw NotFoundException when chat not found", async () => {
      mockChatsService.updateChat.mockRejectedValue(
        new NotFoundException("聊天不存在"),
      );

      await expect(
        chatsController.updateChat(mockUser, "non-existent-chat", updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException for private chat update", async () => {
      mockChatsService.updateChat.mockRejectedValue(
        new BadRequestException("私聊不能修改名称和头像"),
      );

      await expect(
        chatsController.updateChat(mockUser, "chat-1", updateData),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("deleteChat", () => {
    it("should delete chat successfully", async () => {
      mockChatsService.deleteChat.mockResolvedValue({
        message: "聊天已删除",
      });

      const result = await chatsController.deleteChat(mockUser, "chat-1");

      expect(result).toEqual({
        success: true,
        message: "聊天删除成功",
      });
      expect(mockChatsService.deleteChat).toHaveBeenCalledWith(
        "chat-1",
        mockUser.id,
      );
    });

    it("should throw NotFoundException when chat not found", async () => {
      mockChatsService.deleteChat.mockRejectedValue(
        new NotFoundException("聊天不存在"),
      );

      await expect(
        chatsController.deleteChat(mockUser, "non-existent-chat"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when user is not a participant", async () => {
      mockChatsService.deleteChat.mockRejectedValue(
        new BadRequestException("无权删除此聊天"),
      );

      await expect(
        chatsController.deleteChat(mockUser, "chat-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("archiveChat", () => {
    it("should archive chat successfully", async () => {
      mockChatsService.archiveChat.mockResolvedValue({
        message: "聊天已归档",
      });

      const result = await chatsController.archiveChat(mockUser, "chat-1");

      expect(result).toEqual({
        success: true,
        message: "聊天已归档",
      });
      expect(mockChatsService.archiveChat).toHaveBeenCalledWith(
        "chat-1",
        mockUser.id,
      );
    });

    it("should throw NotFoundException when chat not found", async () => {
      mockChatsService.archiveChat.mockRejectedValue(
        new NotFoundException("聊天不存在或无权访问"),
      );

      await expect(
        chatsController.archiveChat(mockUser, "non-existent-chat"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("muteChat", () => {
    it("should mute chat successfully", async () => {
      mockChatsService.muteChat.mockResolvedValue({
        message: "聊天已静音",
      });

      const result = await chatsController.muteChat(mockUser, "chat-1");

      expect(result).toEqual({
        success: true,
        message: "聊天已静音",
      });
      expect(mockChatsService.muteChat).toHaveBeenCalledWith(
        "chat-1",
        mockUser.id,
      );
    });

    it("should throw NotFoundException when chat not found", async () => {
      mockChatsService.muteChat.mockRejectedValue(
        new NotFoundException("聊天不存在或无权访问"),
      );

      await expect(
        chatsController.muteChat(mockUser, "non-existent-chat"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
