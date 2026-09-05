export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  status?: string | null;
  followersCount?: number;
  followingCount?: number;
}
