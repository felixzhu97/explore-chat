import type { FeedPost } from "@/feed/feed-post.model";

export interface FeedPostRes {
  postId: string;
  userId: string;
  caption: string;
  type: string;
  mediaUrls?: string[];
  coverUrl?: string;
  location?: string;
  createdAt: string;
  username?: string;
  avatar?: string;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:")) return /^data:video\//i.test(url);
  return VIDEO_EXT.test(url);
}

export function mapFeedPostResToFeedPost(raw: FeedPostRes): FeedPost {
  const urls = raw.mediaUrls ?? [];
  const first = urls[0];
  const isVideoType =
    raw.type === "VIDEO" || (first != null && isVideoUrl(first));

  let imageUrl = first ?? "";
  let videoUrl: string | undefined;
  let coverImageUrl: string | undefined;
  const storedCover =
    raw.coverUrl != null && raw.coverUrl !== "" ? raw.coverUrl : undefined;

  if (isVideoType && first && isVideoUrl(first)) {
    videoUrl = first;
    const poster = storedCover ?? urls.find((u) => u && !isVideoUrl(u));
    if (poster) {
      coverImageUrl = poster;
      imageUrl = poster;
    } else {
      coverImageUrl = undefined;
      imageUrl = first;
    }
  }

  return {
    id: raw.postId,
    userId: raw.userId,
    username: raw.username ?? raw.userId?.slice(0, 8) ?? "",
    avatar: raw.avatar ?? "",
    timestamp: raw.createdAt,
    caption: raw.caption ?? "",
    likeCount: raw.likeCount ?? 0,
    commentCount: raw.commentCount ?? 0,
    imageUrl,
    isLiked: Boolean(raw.isLiked),
    isSaved: Boolean(raw.isSaved),
    type: raw.type,
    videoUrl,
    coverImageUrl,
    mediaUrls: urls,
  };
}
