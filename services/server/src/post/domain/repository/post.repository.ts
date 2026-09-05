export interface PostRow {
  user_id: string;
  created_at: Date;
  post_id: string;
  caption: string | null;
  type: string;
  media_urls: string[];
  location: string | null;
  cover_url: string | null;
}

export interface CreatePostInput {
  postId: string;
  userId: string;
  caption: string;
  type: string;
  mediaUrls: string[];
  location?: string;
  coverUrl?: string;
}

export interface PostRepository {
  insertPost(input: CreatePostInput): Promise<void>;
  getPostById(postId: string): Promise<PostRow | null>;
  getPostsByUserId(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ rows: PostRow[]; pageState?: string }>;
  deletePost(postId: string, userId: string): Promise<void>;
}
