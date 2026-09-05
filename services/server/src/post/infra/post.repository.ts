import { Injectable } from "@nestjs/common";
import type {
  PostRepository,
  CreatePostInput,
  PostRow,
} from "@/post/domain/repository/post.repository";
import { CassandraPostRepository as CassandraPostStore } from "@/core/database/cassandra-post.repository";

@Injectable()
export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly impl: CassandraPostStore) {}

  insertPost(input: CreatePostInput): Promise<void> {
    return this.impl.insertPost(input);
  }

  getPostById(postId: string): Promise<PostRow | null> {
    return this.impl.getPostById(postId);
  }

  getPostsByUserId(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ rows: PostRow[]; pageState?: string }> {
    return this.impl.getPostsByUserId(userId, limit, pageState);
  }

  deletePost(postId: string, userId: string): Promise<void> {
    return this.impl.deletePost(postId, userId);
  }
}
