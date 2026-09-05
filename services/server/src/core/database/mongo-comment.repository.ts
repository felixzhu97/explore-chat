import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export interface CommentDoc {
  _id?: { toString(): string } | string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDoc(row: {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CommentDoc {
  const doc: CommentDoc = {
    _id: row.id,
    postId: row.postId,
    userId: row.userId,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.parentId != null) doc.parentId = row.parentId;
  return doc;
}

@Injectable()
export class MongoCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insert(
    doc: Omit<CommentDoc, "_id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const created = await this.prisma.postComment.create({
      data: {
        postId: doc.postId,
        userId: doc.userId,
        content: doc.content,
        parentId: doc.parentId ?? null,
      },
    });
    return created.id;
  }

  async findByPostId(
    postId: string,
    limit: number,
    skip: number,
  ): Promise<CommentDoc[]> {
    const rows = await this.prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    return rows.map(toDoc);
  }

  async findById(id: string): Promise<CommentDoc | null> {
    const row = await this.prisma.postComment.findUnique({ where: { id } });
    return row ? toDoc(row) : null;
  }

  async deleteOne(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.postComment.deleteMany({
      where: { id, userId },
    });
    return result.count === 1;
  }
}
