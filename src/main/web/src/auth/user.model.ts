import merge from "lodash/merge";

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  name?: string;
  about?: string;
  isOnline: boolean;
  lastSeen?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function mapUser(
  data: Partial<User> & Pick<User, "id" | "username" | "email">,
): User {
  return {
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
}

export function mergeUserProfile(user: User, updates: Partial<User>): User {
  return merge({}, user, updates, { updatedAt: new Date() });
}
