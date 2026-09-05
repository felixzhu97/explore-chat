import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";
import { toMessageType } from "@/shared/utils/message-type";
import { Message } from "@/messages/domain/model/message";
import type { MessageRepository } from "@/messages/domain/repository/message.repository";
import type { ChatRepository } from "@/chats/domain/repository/chat.repository";

export interface CreateMessageData {
  content: string;
  type: string;
  senderId: string;
  chatId: string;
  clientMsgId?: string;
  mediaUrl?: string;
  replyToMessageId?: string;
}

export interface GetMessagesOptions {
  page: number;
  limit: number;
  search?: string;
}

const CHATS_CACHE_KEY = (uid: string) => `chats:${uid}`;

const SENDER_SELECT = {
  id: true,
  username: true,
  avatar: true,
} as const;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    @Inject("ChatRepository")
    private readonly chatRepository: ChatRepository,
    @Inject("MessageRepository")
    private readonly messageRepository: MessageRepository,
  ) {}

  /** Single write path for REST and WS. */
  async createMessage(data: CreateMessageData) {
    const chat = await this.chatRepository.findById(data.chatId);

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    try {
      chat.ensureParticipant(data.senderId);
    } catch {
      throw new ForbiddenException(
        "No permission to send messages to this chat",
      );
    }

    const draft = Message.create({
      id: randomUUID(),
      chatId: data.chatId,
      senderId: data.senderId,
      type: toMessageType(data.type),
      content: data.content,
      ...(data.mediaUrl != null && { mediaUrl: data.mediaUrl }),
      ...(data.replyToMessageId != null && {
        replyToMessageId: data.replyToMessageId,
      }),
      ...(data.clientMsgId != null && { clientMsgId: data.clientMsgId }),
    });
    draft.assertSendableBy(data.senderId);

    const saved = await this.messageRepository.save(draft);
    await this.chatRepository.touchUpdatedAt(data.chatId);

    await this.cache.delMany(
      chat.participants.map((p) => CHATS_CACHE_KEY(p.id)),
    );

    const message = await this.prisma.message.findUnique({
      where: { id: saved.id },
      include: { sender: { select: SENDER_SELECT } },
    });

    if (!message) {
      throw new NotFoundException("消息不存在");
    }

    return {
      ...message,
      ...(data.clientMsgId != null && { clientMsgId: data.clientMsgId }),
      status: "sent" as const,
    };
  }

  async getMessages(chatId: string, options: GetMessagesOptions) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where: {
      chatId: string;
      isDeleted: boolean;
      content?: { contains: string };
    } = {
      chatId,
      isDeleted: false,
    };

    if (search) {
      where.content = {
        contains: search,
      };
    }

    return await this.prisma.message.findMany({
      where,
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  }

  async updateMessage(messageId: string, data: Partial<CreateMessageData>) {
    const updateData: {
      updatedAt: Date;
      content?: string;
      type?: ReturnType<typeof toMessageType>;
    } = {
      updatedAt: new Date(),
    };
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.type !== undefined) {
      updateData.type = toMessageType(data.type);
    }
    return await this.prisma.message.update({
      where: { id: messageId },
      data: updateData,
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  async deleteMessage(messageId: string) {
    const existing = await this.messageRepository.findById(messageId);
    if (!existing) {
      throw new NotFoundException("消息不存在");
    }

    const deleted = existing.delete();
    return this.messageRepository.save(deleted);
  }
}
