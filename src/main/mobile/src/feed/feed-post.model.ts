export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  imageUrl: string;
  isLiked: boolean;
  isSaved: boolean;
  type?: string;
  videoUrl?: string;
  coverImageUrl?: string;
  mediaUrls: string[];
}
