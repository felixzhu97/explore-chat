import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import {
  ChatsService,
  CreateChatData,
  UpdateChatData,
} from "@/chats/application/chats.service";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";

vi.mock("@/core/cache/cache.service", () => ({
  CacheService: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    delMany: vi.fn(),
  })),
}));

describe("ChatsService", () => {
  let chatsService: ChatsService;
  let mockPrisma: Partial<PrismaService>;
  let mockCache: Partial<CacheService>;

  const mockUser = {
    id: "user-1",
    username: "user1",
    avatar: null,
    isOnline: true,
    status: "online",
  };

  const mockParticipant = {
    id: "participant-1",
    userId: "user-1",
    chatId: "chat-1",
    isArchived: false,
    isMuted: false,
    user: mockUser,
  };

  const mockChat = {
    id: "chat-1",
    type: "PRIVATE" as const,
    name: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    participants: [mockParticipant],
    messages: [],
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findMany: vi.fn(),
      },
      chat: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      chatParticipant: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      delMany: vi.fn(),
    };

    chatsService = new ChatsService(
      mockPrisma as PrismaService,
      mockCache as CacheService,
    );
  });

  describe("getChats", () => {
    it("should return cached chats if available", async () => {
      const cachedChats = [{ id: "chat-1", type: "PRIVATE" }];
      mockCache.get = vi.fn().mockResolvedValue(cachedChats);

      const result = await chatsService.getChats("user-1");

      expect(result).toEqual(cachedChats);
      expect(mockCache.get).toHaveBeenCalledWith("chats:user-1");
      expect(mockPrisma.chatParticipant!.findMany).not.toHaveBeenCalled();
    });

    it("should fetch chats from database when cache is empty", async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockPrisma.chatParticipant!.findMany = vi.fn().mockResolvedValue([
        {
          chat: {
            id: "chat-1",
            type: "PRIVATE",
            name: null,
            avatar: null,
            updatedAt: new Date(),
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
              {
                user: {
                  id: "user-2",
                  username: "user2",
                  avatar: null,
                  isOnline: false,
                  status: null,
                },
              },
            ],
            messages: [],
          },
          isArchived: false,
          isMuted: false,
        },
      ]);

      const result = await chatsService.getChats("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("chat-1");
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should use other participant username for private chat name", async () => {
      mockCache.get = vi.fn().mockResolvedValue(null);
      mockPrisma.chatParticipant!.findMany = vi.fn().mockResolvedValue([
        {
          chat: {
            id: "chat-1",
            type: "PRIVATE",
            name: null,
            avatar: null,
            updatedAt: new Date(),
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
              {
                user: {
                  id: "user-2",
                  username: "otherUser",
                  avatar: null,
                  isOnline: false,
                  status: null,
                },
              },
            ],
            messages: [],
          },
          isArchived: false,
          isMuted: false,
        },
      ]);

      const result = await chatsService.getChats("user-1");

      expect(result[0].name).toBe("otherUser");
    });

    it("should return last message when available", async () => {
      const lastMessage = {
        id: "msg-1",
        content: "Hello",
        createdAt: new Date(),
        sender: {
          id: "user-1",
          username: "user1",
          avatar: null,
        },
      };

      mockCache.get = vi.fn().mockResolvedValue(null);
      mockPrisma.chatParticipant!.findMany = vi.fn().mockResolvedValue([
        {
          chat: {
            id: "chat-1",
            type: "PRIVATE",
            name: null,
            avatar: null,
            updatedAt: new Date(),
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
            messages: [lastMessage],
          },
          isArchived: false,
          isMuted: false,
        },
      ]);

      const result = await chatsService.getChats("user-1");

      expect(result[0].lastMessage).toEqual(lastMessage);
    });
  });

  describe("createChat", () => {
    const createPrivateChatData: CreateChatData = {
      type: "PRIVATE",
      participantIds: ["user-2"],
    };

    const createGroupChatData: CreateChatData = {
      type: "GROUP",
      name: "Test Group",
      avatar: "https://example.com/avatar.png",
      participantIds: ["user-2", "user-3"],
    };

    it("should throw BadRequestException if no participants provided", async () => {
      const invalidData: CreateChatData = {
        type: "PRIVATE",
        participantIds: [],
      };

      await expect(
        chatsService.createChat("user-1", invalidData),
      ).rejects.toThrow(BadRequestException);
      await expect(
        chatsService.createChat("user-1", invalidData),
      ).rejects.toThrow("至少需要一个参与者");
    });

    it("should throw BadRequestException if some participants do not exist", async () => {
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([{ id: "user-2" }]);

      await expect(
        chatsService.createChat("user-1", {
          ...createPrivateChatData,
          participantIds: ["user-2", "user-nonexistent"],
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        chatsService.createChat("user-1", {
          ...createPrivateChatData,
          participantIds: ["user-2", "user-nonexistent"],
        }),
      ).rejects.toThrow("部分参与者不存在");
    });

    it("should return existing private chat if one already exists", async () => {
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([{ id: "user-2" }]);
      mockPrisma.chat!.findMany = vi.fn().mockResolvedValue([
        {
          id: "existing-chat",
          type: "PRIVATE",
          participants: [{ userId: "user-1" }, { userId: "user-2" }],
        },
      ]);

      const result = await chatsService.createChat(
        "user-1",
        createPrivateChatData,
      );

      expect(result.id).toBe("existing-chat");
      expect(mockPrisma.chat!.create).not.toHaveBeenCalled();
    });

    it("should create a new group chat", async () => {
      mockPrisma.user!.findMany = vi
        .fn()
        .mockResolvedValue([{ id: "user-2" }, { id: "user-3" }]);
      mockPrisma.chat!.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.chat!.create = vi.fn().mockResolvedValue({
        id: "new-chat",
        type: "GROUP",
        name: "Test Group",
        avatar: "https://example.com/avatar.png",
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
          {
            user: {
              id: "user-2",
              username: "user2",
              avatar: null,
              isOnline: false,
              status: null,
            },
          },
          {
            user: {
              id: "user-3",
              username: "user3",
              avatar: null,
              isOnline: false,
              status: null,
            },
          },
        ],
      });

      const result = await chatsService.createChat(
        "user-1",
        createGroupChatData,
      );

      expect(result.id).toBe("new-chat");
      expect(result.type).toBe("GROUP");
      expect(mockCache.delMany).toHaveBeenCalled();
    });

    it("should create a new private chat when no existing chat found", async () => {
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([{ id: "user-2" }]);
      mockPrisma.chat!.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.chat!.create = vi.fn().mockResolvedValue({
        id: "new-private-chat",
        type: "PRIVATE",
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
      });

      const result = await chatsService.createChat(
        "user-1",
        createPrivateChatData,
      );

      expect(result.id).toBe("new-private-chat");
      expect(mockPrisma.chat!.create).toHaveBeenCalled();
    });
  });

  describe("getChatById", () => {
    it("should throw NotFoundException if chat does not exist", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        chatsService.getChatById("chat-1", "user-1"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        chatsService.getChatById("chat-1", "user-1"),
      ).rejects.toThrow("聊天不存在");
    });

    it("should throw BadRequestException if user is not a participant", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "PRIVATE",
        participants: [{ userId: "other-user" }],
        messages: [],
      });

      await expect(
        chatsService.getChatById("chat-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
      await expect(
        chatsService.getChatById("chat-1", "user-1"),
      ).rejects.toThrow("无权访问此聊天");
    });

    it("should return chat when user is a participant", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "PRIVATE",
        participants: [{ userId: "user-1" }],
        messages: [{ id: "msg-1", content: "Hello" }],
      });

      const result = await chatsService.getChatById("chat-1", "user-1");

      expect(result.id).toBe("chat-1");
    });
  });

  describe("updateChat", () => {
    it("should throw NotFoundException if chat does not exist", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        chatsService.updateChat("chat-1", "user-1", { name: "New Name" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if user is not a participant", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "GROUP",
        participants: [{ userId: "other-user" }],
      });

      await expect(
        chatsService.updateChat("chat-1", "user-1", { name: "New Name" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if updating private chat", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "PRIVATE",
        participants: [{ userId: "user-1" }],
      });

      await expect(
        chatsService.updateChat("chat-1", "user-1", { name: "New Name" }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        chatsService.updateChat("chat-1", "user-1", { name: "New Name" }),
      ).rejects.toThrow("私聊不能修改名称和头像");
    });

    it("should update group chat successfully", async () => {
      const updateData: UpdateChatData = {
        name: "Updated Name",
        avatar: "new-avatar.png",
      };

      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "GROUP",
        participants: [{ userId: "user-1" }],
      });
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "GROUP",
        name: "Updated Name",
        avatar: "new-avatar.png",
        participants: [],
      });

      const result = await chatsService.updateChat(
        "chat-1",
        "user-1",
        updateData,
      );

      expect(result.name).toBe("Updated Name");
      expect(mockCache.delMany).toHaveBeenCalled();
    });
  });

  describe("deleteChat", () => {
    it("should throw NotFoundException if chat does not exist", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(chatsService.deleteChat("chat-1", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if user is not a participant", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "PRIVATE",
        participants: [{ userId: "other-user" }],
      });

      await expect(chatsService.deleteChat("chat-1", "user-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should delete chat successfully", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue({
        id: "chat-1",
        type: "PRIVATE",
        participants: [{ userId: "user-1" }],
      });
      mockPrisma.chat!.delete = vi.fn().mockResolvedValue({ id: "chat-1" });

      const result = await chatsService.deleteChat("chat-1", "user-1");

      expect(result).toEqual({ message: "聊天已删除" });
      expect(mockPrisma.chat!.delete).toHaveBeenCalledWith({
        where: { id: "chat-1" },
      });
    });
  });

  describe("archiveChat", () => {
    it("should throw NotFoundException if participant not found", async () => {
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        chatsService.archiveChat("chat-1", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should archive chat successfully", async () => {
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue({
        chatId: "chat-1",
        userId: "user-1",
        isArchived: false,
        isMuted: false,
      });
      mockPrisma.chatParticipant!.update = vi.fn().mockResolvedValue({
        chatId: "chat-1",
        userId: "user-1",
        isArchived: true,
      });

      const result = await chatsService.archiveChat("chat-1", "user-1");

      expect(result).toEqual({ message: "聊天已归档" });
      expect(mockPrisma.chatParticipant!.update).toHaveBeenCalledWith({
        where: { chatId_userId: { chatId: "chat-1", userId: "user-1" } },
        data: { isArchived: true },
      });
    });
  });

  describe("muteChat", () => {
    it("should throw NotFoundException if participant not found", async () => {
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(chatsService.muteChat("chat-1", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should mute chat successfully", async () => {
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue({
        chatId: "chat-1",
        userId: "user-1",
        isArchived: false,
        isMuted: false,
      });
      mockPrisma.chatParticipant!.update = vi.fn().mockResolvedValue({
        chatId: "chat-1",
        userId: "user-1",
        isMuted: true,
      });

      const result = await chatsService.muteChat("chat-1", "user-1");

      expect(result).toEqual({ message: "聊天已静音" });
      expect(mockPrisma.chatParticipant!.update).toHaveBeenCalledWith({
        where: { chatId_userId: { chatId: "chat-1", userId: "user-1" } },
        data: { isMuted: true },
      });
    });
  });

  describe("unmuteChat", () => {
    it("should throw NotFoundException if participant not found", async () => {
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(chatsService.unmuteChat("chat-1", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should unmute chat successfully", async () => {
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue({
        chatId: "chat-1",
        userId: "user-1",
        isArchived: false,
        isMuted: true,
      });
      mockPrisma.chatParticipant!.update = vi.fn().mockResolvedValue({
        chatId: "chat-1",
        userId: "user-1",
        isMuted: false,
        muteUntil: null,
      });

      const result = await chatsService.unmuteChat("chat-1", "user-1");

      expect(result).toEqual({ message: "聊天已取消静音" });
      expect(mockPrisma.chatParticipant!.update).toHaveBeenCalledWith({
        where: { chatId_userId: { chatId: "chat-1", userId: "user-1" } },
        data: { isMuted: false, muteUntil: null },
      });
    });
  });
});
