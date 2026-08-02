import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";

export interface CreateCallData {
  type: "AUDIO" | "VIDEO";
  /** Target user id (use when you have the peer user id). */
  targetUserId?: string;
  /** Chat id for 1:1 call; server will resolve the other participant. Use when contact id is the chat id (e.g. web). */
  chatId?: string;
}

@Injectable()
export class CallsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalls(userId: string) {
    const calls = await this.prisma.call.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
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
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return calls;
  }

  async createCall(userId: string, data: CreateCallData) {
    const { type, targetUserId: providedTargetUserId, chatId } = data;

    let targetUserId = providedTargetUserId;

    if (!targetUserId && chatId) {
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        include: { participants: { select: { userId: true } } },
      });
      if (!chat) {
        throw new NotFoundException("聊天不存在");
      }
      const other = chat.participants.find((p) => p.userId !== userId);
      if (!other) {
        throw new BadRequestException("无法从聊天中确定通话对象");
      }
      targetUserId = other.userId;
    }

    if (!targetUserId) {
      throw new BadRequestException("请提供 targetUserId 或 chatId");
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException("目标用户不存在");
    }

    const callData: any = {
      type,
      initiatorId: userId,
      status: "OUTGOING",
      participants: {
        create: [
          { userId, status: "CALLING" },
          { userId: targetUserId, status: "CALLING" },
        ],
      },
    };

    if (chatId !== undefined) {
      callData.chatId = chatId;
    }

    const call = await this.prisma.call.create({
      data: callData,
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
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

    return call;
  }

  async getCallById(id: string, userId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
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

    if (!call) {
      throw new NotFoundException("通话不存在");
    }

    // 检查用户是否为参与者
    const isParticipant = call.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权访问此通话");
    }

    return call;
  }

  async answerCall(id: string, userId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!call) {
      throw new NotFoundException("通话不存在");
    }

    // 检查用户是否为参与者
    const participant = call.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new BadRequestException("无权接听此通话");
    }

    // 更新通话状态
    await this.prisma.call.update({
      where: { id },
      data: {
        status: "ONGOING",
      },
    });

    // 更新参与者状态
    await this.prisma.callParticipant.update({
      where: {
        callId_userId: {
          callId: id,
          userId,
        },
      },
      data: {
        status: "CONNECTED",
      },
    });

    return { message: "通话已接听" };
  }

  async rejectCall(id: string, userId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!call) {
      throw new NotFoundException("通话不存在");
    }

    // 检查用户是否为参与者
    const participant = call.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new BadRequestException("无权拒绝此通话");
    }

    // 更新通话状态
    await this.prisma.call.update({
      where: { id },
      data: {
        status: "REJECTED",
        endTime: new Date(),
      },
    });

    // 更新参与者状态
    await this.prisma.callParticipant.update({
      where: {
        callId_userId: {
          callId: id,
          userId,
        },
      },
      data: {
        status: "REJECTED",
      },
    });

    return { message: "通话已拒绝" };
  }

  async endCall(id: string, userId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!call) {
      throw new NotFoundException("通话不存在");
    }

    // 检查用户是否为参与者
    const participant = call.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new BadRequestException("无权结束此通话");
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - call.startTime.getTime()) / 1000,
    );

    // 更新通话状态
    await this.prisma.call.update({
      where: { id },
      data: {
        status: "ENDED",
        endTime,
        duration,
      },
    });

    // 更新所有参与者状态
    await Promise.all(
      call.participants.map((p) =>
        this.prisma.callParticipant.update({
          where: {
            callId_userId: {
              callId: id,
              userId: p.userId,
            },
          },
          data: {
            status: "DISCONNECTED",
          },
        }),
      ),
    );

    return { message: "通话已结束", duration };
  }
}
