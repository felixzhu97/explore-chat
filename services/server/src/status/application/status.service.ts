import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";

export interface CreateStatusData {
  type: "TEXT" | "IMAGE" | "VIDEO";
  content?: string;
  mediaUrl?: string;
  duration?: number;
}

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatuses(userId: string) {
    // 获取用户联系人的状态
    const contacts = await this.prisma.contact.findMany({
      where: { ownerId: userId },
      select: { phone: true },
    });

    const contactPhones = contacts
      .map((c) => c.phone)
      .filter(
        (phone): phone is string => phone !== null && phone !== undefined,
      );

    // 如果没有联系人，直接返回空数组
    if (contactPhones.length === 0) {
      return [];
    }

    // 获取联系人用户的状态
    const users = await this.prisma.user.findMany({
      where: {
        phone: {
          in: contactPhones,
        },
      },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    const statuses = await this.prisma.status.findMany({
      where: {
        userId: {
          in: userIds,
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        views: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return statuses.map((status) => ({
      ...status,
      isViewed: status.views.length > 0,
    }));
  }

  async createStatus(userId: string, data: CreateStatusData) {
    const { type, content, mediaUrl, duration } = data;

    const statusData: any = {
      userId,
      type,
      content: content || "",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
    };

    if (mediaUrl !== undefined) {
      statusData.mediaUrl = mediaUrl;
    }
    if (duration !== undefined) {
      statusData.duration = duration;
    }

    const status = await this.prisma.status.create({
      data: statusData,
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

    return status;
  }

  async getStatusById(id: string) {
    const status = await this.prisma.status.findUnique({
      where: { id },
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

    if (!status) {
      throw new NotFoundException("状态不存在");
    }

    // 检查是否已过期
    if (status.expiresAt < new Date()) {
      throw new NotFoundException("状态已过期");
    }

    return status;
  }

  async deleteStatus(id: string, userId: string) {
    const status = await this.prisma.status.findUnique({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException("状态不存在");
    }

    // 只有创建者可以删除
    if (status.userId !== userId) {
      throw new NotFoundException("无权删除此状态");
    }

    await this.prisma.status.delete({
      where: { id },
    });

    return { message: "状态已删除" };
  }

  async viewStatus(id: string, userId: string) {
    const status = await this.prisma.status.findUnique({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException("状态不存在");
    }

    // 检查是否已过期
    if (status.expiresAt < new Date()) {
      throw new NotFoundException("状态已过期");
    }

    // 标记为已查看
    await this.prisma.statusView.upsert({
      where: {
        statusId_userId: {
          statusId: id,
          userId,
        },
      },
      update: {},
      create: {
        statusId: id,
        userId,
      },
    });

    return { statusId: id, isViewed: true };
  }
}
