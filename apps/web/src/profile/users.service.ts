import type { ApiClient, ApiResponse } from "@/auth/api-client";
import { getApiClient } from "@/auth/api-client";
import type { User } from "@/auth/user.model";
import { mapUser, mergeUserProfile } from "@/auth/user.model";

export class UserApi {
  constructor(private apiClient: ApiClient) {}

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.apiClient.get(endpoint);
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    return this.apiClient.get(`/users/${userId}`);
  }

  async searchUsers(query: string): Promise<ApiResponse> {
    return this.apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  }
}

export function mapUnknownToUser(data: unknown): User {
  return mapUser(data as Parameters<typeof mapUser>[0]);
}

export const mockUser = {
  id: "current-user",
  username: "me",
  name: "我",
  avatar: "/placeholder.svg?height=40&width=40&text=我",
  phone: "+86 138 0000 0000",
  email: "me@example.com",
  status: "在线",
  isOnline: true,
  lastSeen: new Date().toISOString(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

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
    usersServiceInstance = new UsersService(new UserApi(getApiClient()));
  }
  return usersServiceInstance;
};
