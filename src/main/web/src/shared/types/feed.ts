export interface StoryItem {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  hasUnseen?: boolean;
}

export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: string;
  imageUrl: string;
  likeCount: string;
  commentCount: string;
  caption: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  type?: string;
  videoUrl?: string;
  coverImageUrl?: string;
  coverUrl?: string;
  mediaUrls?: string[];
  autoTags?: string[];
  isSponsored?: boolean;
  adAccountId?: string;
  adCampaignId?: string;
  adGroupId?: string;
  adCreativeId?: string;
}

export interface SuggestedUser {
  id: string;
  username: string;
  displayName?: string;
  avatar: string;
  description: string;
}
