export interface CommentDocRow {
  _id?: { toString(): string };
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
}

export interface CommentRepository {
  insert(doc: CreateCommentInput): Promise<string>;
  findByPostId(
    postId: string,
    limit: number,
    skip: number,
  ): Promise<CommentDocRow[]>;
  findById(id: string): Promise<CommentDocRow | null>;
  deleteOne(id: string, userId: string): Promise<boolean>;
}
