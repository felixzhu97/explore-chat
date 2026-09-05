import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/core/database/prisma.service";
import { AbstractPrismaRepository } from "@/base/infra/abstract-prisma.repository";
import { MessageRepository } from "@/messages/domain/repository/message.repository";
import { Message } from "@/messages/domain/message.entity";
import { toMessageType } from "@/shared/utils/message-type";

@Injectable()
export class PrismaMessageRepository
  extends AbstractPrismaRepository
  implements MessageRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(message: Message): Promise<Message> {
    const existing = await this.prisma.message.findUnique({
      where: { id: message.id },
    });

    if (existing) {
      const updated = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          content: message.content,
          type: toMessageType(message.type),
          isEdited: message.isEdited,
          isDeleted: message.isDeleted,
          ...(message.mediaUrl != null && { mediaUrl: message.mediaUrl }),
          ...(message.replyToMessageId != null && {
            replyToMessageId: message.replyToMessageId,
          }),
          updatedAt: message.updatedAt,
        },
      });
      return this.toDomain(updated, message.clientMsgId);
    }

    const id = message.id.length > 0 ? message.id : randomUUID();
    const created = await this.prisma.message.create({
      data: {
        id,
        chatId: message.chatId,
        senderId: message.senderId,
        type: toMessageType(message.type),
        content: message.content,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
        isForwarded: message.isForwarded,
        ...(message.mediaUrl != null && { mediaUrl: message.mediaUrl }),
        ...(message.thumbnailUrl != null && {
          thumbnailUrl: message.thumbnailUrl,
        }),
        ...(message.duration != null && { duration: message.duration }),
        ...(message.size != null && { size: message.size }),
        ...(message.latitude != null && { latitude: message.latitude }),
        ...(message.longitude != null && { longitude: message.longitude }),
        ...(message.originalMessageId != null && {
          originalMessageId: message.originalMessageId,
        }),
        ...(message.replyToMessageId != null && {
          replyToMessageId: message.replyToMessageId,
        }),
      },
    });

    return this.toDomain(created, message.clientMsgId);
  }

  async findById(id: string): Promise<Message | null> {
    const row = await this.prisma.message.findUnique({ where: { id } });
    if (!row || row.isDeleted) {
      return null;
    }
    return this.toDomain(row);
  }

  async findByChatId(
    chatId: string,
    options: { page: number; limit: number; search?: string },
  ): Promise<Message[]> {
    const { page, limit, search } = options;
    const where: Prisma.MessageWhereInput = {
      chatId,
      isDeleted: false,
      ...(search != null && search.length > 0
        ? { content: { contains: search } }
        : {}),
    };

    const rows = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(
    row: {
      id: string;
      chatId: string;
      senderId: string;
      type: string;
      content: string;
      mediaUrl: string | null;
      thumbnailUrl: string | null;
      duration: number | null;
      size: number | null;
      latitude: number | null;
      longitude: number | null;
      isEdited: boolean;
      isDeleted: boolean;
      isForwarded: boolean;
      originalMessageId: string | null;
      replyToMessageId: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    clientMsgId?: string,
  ): Message {
    return Message.create({
      id: row.id,
      chatId: row.chatId,
      senderId: row.senderId,
      type: toMessageType(row.type),
      content: row.content,
      ...(row.mediaUrl != null && { mediaUrl: row.mediaUrl }),
      ...(row.thumbnailUrl != null && { thumbnailUrl: row.thumbnailUrl }),
      ...(row.duration != null && { duration: row.duration }),
      ...(row.size != null && { size: row.size }),
      ...(row.latitude != null && { latitude: row.latitude }),
      ...(row.longitude != null && { longitude: row.longitude }),
      isEdited: row.isEdited,
      isDeleted: row.isDeleted,
      isForwarded: row.isForwarded,
      ...(row.originalMessageId != null && {
        originalMessageId: row.originalMessageId,
      }),
      ...(row.replyToMessageId != null && {
        replyToMessageId: row.replyToMessageId,
      }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(clientMsgId != null && { clientMsgId }),
    });
  }
}
