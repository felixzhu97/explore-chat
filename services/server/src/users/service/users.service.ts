import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import { PrismaService } from "@/core/database/prisma.service";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";

export interface GetUsersOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async getUsers(options: GetUsersOptions) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          avatar: true,
          status: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    return user;
  }

  async getUsersByIds(
    ids: string[],
  ): Promise<Map<string, { username: string; avatar: string | null }>> {
    const unique = uniq(compact(ids));
    if (unique.length === 0) return new Map();
    const users = await this.prisma.user.findMany({
      where: { id: { in: unique } },
      select: { id: true, username: true, avatar: true },
    });
    return new Map(
      users.map((u) => [
        u.id,
        { username: u.username, avatar: u.avatar ?? null },
      ]),
    );
  }

  async updateUser(id: string, data: UpdateUserData) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("用户不存在");
    }

    if (data.username || data.email || data.phone) {
      const where: any = {};
      if (data.username) {
        where.username = data.username;
      }
      if (data.email) {
        where.email = data.email;
      }
      if (data.phone) {
        where.phone = data.phone;
      }

      const conflictingUser = await this.prisma.user.findFirst({
        where: {
          ...where,
          NOT: { id },
        },
      });

      if (conflictingUser) {
        throw new BadRequestException("用户名、邮箱或手机号已被使用");
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.status !== undefined) updateData.status = data.status;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await this.elasticsearch.indexUser({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    await this.prisma.user.delete({
      where: { id },
    });
    await this.elasticsearch.deleteUser(id);
    return { message: "用户已删除" };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException("不能阻止自己");
    }

    const blockedUser = await this.prisma.user.findUnique({
      where: { id: blockedId },
    });

    if (!blockedUser) {
      throw new NotFoundException("要阻止的用户不存在");
    }

    const existingBlock = await this.prisma.blockedUser.findUnique({
      where: {
        blockedById_blockedId: {
          blockedById: blockerId,
          blockedId,
        },
      },
    });

    if (existingBlock) {
      throw new BadRequestException("该用户已被阻止");
    }

    await this.prisma.blockedUser.create({
      data: {
        blockedById: blockerId,
        blockedId,
      },
    });

    return { message: "用户已被阻止" };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const existingBlock = await this.prisma.blockedUser.findUnique({
      where: {
        blockedById_blockedId: {
          blockedById: blockerId,
          blockedId,
        },
      },
    });

    if (!existingBlock) {
      throw new NotFoundException("该用户未被阻止");
    }

    await this.prisma.blockedUser.delete({
      where: {
        blockedById_blockedId: {
          blockedById: blockerId,
          blockedId,
        },
      },
    });

    return { message: "已取消阻止用户" };
  }
}
