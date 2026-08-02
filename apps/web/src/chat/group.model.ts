export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar: string;
  role: "member" | "admin" | "owner";
  joinedAt: string;
  lastSeen?: string;
}

export interface GroupSettings {
  whoCanSendMessages: "everyone" | "admins";
  whoCanEditGroupInfo: "everyone" | "admins";
  whoCanAddMembers: "everyone" | "admins";
  disappearingMessages: boolean;
  disappearingMessagesDuration: number;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
  admins: string[];
  settings: GroupSettings;
  description?: string;
  inviteLink?: string;
}
