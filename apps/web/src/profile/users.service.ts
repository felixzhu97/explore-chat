import type { User } from "@/auth/user.model";
import { UserApi } from "./user.api";
import { getAppComposition } from "@/core/composition-root";
import { mapUnknownToUser } from "./users.mapper";
import { mergeUserProfile } from "@/auth/user.model";

export class UsersService {
  constructor(private readonly userApi: UserApi) {}

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<User[]> {
    const response = await this.userApi.getUsers(params);
    if (!response.success) {
      throw new Error(response.message || "获取用户列表失败");
    }
    if (!response.data) {
      return [];
    }
    const rows = response.data as User[];
    return rows.map((user) => mapUnknownToUser(user));
  }

  async getUserById(userId: string): Promise<User | null> {
    const response = await this.userApi.getUserById(userId);
    if (!response.success) {
      throw new Error(response.message || "获取用户详情失败");
    }
    if (!response.data) {
      return null;
    }
    return mapUnknownToUser(response.data);
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.userApi.searchUsers(query);
    if (!response.success) {
      throw new Error(response.message || "搜索用户失败");
    }
    if (!response.data) {
      return [];
    }
    const rows = response.data as User[];
    return rows.map((user) => mapUnknownToUser(user));
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    return mergeUserProfile(user, {
      username: updates.username,
      name: updates.name,
      about: updates.about,
      avatar: updates.avatar,
      status: updates.status,
    });
  }
}

let usersServiceInstance: UsersService | null = null;

export const getUsersService = (): UsersService => {
  if (!usersServiceInstance) {
    usersServiceInstance = new UsersService(getAppComposition().userApi);
  }
  return usersServiceInstance;
};
