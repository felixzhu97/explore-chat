import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";
import { IUserRepository } from "@/users/domain/user.repository.interface";
import { User } from "@/users/domain/user.entity";

@Injectable()
export class UserRepositoryAdapter implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      return null;
    }

    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        ...(userData.phone && { phone: userData.phone }),
        ...(userData.avatar && { avatar: userData.avatar }),
        ...(userData.status && { status: userData.status }),
        password: (userData as any).password, // 密码字段不在User实体中，但需要传递
      },
    });

    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.status !== undefined) updateData.status = data.status;
    if ((data as any).password) updateData.password = (data as any).password;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async search(query: string, limit = 10, offset = 0): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: limit,
      skip: offset,
    });

    return users.map((user) =>
      User.create({
        id: user.id,
        username: user.username,
        email: user.email,
        ...(user.phone && { phone: user.phone }),
        ...(user.avatar && { avatar: user.avatar }),
        ...(user.status && { status: user.status }),
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    );
  }
}
