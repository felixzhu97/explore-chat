import { Injectable } from "@nestjs/common";
import type {
  CommentDocRow,
  CreateCommentInput,
  CommentRepository,
} from "@/comments/domain/repository/comment.repository";
import { MongoCommentRepository as MongoCommentStore } from "@/core/database/mongo-comment.repository";

@Injectable()
export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly impl: MongoCommentStore) {}

  insert(doc: CreateCommentInput): Promise<string> {
    return this.impl.insert(doc);
  }

  findByPostId(
    postId: string,
    limit: number,
    skip: number,
  ): Promise<CommentDocRow[]> {
    return this.impl.findByPostId(postId, limit, skip);
  }

  findById(id: string): Promise<CommentDocRow | null> {
    return this.impl.findById(id);
  }

  deleteOne(id: string, userId: string): Promise<boolean> {
    return this.impl.deleteOne(id, userId);
  }
}
