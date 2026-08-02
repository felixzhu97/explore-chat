import type { ContactGroupMember } from "@whatschat/shared-types";

export type { ContactGroupMember };

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isGroup: boolean;
  phone?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  lastSeen?: string;
  pinned?: boolean;
  muted?: boolean;
  blocked?: boolean;
  members?: ContactGroupMember[];
  memberCount?: number;
  description?: string;
  admin?: string[];
}

export function mapContact(
  data: Partial<Contact> &
    Pick<Contact, "id" | "name" | "avatar" | "lastMessage" | "timestamp">,
): Contact {
  return {
    unreadCount: data.unreadCount ?? 0,
    isOnline: data.isOnline ?? false,
    isGroup: data.isGroup ?? false,
    ...data,
  };
}
