import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatGateway } from "@/websocket/presentation/chat.gateway";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";
import { OfflineMessageQueueService } from "@/messages/application/offline-message-queue.service";
import { Server, Socket } from "socket.io";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      jwt: { secret: "test-secret" },
    })),
  },
}));

describe("ChatGateway", () => {
  let chatGateway: ChatGateway;
  let mockJwtService: Partial<JwtService>;
  let mockPrisma: Partial<PrismaService>;
  let mockCache: Partial<CacheService>;
  let mockOfflineQueue: Partial<OfflineMessageQueueService>;

  const mockUser = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    avatar: null,
    status: "online",
  };

  const createMockSocket = (overrides: Partial<Socket> = {}): Socket => {
    const socket = {
      id: "socket-1",
      handshake: {
        auth: { token: "valid-token" },
        headers: { authorization: "Bearer valid-token" },
      },
      userId: undefined,
      user: undefined,
      emit: vi.fn(),
      disconnect: vi.fn(),
      join: vi.fn(),
      to: vi.fn().mockReturnThis(),
      broadcast: {
        emit: vi.fn(),
      },
    } as unknown as Socket;
    Object.assign(socket, overrides);
    return socket;
  };

  beforeEach(() => {
    mockJwtService = {
      verify: vi.fn(),
    };

    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      chatParticipant: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      message: {
        create: vi.fn(),
      },
      messageRead: {
        upsert: vi.fn(),
      },
      messageReaction: {
        upsert: vi.fn(),
      },
      status: {
        create: vi.fn(),
      },
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      delMany: vi.fn(),
    };

    mockOfflineQueue = {
      getAndClear: vi.fn().mockResolvedValue([]),
      enqueue: vi.fn(),
    };

    chatGateway = new ChatGateway(
      mockJwtService as JwtService,
      mockPrisma as PrismaService,
      mockCache as CacheService,
      mockOfflineQueue as OfflineMessageQueueService,
    );

    chatGateway.server = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    } as unknown as Server;
  });

  describe("handleConnection", () => {
    it("should authenticate user with valid token", async () => {
      const socket = createMockSocket();
      mockJwtService.verify = vi.fn().mockReturnValue({ userId: "user-1" });
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);

      await chatGateway.handleConnection(socket as any);

      expect(mockJwtService.verify).toHaveBeenCalledWith("valid-token", {
        secret: "test-secret",
      });
      expect(mockPrisma.user!.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          status: true,
        },
      });
    });

    it("should disconnect socket when token is missing", async () => {
      const socket = createMockSocket({
        handshake: { auth: {}, headers: {} },
      });

      await chatGateway.handleConnection(socket as any);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it("should disconnect socket when user not found", async () => {
      const socket = createMockSocket();
      mockJwtService.verify = vi.fn().mockReturnValue({ userId: "user-1" });
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(null);

      await chatGateway.handleConnection(socket as any);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it("should update user online status on connect", async () => {
      const socket = createMockSocket();
      mockJwtService.verify = vi.fn().mockReturnValue({ userId: "user-1" });
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);

      await chatGateway.handleConnection(socket as any);

      expect(mockPrisma.user!.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { isOnline: true },
      });
    });

    it("should emit pending messages on connect", async () => {
      const socket = createMockSocket();
      const pendingMessages = [{ id: "msg-1", content: "Hello" }];
      mockJwtService.verify = vi.fn().mockReturnValue({ userId: "user-1" });
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);
      mockOfflineQueue.getAndClear = vi.fn().mockResolvedValue(pendingMessages);

      await chatGateway.handleConnection(socket as any);

      expect(mockOfflineQueue.getAndClear).toHaveBeenCalledWith("user-1");
      expect(socket.emit).toHaveBeenCalledWith(
        "message:received",
        pendingMessages[0],
      );
    });
  });

  describe("handleDisconnect", () => {
    it("should update user online status on disconnect", async () => {
      const socket = createMockSocket({
        userId: "user-1",
        user: mockUser,
      });
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);

      await chatGateway.handleDisconnect(socket as any);

      expect(mockPrisma.user!.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          isOnline: false,
          lastSeen: expect.any(Date),
        },
      });
    });

    it("should broadcast user offline event", async () => {
      const socket = createMockSocket({
        userId: "user-1",
        user: mockUser,
      });
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);

      await chatGateway.handleDisconnect(socket as any);

      expect(socket.broadcast.emit).toHaveBeenCalledWith("user:offline", {
        userId: "user-1",
      });
    });
  });

  describe("handleMessage", () => {
    const messageData = {
      chatId: "chat-1",
      content: "Hello, World!",
      type: "TEXT",
      mediaUrl: undefined,
      replyToMessageId: undefined,
    };

    it("should send message when user is participant", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      const mockMessage = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "user-1",
        content: "Hello, World!",
        sender: { id: "user-1", username: "testuser", avatar: null },
      };
      mockPrisma.chatParticipant!.findUnique = vi
        .fn()
        .mockResolvedValue({ chatId: "chat-1", userId: "user-1" });
      mockPrisma.message!.create = vi.fn().mockResolvedValue(mockMessage);
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }, { userId: "user-2" }]);
      vi.spyOn(chatGateway, "deliverToParticipants" as any).mockResolvedValue(
        undefined,
      );

      await chatGateway.handleMessage(socket as any, messageData);

      expect(mockPrisma.message!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chatId: "chat-1",
          senderId: "user-1",
          type: expect.anything(),
          content: "Hello, World!",
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

    it("should emit error when user is not participant", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      mockPrisma.chatParticipant!.findUnique = vi.fn().mockResolvedValue(null);

      await chatGateway.handleMessage(socket as any, messageData);

      expect(socket.emit).toHaveBeenCalledWith("error", {
        message: "No permission to send messages to this chat",
      });
    });

    it("should emit error when user is not authenticated", async () => {
      const socket = createMockSocket({ userId: undefined });

      await chatGateway.handleMessage(socket as any, messageData);

      expect(socket.emit).toHaveBeenCalledWith("error", {
        message: "Unauthorized",
      });
    });
  });

  describe("handleMessageRead", () => {
    it("should mark message as read", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      mockPrisma.messageRead!.upsert = vi.fn().mockResolvedValue({});

      await chatGateway.handleMessageRead(socket as any, {
        messageId: "msg-1",
        chatId: "chat-1",
      });

      expect(mockPrisma.messageRead!.upsert).toHaveBeenCalledWith({
        where: {
          messageId_userId: {
            messageId: "msg-1",
            userId: "user-1",
          },
        },
        update: {},
        create: {
          messageId: "msg-1",
          userId: "user-1",
        },
      });
    });

    it("should broadcast read event to chat room", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      mockPrisma.messageRead!.upsert = vi.fn().mockResolvedValue({});

      await chatGateway.handleMessageRead(socket as any, {
        messageId: "msg-1",
        chatId: "chat-1",
      });

      expect(socket.to).toHaveBeenCalledWith("chat:chat-1");
    });
  });

  describe("handleTyping", () => {
    it("should broadcast typing event to chat room", async () => {
      const socket = createMockSocket({ userId: "user-1" });

      chatGateway.handleTyping(socket as any, {
        chatId: "chat-1",
        isTyping: true,
      });

      expect(socket.to).toHaveBeenCalledWith("chat:chat-1");
    });
  });

  describe("handleReaction", () => {
    it("should add reaction to message", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      const mockReaction = {
        messageId: "msg-1",
        userId: "user-1",
        emoji: "👍",
      };
      mockPrisma.messageReaction!.upsert = vi
        .fn()
        .mockResolvedValue(mockReaction);

      await chatGateway.handleReaction(socket as any, {
        messageId: "msg-1",
        emoji: "👍",
      });

      expect(mockPrisma.messageReaction!.upsert).toHaveBeenCalled();
    });

    it("should broadcast reaction to other users", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      mockPrisma.messageReaction!.upsert = vi.fn().mockResolvedValue({
        messageId: "msg-1",
        userId: "user-1",
        emoji: "👍",
      });

      await chatGateway.handleReaction(socket as any, {
        messageId: "msg-1",
        emoji: "👍",
      });

      expect(socket.broadcast.emit).toHaveBeenCalledWith("message:reaction", {
        messageId: "msg-1",
        reaction: expect.any(Object),
      });
    });
  });

  describe("deliverToParticipants", () => {
    it("should deliver message to online users", async () => {
      const message = { id: "msg-1", content: "Hello" };
      mockPrisma.chatParticipant!.findMany = vi
        .fn()
        .mockResolvedValue([{ userId: "user-1" }, { userId: "user-2" }]);

      await chatGateway.deliverToParticipants(
        message as any,
        "chat-1",
        "user-1",
      );

      expect(mockOfflineQueue.enqueue).toHaveBeenCalled();
    });
  });

  describe("emitNotification", () => {
    it("should emit notification to user room", () => {
      const payload = { type: "LIKE", postId: "post-1" };

      chatGateway.emitNotification("user-1", payload);

      expect(chatGateway.server.to).toHaveBeenCalledWith("user:user-1");
    });
  });

  describe("call events", () => {
    it("should handle incoming call by looking up target user", async () => {
      const socket = createMockSocket({ userId: "user-1" });

      await chatGateway.handleCallIncoming(socket as any, {
        targetUserId: "user-2",
      });

      expect(socket.broadcast.emit).not.toHaveBeenCalled();
    });

    it("should handle call answer", async () => {
      const socket = createMockSocket({ userId: "user-2" });

      await chatGateway.handleCallAnswer(socket as any, {
        callId: "call-1",
        initiatorId: "user-1",
      });

      expect(socket.broadcast.emit).not.toHaveBeenCalled();
    });

    it("should handle call reject", async () => {
      const socket = createMockSocket({ userId: "user-2" });

      await chatGateway.handleCallReject(socket as any, {
        callId: "call-1",
        initiatorId: "user-1",
      });

      expect(socket.broadcast.emit).not.toHaveBeenCalled();
    });

    it("should handle call end without errors", async () => {
      const socket = createMockSocket({ userId: "user-1", id: "socket-1" });

      await chatGateway.handleCallEnd(socket as any, {
        callId: "call-1",
        participants: ["user-1", "user-2"],
      });

      expect(socket.broadcast.emit).not.toHaveBeenCalled();
    });
  });

  describe("handleStatusCreate", () => {
    it("should create status successfully", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      const mockStatus = {
        id: "status-1",
        userId: "user-1",
        content: "My status",
        type: "TEXT",
        user: { id: "user-1", username: "testuser", avatar: null },
      };
      mockPrisma.status!.create = vi.fn().mockResolvedValue(mockStatus);

      await chatGateway.handleStatusCreate(socket as any, {
        content: "My status",
        type: "TEXT",
      });

      expect(mockPrisma.status!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          content: "My status",
          type: "TEXT",
          expiresAt: expect.any(Date),
        }),
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    });

    it("should broadcast status to other users", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      const mockStatus = {
        id: "status-1",
        userId: "user-1",
        content: "My status",
        type: "TEXT",
        user: { id: "user-1", username: "testuser", avatar: null },
      };
      mockPrisma.status!.create = vi.fn().mockResolvedValue(mockStatus);

      await chatGateway.handleStatusCreate(socket as any, {
        content: "My status",
        type: "TEXT",
      });

      expect(socket.broadcast.emit).toHaveBeenCalledWith(
        "status:create",
        mockStatus,
      );
    });
  });

  describe("handleUserStatus", () => {
    it("should update user status", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);

      await chatGateway.handleUserStatus(socket as any, { status: "busy" });

      expect(mockPrisma.user!.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { status: "busy" },
      });
    });

    it("should invalidate user cache", async () => {
      const socket = createMockSocket({ userId: "user-1" });
      mockPrisma.user!.update = vi.fn().mockResolvedValue({});
      mockCache.del = vi.fn().mockResolvedValue(undefined);

      await chatGateway.handleUserStatus(socket as any, { status: "busy" });

      expect(mockCache.del).toHaveBeenCalledWith("jwt:user:user-1");
    });
  });
});
