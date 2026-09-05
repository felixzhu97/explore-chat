import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";
import { AbstractPrismaRepository } from "@/base/infra/abstract-prisma.repository";
import { ChatRepository } from "@/chats/domain/repository/chat.repository";
import { Chat } from "@/chats/domain/model/chat";
import { User } from "@/users/domain/user.entity";

@Injectable()
export class PrismaChatRepository
  extends AbstractPrismaRepository
  implements ChatRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Chat | null> {
    const row = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!row) {
      return null;
    }

    return Chat.create({
      id: row.id,
      type: row.type,
      ...(row.name != null && { name: row.name }),
      ...(row.avatar != null && { avatar: row.avatar }),
      participants: row.participants.map((p) =>
        User.create({
          id: p.user.id,
          username: p.user.username,
          email: p.user.email,
          ...(p.user.phone != null && { phone: p.user.phone }),
          ...(p.user.avatar != null && { avatar: p.user.avatar }),
          ...(p.user.status != null && { status: p.user.status }),
          isOnline: p.user.isOnline,
          lastSeen: p.user.lastSeen,
          createdAt: p.user.createdAt,
          updatedAt: p.user.updatedAt,
        }),
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async touchUpdatedAt(chatId: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  }
}
