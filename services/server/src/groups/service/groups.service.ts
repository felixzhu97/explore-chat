import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";

export interface CreateGroupData {
  name: string;
  description?: string;
  avatar?: string;
  participantIds: string[];
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  avatar?: string;
}

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroups(userId: string) {
    const groupParticipants = await this.prisma.groupParticipant.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            creator: {
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
                    isOnline: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        group: {
          updatedAt: "desc",
        },
      },
    });

    return groupParticipants.map((gp) => ({
      id: gp.group.id,
      name: gp.group.name,
      description: gp.group.description,
      avatar: gp.group.avatar,
      creator: gp.group.creator,
      participants: gp.group.participants.map((p) => ({
        id: p.user.id,
        username: p.user.username,
        avatar: p.user.avatar,
        isOnline: p.user.isOnline,
        role: p.role,
      })),
      createdAt: gp.group.createdAt,
      updatedAt: gp.group.updatedAt,
    }));
  }

  async createGroup(userId: string, data: CreateGroupData) {
    const { name, description, avatar, participantIds } = data;

    if (!name || name.trim().length === 0) {
      throw new BadRequestException("群组名称不能为空");
    }

    // 检查参与者是否存在
    if (participantIds.length > 0) {
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
    }

    const groupData: any = {
      name,
      creatorId: userId,
      participants: {
        create: [
          { userId, role: "ADMIN" as const },
          ...participantIds.map((pid) => ({
            userId: pid,
            role: "MEMBER" as const,
          })),
        ],
      },
    };

    if (description !== undefined) groupData.description = description;
    if (avatar !== undefined) groupData.avatar = avatar;

    const group = await this.prisma.group.create({
      data: groupData,
      include: {
        creator: {
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

    return group;
  }

  async getGroupById(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        creator: {
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
                isOnline: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException("群组不存在");
    }

    // 检查用户是否为参与者
    const isParticipant = group.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权访问此群组");
    }

    return group;
  }

  async updateGroup(id: string, userId: string, data: UpdateGroupData) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!group) {
      throw new NotFoundException("群组不存在");
    }

    // 检查用户是否为管理员
    const participant = group.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== "ADMIN") {
      throw new BadRequestException("只有管理员可以修改群组信息");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    return await this.prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
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
  }

  async deleteGroup(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!group) {
      throw new NotFoundException("群组不存在");
    }

    // 只有创建者可以删除群组
    if (group.creatorId !== userId) {
      throw new BadRequestException("只有创建者可以删除群组");
    }

    await this.prisma.group.delete({
      where: { id },
    });

    return { message: "群组已删除" };
  }

  async addParticipant(groupId: string, userId: string, newUserId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
      },
    });

    if (!group) {
      throw new NotFoundException("群组不存在");
    }

    // 检查用户是否为管理员
    const participant = group.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== "ADMIN") {
      throw new BadRequestException("只有管理员可以添加成员");
    }

    // 检查新用户是否存在
    const newUser = await this.prisma.user.findUnique({
      where: { id: newUserId },
    });

    if (!newUser) {
      throw new NotFoundException("要添加的用户不存在");
    }

    // 检查是否已经是成员
    const isAlreadyMember = group.participants.some(
      (p) => p.userId === newUserId,
    );
    if (isAlreadyMember) {
      throw new BadRequestException("该用户已经是群组成员");
    }

    await this.prisma.groupParticipant.create({
      data: {
        groupId,
        userId: newUserId,
        role: "MEMBER",
        addedBy: userId,
      },
    });

    return { message: "成员已添加" };
  }

  async removeParticipant(
    groupId: string,
    userId: string,
    removeUserId: string,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
      },
    });

    if (!group) {
      throw new NotFoundException("群组不存在");
    }

    // 检查用户是否为管理员
    const participant = group.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== "ADMIN") {
      throw new BadRequestException("只有管理员可以移除成员");
    }

    // 不能移除自己
    if (removeUserId === userId) {
      throw new BadRequestException("不能移除自己");
    }

    await this.prisma.groupParticipant.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: removeUserId,
        },
      },
    });

    return { message: "成员已移除" };
  }

  async changeRole(
    groupId: string,
    userId: string,
    targetUserId: string,
    role: "ADMIN" | "MEMBER",
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
      },
    });

    if (!group) {
      throw new NotFoundException("群组不存在");
    }

    // 检查用户是否为管理员
    const participant = group.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== "ADMIN") {
      throw new BadRequestException("只有管理员可以更改成员角色");
    }

    await this.prisma.groupParticipant.update({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
      data: { role },
    });

    return { message: "成员角色已更改" };
  }
}
