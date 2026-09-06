export type GroupMemberRole = "member" | "admin" | "owner";

export interface GroupMember {
  id?: string;
  userId?: string;
  name?: string;
  userName?: string;
  avatar?: string;
  userAvatar?: string;
  role: GroupMemberRole;
  joinedAt?: string | Date;
  lastSeen?: string;
}

export type ContactGroupMember = GroupMember;

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isGroup?: boolean;
  phone?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  lastSeen?: string;
  pinned?: boolean;
  muted?: boolean;
  blocked?: boolean;
  members?: GroupMember[];
  memberCount?: number;
  description?: string;
  admin?: string[];
}
