import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";

export interface CreateChatData {
  type: "PRIVATE" | "GROUP";
  name?: string;
  avatar?: string;
  participantIds: string[];
}

export interface UpdateChatData {
  name?: string;
  avatar?: string;
}

export interface ChatListItem {
  id: string;
  type: string;
  name: string | null;
  avatar: string | null;
  isArchived: boolean;
  isMuted: boolean;
  participants: Array<{
    id: string;
    username: string;
    avatar: string | null;
    isOnline: boolean;
    status: string | null;
  }>;
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      username: string;
      avatar: string | null;
    };
  } | null;
  updatedAt: Date;
}

const CHATS_CACHE_KEY = (uid: string) => `chats:${uid}`;

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getChats(userId: string): Promise<ChatListItem[]> {
    const cacheKey = CHATS_CACHE_KEY(userId);
    const cached = await this.cache.get<ChatListItem[]>(cacheKey);
    if (cached) return cached;

    const chatParticipants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    isOnline: true,
                    status: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: "desc",
        },
      },
    });

    const result: ChatListItem[] = chatParticipants.map((cp) => {
      const otherParticipant =
        cp.chat.type === "PRIVATE"
          ? cp.chat.participants.find((p) => p.user.id !== userId)?.user
          : null;
      return {
        id: cp.chat.id,
        type: cp.chat.type,
        name: cp.chat.name ?? otherParticipant?.username ?? "Chat",
        avatar: cp.chat.avatar,
        isArchived: cp.isArchived,
        isMuted: cp.isMuted,
        participants: cp.chat.participants.map((p) => ({
          id: p.user.id,
          username: p.user.username,
          avatar: p.user.avatar,
          isOnline: p.user.isOnline,
          status: p.user.status,
        })),
        lastMessage: cp.chat.messages[0] || null,
        updatedAt: cp.chat.updatedAt,
      };
    });
    await this.cache.set(CHATS_CACHE_KEY(userId), result);
    return result;
  }

  async createChat(userId: string, data: CreateChatData) {
    const { type, name, avatar, participantIds } = data;

    if (participantIds.length === 0) {
      throw new BadRequestException("至少需要一个参与者");
    }

    const participants = await this.prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    if (participants.length !== participantIds.length) {
      throw new BadRequestException("部分参与者不存在");
    }

    if (
      type === "PRIVATE" &&
      participantIds.length === 1 &&
      participantIds[0]
    ) {
      const existingChats = await this.prisma.chat.findMany({
        where: {
          type: "PRIVATE",
        },
        include: {
          participants: true,
        },
      });

      const targetUserId = participantIds[0];
      const existingChat = existingChats.find((chat) => {
        const participantUserIds = sortBy(
          chat.participants.map((p) => p.userId),
        );
        const expected = sortBy([userId, targetUserId]);
        return (
          participantUserIds.length === 2 &&
          isEqual(participantUserIds, expected)
        );
      });

      if (existingChat) {
        return existingChat;
      }
    }

    const chatData: Prisma.ChatCreateInput = {
      type,
      participants: {
        create: [
          { user: { connect: { id: userId } } },
          ...participantIds.map((pid) => ({ user: { connect: { id: pid } } })),
        ],
      },
    };

    if (name !== undefined) chatData.name = name;
    if (avatar !== undefined) chatData.avatar = avatar;

    const chat = await this.prisma.chat.create({
      data: chatData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                status: true,
              },
            },
          },
        },
      },
    });

    await this.cache.delMany(
      [userId, ...participantIds].map((id) => CHATS_CACHE_KEY(id)),
    );
    return chat;
  }

  async getChatById(id: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                status: true,
              },
            },
          },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权访问此聊天");
    }

    return chat;
  }

  async updateChat(id: string, userId: string, data: UpdateChatData) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权修改此聊天");
    }

    if (chat.type === "PRIVATE") {
      throw new BadRequestException("私聊不能修改名称和头像");
    }

    const updateData: Prisma.ChatUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const updated = await this.prisma.chat.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    await this.cache.delMany(
      chat.participants.map((p) => CHATS_CACHE_KEY(p.userId)),
    );
    return updated;
  }

  async deleteChat(id: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权删除此聊天");
    }

    await this.prisma.chat.delete({
      where: { id },
    });

    return { message: "聊天已删除" };
  }

  async archiveChat(id: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException("聊天不存在或无权访问");
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      data: {
        isArchived: true,
      },
    });

    return { message: "聊天已归档" };
  }

  async muteChat(id: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException("聊天不存在或无权访问");
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      data: {
        isMuted: true,
      },
    });

    return { message: "聊天已静音" };
  }

  async unmuteChat(id: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException("聊天不存在或无权访问");
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      data: {
        isMuted: false,
        muteUntil: null,
      },
    });

    return { message: "聊天已取消静音" };
  }
}
