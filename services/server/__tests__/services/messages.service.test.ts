import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import {
  MessagesService,
  CreateMessageData,
  GetMessagesOptions,
} from "@/messages/application/messages.service";
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

describe("MessagesService", () => {
  let messagesService: MessagesService;
  let mockPrisma: Partial<PrismaService>;
  let mockCache: Partial<CacheService>;

  const mockChat = {
    id: "chat-1",
    type: "PRIVATE" as const,
    name: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSender = {
    id: "user-1",
    username: "user1",
    avatar: null,
  };

  const mockMessage = {
    id: "message-1",
    chatId: "chat-1",
    senderId: "user-1",
    type: "TEXT" as const,
    content: "Hello, World!",
    mediaUrl: null,
    replyToMessageId: null,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: mockSender,
  };

  beforeEach(() => {
    mockPrisma = {
      chat: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      message: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      chatParticipant: {
        findUnique: vi.fn().mockResolvedValue({
          chatId: "chat-1",
          userId: "user-1",
        }),
        findMany: vi.fn(),
      },
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      delMany: vi.fn(),
    };

    messagesService = new MessagesService(
      mockPrisma as PrismaService,
      mockCache as CacheService,
    );
  });

  describe("createMessage", () => {
    const createMessageData: CreateMessageData = {
      content: "Hello, World!",
      type: "TEXT",
      senderId: "user-1",
      chatId: "chat-1",
    };

    it("should throw NotFoundException if chat does not exist", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        messagesService.createMessage(createMessageData),
      ).rejects.toThrow(NotFoundException);
      await expect(
        messagesService.createMessage(createMessageData),
      ).rejects.toThrow("聊天不存在");
    });

    it("should create message successfully", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.message!.create = vi.fn().mockResolvedValue(mockMessage);
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({});
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }, { userId: "user-2" }]);

      const result = await messagesService.createMessage(createMessageData);

      expect(result).toEqual({ ...mockMessage, status: "sent" });
      expect(mockPrisma.message!.create).toHaveBeenCalledWith({
        data: {
          chatId: createMessageData.chatId,
          senderId: createMessageData.senderId,
          type: expect.anything(),
          content: createMessageData.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    });

    it("should throw ForbiddenException when sender is not a participant", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        messagesService.createMessage(createMessageData),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should echo clientMsgId on create", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.message!.create = vi.fn().mockResolvedValue(mockMessage);
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({});
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }]);

      const result = await messagesService.createMessage({
        ...createMessageData,
        clientMsgId: "cmsg-1",
      });

      expect(result).toEqual({
        ...mockMessage,
        clientMsgId: "cmsg-1",
        status: "sent",
      });
    });

    it("should update chat updatedAt after creating message", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.message!.create = vi.fn().mockResolvedValue(mockMessage);
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({});
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }]);

      await messagesService.createMessage(createMessageData);

      expect(mockPrisma.chat!.update).toHaveBeenCalledWith({
        where: { id: "chat-1" },
        data: { updatedAt: expect.any(Date) },
      });
    });

    it("should invalidate cache for all chat participants", async () => {
      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.message!.create = vi.fn().mockResolvedValue(mockMessage);
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({});
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }, { userId: "user-2" }]);

      await messagesService.createMessage(createMessageData);

      expect(mockCache.delMany).toHaveBeenCalledWith([
        "chats:user-1",
        "chats:user-2",
      ]);
    });

    it("should include mediaUrl when provided", async () => {
      const messageWithMedia: CreateMessageData = {
        ...createMessageData,
        mediaUrl: "https://example.com/image.jpg",
      };

      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.message!.create = vi.fn().mockImplementation((data: any) => {
        expect(data.data.mediaUrl).toBe("https://example.com/image.jpg");
        return Promise.resolve({
          ...mockMessage,
          mediaUrl: data.data.mediaUrl,
        });
      });
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({});
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }]);

      const result = await messagesService.createMessage(messageWithMedia);

      expect(result.mediaUrl).toBe("https://example.com/image.jpg");
    });

    it("should include replyToMessageId when provided", async () => {
      const messageWithReply: CreateMessageData = {
        ...createMessageData,
        replyToMessageId: "original-message-id",
      };

      mockPrisma.chat!.findUnique = vi.fn().mockResolvedValue(mockChat);
      mockPrisma.message!.create = vi.fn().mockImplementation((data: any) => {
        expect(data.data.replyToMessageId).toBe("original-message-id");
        return Promise.resolve({
          ...mockMessage,
          replyToMessageId: data.data.replyToMessageId,
        });
      });
      mockPrisma.chat!.update = vi.fn().mockResolvedValue({});
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }]);

      const result = await messagesService.createMessage(messageWithReply);

      expect(result.replyToMessageId).toBe("original-message-id");
    });
  });

  describe("getMessages", () => {
    const getMessagesOptions: GetMessagesOptions = {
      page: 1,
      limit: 20,
    };

    it("should return paginated messages", async () => {
      const messages = [mockMessage, { ...mockMessage, id: "message-2" }];
      mockPrisma.message!.findMany = vi.fn().mockResolvedValue(messages);

      const result = await messagesService.getMessages(
        "chat-1",
        getMessagesOptions,
      );

      expect(result).toEqual(messages);
      expect(mockPrisma.message!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { chatId: "chat-1" },
          orderBy: { createdAt: "desc" },
          skip: 0,
          take: 20,
        }),
      );
    });

    it("should calculate correct skip value for pagination", async () => {
      mockPrisma.message!.findMany = vi.fn().mockResolvedValue([]);

      await messagesService.getMessages("chat-1", { page: 3, limit: 10 });

      expect(mockPrisma.message!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it("should filter messages by search term", async () => {
      mockPrisma.message!.findMany = vi.fn().mockResolvedValue([]);

      await messagesService.getMessages("chat-1", {
        ...getMessagesOptions,
        search: "Hello",
      });

      expect(mockPrisma.message!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            chatId: "chat-1",
            content: {
              contains: "Hello",
            },
          },
        }),
      );
    });

    it("should include sender information", async () => {
      mockPrisma.message!.findMany = vi.fn().mockResolvedValue([mockMessage]);

      const result = await messagesService.getMessages(
        "chat-1",
        getMessagesOptions,
      );

      expect(result[0]).toHaveProperty("sender");
      expect(result[0].sender).toEqual(mockSender);
    });

    it("should order messages by createdAt descending", async () => {
      mockPrisma.message!.findMany = vi.fn().mockResolvedValue([]);

      await messagesService.getMessages("chat-1", getMessagesOptions);

      expect(mockPrisma.message!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  describe("updateMessage", () => {
    it("should update message content", async () => {
      const updatedMessage = { ...mockMessage, content: "Updated content" };
      mockPrisma.message!.update = vi.fn().mockResolvedValue(updatedMessage);

      const result = await messagesService.updateMessage("message-1", {
        content: "Updated content",
      });

      expect(result.content).toBe("Updated content");
      expect(mockPrisma.message!.update).toHaveBeenCalledWith({
        where: { id: "message-1" },
        data: expect.objectContaining({
          content: "Updated content",
          updatedAt: expect.any(Date),
        }),
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    });

    it("should update message type", async () => {
      const updatedMessage = { ...mockMessage, type: "IMAGE" as const };
      mockPrisma.message!.update = vi.fn().mockResolvedValue(updatedMessage);

      const result = await messagesService.updateMessage("message-1", {
        type: "IMAGE",
      });

      expect(result.type).toBe("IMAGE");
    });

    it("should only update provided fields", async () => {
      mockPrisma.message!.update = vi.fn().mockResolvedValue(mockMessage);

      await messagesService.updateMessage("message-1", {
        content: "New content",
      });

      expect(mockPrisma.message!.update).toHaveBeenCalledWith({
        where: { id: "message-1" },
        data: expect.not.objectContaining({
          type: expect.anything(),
        }),
        include: expect.anything(),
      });
    });
  });

  describe("deleteMessage", () => {
    it("should delete message successfully", async () => {
      mockPrisma.message!.delete = vi.fn().mockResolvedValue(mockMessage);

      const result = await messagesService.deleteMessage("message-1");

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message!.delete).toHaveBeenCalledWith({
        where: { id: "message-1" },
      });
    });
  });
});
