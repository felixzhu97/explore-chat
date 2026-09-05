import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import {
  MessagesService,
  CreateMessageData,
  GetMessagesOptions,
} from "@/messages/service/messages.service";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";
import { Chat } from "@/chats/domain/model/chat";
import { User } from "@/users/domain/model/user";
import { Message } from "@/messages/domain/model/message";
import type { ChatRepository } from "@/chats/domain/repository/chat.repository";
import type { MessageRepository } from "@/messages/domain/repository/message.repository";

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
  let mockChatRepository: {
    findById: ReturnType<typeof vi.fn>;
    touchUpdatedAt: ReturnType<typeof vi.fn>;
  };
  let mockMessageRepository: {
    save: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByChatId: ReturnType<typeof vi.fn>;
  };

  const participant = User.create({
    id: "user-1",
    username: "user1",
    email: "user1@example.com",
  });
  const otherParticipant = User.create({
    id: "user-2",
    username: "user2",
    email: "user2@example.com",
  });

  const mockChat = Chat.create({
    id: "chat-1",
    type: "PRIVATE",
    participants: [participant, otherParticipant],
  });

  const mockSender = {
    id: "user-1",
    username: "user1",
    avatar: null,
  };

  const mockMessageRow = {
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

  const savedDomainMessage = Message.create({
    id: "message-1",
    chatId: "chat-1",
    senderId: "user-1",
    type: "TEXT",
    content: "Hello, World!",
  });

  beforeEach(() => {
    mockPrisma = {
      message: {
        findUnique: vi.fn().mockResolvedValue(mockMessageRow),
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

    mockChatRepository = {
      findById: vi.fn().mockResolvedValue(mockChat),
      touchUpdatedAt: vi.fn().mockResolvedValue(undefined),
    };

    mockMessageRepository = {
      save: vi.fn().mockResolvedValue(savedDomainMessage),
      findById: vi.fn(),
      findByChatId: vi.fn(),
    };

    messagesService = new MessagesService(
      mockPrisma as PrismaService,
      mockCache as CacheService,
      mockChatRepository as unknown as ChatRepository,
      mockMessageRepository as unknown as MessageRepository,
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
      mockChatRepository.findById.mockResolvedValue(null);

      await expect(
        messagesService.createMessage(createMessageData),
      ).rejects.toThrow(NotFoundException);
      await expect(
        messagesService.createMessage(createMessageData),
      ).rejects.toThrow("聊天不存在");
    });

    it("should create message successfully", async () => {
      const result = await messagesService.createMessage(createMessageData);

      expect(result).toEqual({ ...mockMessageRow, status: "sent" });
      expect(mockMessageRepository.save).toHaveBeenCalled();
      expect(mockChatRepository.touchUpdatedAt).toHaveBeenCalledWith("chat-1");
    });

    it("should throw ForbiddenException when sender is not a participant", async () => {
      mockChatRepository.findById.mockResolvedValue(
        Chat.create({
          id: "chat-1",
          type: "PRIVATE",
          participants: [otherParticipant],
        }),
      );

      await expect(
        messagesService.createMessage(createMessageData),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should echo clientMsgId on create", async () => {
      const result = await messagesService.createMessage({
        ...createMessageData,
        clientMsgId: "cmsg-1",
      });

      expect(result).toEqual({
        ...mockMessageRow,
        clientMsgId: "cmsg-1",
        status: "sent",
      });
    });

    it("should update chat updatedAt after creating message", async () => {
      await messagesService.createMessage(createMessageData);

      expect(mockChatRepository.touchUpdatedAt).toHaveBeenCalledWith("chat-1");
    });

    it("should invalidate cache for all chat participants", async () => {
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

      mockPrisma.message!.findUnique = vi.fn().mockResolvedValue({
        ...mockMessageRow,
        mediaUrl: "https://example.com/image.jpg",
      });

      const result = await messagesService.createMessage(messageWithMedia);

      expect(result.mediaUrl).toBe("https://example.com/image.jpg");
      expect(mockMessageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaUrl: "https://example.com/image.jpg",
        }),
      );
    });

    it("should include replyToMessageId when provided", async () => {
      const messageWithReply: CreateMessageData = {
        ...createMessageData,
        replyToMessageId: "original-message-id",
      };

      mockPrisma.message!.findUnique = vi.fn().mockResolvedValue({
        ...mockMessageRow,
        replyToMessageId: "original-message-id",
      });

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
      const messages = [mockMessageRow, { ...mockMessageRow, id: "message-2" }];
      mockPrisma.message!.findMany = vi.fn().mockResolvedValue(messages);

      const result = await messagesService.getMessages(
        "chat-1",
        getMessagesOptions,
      );

      expect(result).toEqual(messages);
      expect(mockPrisma.message!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { chatId: "chat-1", isDeleted: false },
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
            isDeleted: false,
            content: {
              contains: "Hello",
            },
          },
        }),
      );
    });

    it("should include sender information", async () => {
      mockPrisma.message!.findMany = vi
        .fn()
        .mockResolvedValue([mockMessageRow]);

      const result = await messagesService.getMessages(
        "chat-1",
        getMessagesOptions,
      );

      expect(result[0]).toHaveProperty("sender");
      expect(result[0]!.sender).toEqual(mockSender);
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
      const updatedMessage = {
        ...mockMessageRow,
        content: "Updated content",
      };
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
      const updatedMessage = { ...mockMessageRow, type: "IMAGE" as const };
      mockPrisma.message!.update = vi.fn().mockResolvedValue(updatedMessage);

      const result = await messagesService.updateMessage("message-1", {
        type: "IMAGE",
      });

      expect(result.type).toBe("IMAGE");
    });

    it("should only update provided fields", async () => {
      mockPrisma.message!.update = vi.fn().mockResolvedValue(mockMessageRow);

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
    it("should soft delete message successfully", async () => {
      mockMessageRepository.findById.mockResolvedValue(savedDomainMessage);
      const softDeleted = savedDomainMessage.delete();
      mockMessageRepository.save.mockResolvedValue(softDeleted);

      const result = await messagesService.deleteMessage("message-1");

      expect(result.isDeleted).toBe(true);
      expect(mockMessageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: true }),
      );
    });

    it("should throw NotFoundException when message is missing", async () => {
      mockMessageRepository.findById.mockResolvedValue(null);

      await expect(messagesService.deleteMessage("missing")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
