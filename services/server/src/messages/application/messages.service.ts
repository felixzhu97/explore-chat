import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";
import { toMessageType } from "@/shared/utils/message-type";

export interface CreateMessageData {
  content: string;
  type: string;
  senderId: string;
  chatId: string;
  mediaUrl?: string;
  replyToMessageId?: string;
}

export interface GetMessagesOptions {
  page: number;
  limit: number;
  search?: string;
}

const CHATS_CACHE_KEY = (uid: string) => `chats:${uid}`;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async createMessage(data: CreateMessageData) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: data.chatId },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    const message = await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        type: toMessageType(data.type),
        content: data.content,
        ...(data.mediaUrl != null && { mediaUrl: data.mediaUrl }),
        ...(data.replyToMessageId != null && {
          replyToMessageId: data.replyToMessageId,
        }),
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

    await this.prisma.chat.update({
      where: { id: data.chatId },
      data: {
        updatedAt: new Date(),
      },
    });

    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatId: data.chatId },
      select: { userId: true },
    });
    await this.cache.delMany(
      participants.map((p) => CHATS_CACHE_KEY(p.userId)),
    );

    return message;
  }

  async getMessages(chatId: string, options: GetMessagesOptions) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { chatId };

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    return await this.prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  }

  async updateMessage(messageId: string, data: Partial<CreateMessageData>) {
    const updateData: any = {
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
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteMessage(messageId: string) {
    return await this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}
