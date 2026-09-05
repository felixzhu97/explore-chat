import type { ApiClient } from "@/auth/api-client";
import { getApiClient } from "@/auth/api-client";
import type { User } from "@/auth/user.model";
import { mapUser, mergeUserProfile } from "@/auth/user.model";

export class UserApi {
  constructor(private apiClient: ApiClient) {}

  async getUsers(params?: {
    page_size?: number;
    page_token?: string;
    search?: string;
  }): Promise<{ users: unknown[]; next_page_token?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.page_token) queryParams.append("page_token", params.page_token);
    if (params?.search) queryParams.append("search", params.search);

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.apiClient.get(endpoint);
  }

  async getUserById(userId: string): Promise<User> {
    return this.apiClient.get<User>(`/users/${userId}`);
  }

  async searchUsers(
    query: string,
  ): Promise<{ users?: unknown[]; hits?: unknown[] }> {
    return this.apiClient.get(
      `/search?q=${encodeURIComponent(query)}&type=users&page_size=20`,
    );
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
    const response = await this.userApi.getUsers({
      page_size: params?.limit,
      search: params?.search,
    });
    const rows = Array.isArray(response.users) ? response.users : [];
    return rows.map((user) => mapUnknownToUser(user));
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await this.userApi.getUserById(userId);
      if (!response) return null;
      return mapUnknownToUser(response);
    } catch {
      return null;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.userApi.searchUsers(query);
    const rows = Array.isArray(response.users)
      ? response.users
      : Array.isArray(response.hits)
        ? response.hits
        : [];
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
