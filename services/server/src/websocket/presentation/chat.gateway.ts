import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@/core/config/config.service";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";
import {
  OfflineMessageQueueService,
  QueuedMessagePayload,
} from "@/messages/application/offline-message-queue.service";
import { toMessageType } from "@/shared/utils/message-type";
import logger from "@/shared/utils/logger";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

const onlineUsers = new Map<string, string>();

@WebSocketGateway({
  cors: {
    origin: process.env["CORS_ORIGIN"]?.split(",") || [
      "http://localhost:4220",
      "http://localhost:4001",
    ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly offlineQueue: OfflineMessageQueueService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const token =
        (socket.handshake.auth as any)?.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      const config = ConfigService.loadConfig();
      const decoded = this.jwtService.verify(token, {
        secret: config.jwt.secret,
      }) as any;

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          status: true,
        },
      });

      if (!user) {
        socket.disconnect();
        return;
      }

      socket.userId = user.id;
      socket.user = user;

      // Add to online users list
      onlineUsers.set(user.id, socket.id);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      });
      await this.cache.del(`jwt:user:${user.id}`);

      // Join user room
      socket.join(`user:${user.id}`);

      // Notify other users that this user is online
      socket.broadcast.emit("user:online", { userId: user.id });

      socket.emit("user:connect", { userId: user.id });

      const pending = await this.offlineQueue.getAndClear(user.id);
      for (const msg of pending) {
        socket.emit("message:received", msg);
      }

      logger.info(`User connected: ${user.username} (${user.id})`);
    } catch (error) {
      logger.error(`Socket authentication failed: ${error}`);
      socket.disconnect();
    }
  }

  async deliverToParticipants(
    message: QueuedMessagePayload,
    chatId: string,
    senderId: string,
  ): Promise<void> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true },
    });
    const recipientIds = participants
      .map((p: { userId: string }) => p.userId)
      .filter((id: string) => id !== senderId);

    for (const userId of recipientIds) {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        this.server.to(socketId).emit("message:received", message);
      } else {
        this.offlineQueue.enqueue(userId, message);
      }
    }
  }

  emitNotification(recipientId: string, payload: unknown): void {
    this.server.to(`user:${recipientId}`).emit("notification:new", payload);
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      // Remove from online users list
      onlineUsers.delete(socket.userId);

      await this.prisma.user.update({
        where: { id: socket.userId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      });
      await this.cache.del(`jwt:user:${socket.userId}`);

      // Notify other users that this user is offline
      socket.broadcast.emit("user:offline", { userId: socket.userId });

      logger.info(
        `User disconnected: ${socket.user?.username} (${socket.userId})`,
      );
    }
  }

  @SubscribeMessage("message:send")
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      chatId: string;
      content: string;
      type: string;
      mediaUrl?: string;
      replyToMessageId?: string;
    },
  ) {
    try {
      const { chatId, content, type, mediaUrl, replyToMessageId } = data;

      if (!socket.userId) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      // Verify user is a chat participant
      const participant = await this.prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: socket.userId,
          },
        },
      });

      if (!participant) {
        socket.emit("error", {
          message: "No permission to send messages to this chat",
        });
        return;
      }

      const message = await this.prisma.message.create({
        data: {
          chatId,
          senderId: socket.userId,
          type: toMessageType(type ?? "text"),
          content,
          ...(mediaUrl && { mediaUrl }),
          ...(replyToMessageId && { replyToMessageId }),
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

      await this.deliverToParticipants(
        message as QueuedMessagePayload,
        chatId,
        socket.userId,
      );

      socket.emit("message:sent", message);

      logger.info(`Message sent: ${socket.userId} -> ${chatId}`);
    } catch (error) {
      logger.error(`Message send error: ${error}`);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  @SubscribeMessage("message:read")
  async handleMessageRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; chatId: string },
  ) {
    try {
      const { messageId, chatId } = data;

      if (!socket.userId) {
        return;
      }

      // Mark message as read
      await this.prisma.messageRead.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: socket.userId,
          },
        },
        update: {},
        create: {
          messageId,
          userId: socket.userId,
        },
      });

      socket.to(`chat:${chatId}`).emit("message:read", {
        messageId,
        userId: socket.userId,
      });
    } catch (error) {
      logger.error(`Message read error: ${error}`);
    }
  }

  @SubscribeMessage("message:typing")
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const { chatId, isTyping } = data;
    socket.to(`chat:${chatId}`).emit("message:typing", {
      chatId,
      userId: socket.userId,
      isTyping,
    });
  }

  @SubscribeMessage("message:reaction")
  async handleReaction(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    try {
      const { messageId, emoji } = data;

      if (!socket.userId) {
        return;
      }

      // Add or update reaction
      const reaction = await this.prisma.messageReaction.upsert({
        where: {
          messageId_userId_emoji: {
            messageId,
            userId: socket.userId,
            emoji,
          },
        },
        update: {},
        create: {
          messageId,
          userId: socket.userId,
          emoji,
        },
      });

      // Notify other users
      socket.broadcast.emit("message:reaction", {
        messageId,
        reaction,
      });
    } catch (error) {
      logger.error(`Message reaction error: ${error}`);
    }
  }

  @SubscribeMessage("call:incoming")
  async handleCallIncoming(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string },
  ) {
    const { targetUserId } = data;

    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:incoming", {
        ...data,
        initiatorId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:answer")
  async handleCallAnswer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; initiatorId: string },
  ) {
    const { callId, initiatorId } = data;

    const initiatorSocketId = onlineUsers.get(initiatorId);
    if (initiatorSocketId) {
      this.server.to(initiatorSocketId).emit("call:answer", {
        callId,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:reject")
  async handleCallReject(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; initiatorId: string },
  ) {
    const { callId, initiatorId } = data;

    const initiatorSocketId = onlineUsers.get(initiatorId);
    if (initiatorSocketId) {
      this.server.to(initiatorSocketId).emit("call:reject", {
        callId,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:end")
  async handleCallEnd(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; participants: string[] },
  ) {
    const { callId, participants } = data;

    participants.forEach((userId: string) => {
      const participantSocketId = onlineUsers.get(userId);
      if (participantSocketId && participantSocketId !== socket.id) {
        this.server.to(participantSocketId).emit("call:end", {
          callId,
          userId: socket.userId,
        });
      }
    });
  }

  @SubscribeMessage("call:ice-candidate")
  async handleIceCandidate(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { callId: string; targetUserId: string; candidate: any },
  ) {
    const { callId, targetUserId, candidate } = data;

    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:ice-candidate", {
        callId,
        candidate,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:offer")
  async handleCallOffer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; targetUserId: string; offer: any },
  ) {
    const { callId, targetUserId, offer } = data;

    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:offer", {
        callId,
        offer,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:webrtc-answer")
  async handleWebRTCAnswer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; targetUserId: string; answer: any },
  ) {
    const { callId, targetUserId, answer } = data;

    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:webrtc-answer", {
        callId,
        answer,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("status:create")
  async handleStatusCreate(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      content?: string;
      type: string;
      mediaUrl?: string;
      duration?: number;
    },
  ) {
    try {
      const { content, type, mediaUrl, duration } = data;

      if (!socket.userId) {
        return;
      }

      // Create status
      const status = await this.prisma.status.create({
        data: {
          userId: socket.userId,
          content: content || "", // content is required field
          type: type as any,
          ...(mediaUrl && { mediaUrl }),
          ...(duration && { duration }),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires after 24 hours
        },
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

      socket.broadcast.emit("status:create", status);
    } catch (error) {
      logger.error(`Status creation error: ${error}`);
    }
  }

  @SubscribeMessage("user:status")
  async handleUserStatus(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { status: string },
  ) {
    try {
      const { status } = data;

      if (!socket.userId) {
        return;
      }

      await this.prisma.user.update({
        where: { id: socket.userId },
        data: { status },
      });
      await this.cache.del(`jwt:user:${socket.userId}`);

      socket.broadcast.emit("user:status", {
        userId: socket.userId,
        status,
      });
    } catch (error) {
      logger.error(`User status update error: ${error}`);
    }
  }
}
