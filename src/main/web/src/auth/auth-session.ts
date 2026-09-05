import type { AuthTokens } from "@whatschat/shared-types";
import type { User } from "./user.model";
import type { ApiClient } from "@/auth/api-client";
import { getAppComposition } from "@/layout/composition-root";
import { getStorage, type AppStorage } from "@/auth/storage";
import { mapUser, mergeUserProfile } from "./user.model";

export type { AuthTokens };

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export class AuthApi {
  constructor(private apiClient: ApiClient) {}

  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthSessionResponse> {
    return this.apiClient.post<AuthSessionResponse>("/auth/register", userData);
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthSessionResponse> {
    return this.apiClient.post<AuthSessionResponse>("/auth/login", credentials);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken?: string }> {
    return this.apiClient.post("/auth/refreshToken", { refreshToken });
  }

  async logout(): Promise<void> {
    return this.apiClient.post<void>("/auth/logout");
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.apiClient.get<{ user: User }>("/auth/me");
  }

  async updateProfile(profileData: {
    username?: string;
    status?: string;
    avatar?: string;
  }): Promise<{ user: User }> {
    return this.apiClient.patch<{ user: User }>("/auth/profile", profileData);
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return this.apiClient.put<void>("/auth/change-password", passwordData);
  }

  async forgotPassword(email: string): Promise<void> {
    return this.apiClient.post<void>("/auth/forgot-password", { email });
  }

  async resetPassword(resetData: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    return this.apiClient.post<void>("/auth/reset-password", resetData);
  }
}

const STORAGE_KEYS = {
  USER: "instagram_user",
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export class AuthSession {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  constructor(
    private readonly apiClient: ApiClient,
    private readonly authApi: AuthApi,
    private readonly storage: AppStorage,
  ) {
    this.initializeAuth();
  }

  async initializeAuth(): Promise<void> {
    try {
      const savedUser = this.storage.load<string | null>(
        STORAGE_KEYS.USER,
        null,
      );
      const accessToken = this.storage.load<string | null>(
        STORAGE_KEYS.ACCESS_TOKEN,
        null,
      );
      const refreshToken = this.storage.load<string | null>(
        STORAGE_KEYS.REFRESH_TOKEN,
        null,
      );

      if (savedUser && accessToken) {
        this.apiClient.setToken(accessToken);

        try {
          const response = await this.authApi.getCurrentUser();
          if (response.user) {
            this.authState = {
              user: mapUser(response.user),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };
            return;
          }
        } catch {
          if (refreshToken) {
            try {
              const refreshResponse =
                await this.authApi.refreshToken(refreshToken);
              if (refreshResponse.token) {
                const { token } = refreshResponse;
                this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
                if (refreshResponse.refreshToken) {
                  this.storage.save(
                    STORAGE_KEYS.REFRESH_TOKEN,
                    refreshResponse.refreshToken,
                  );
                }
                this.apiClient.setToken(token);

                this.authState = {
                  user: mapUser(JSON.parse(savedUser)),
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                };
                return;
              }
            } catch (refreshError) {
              console.error("Token刷新失败:", refreshError);
            }
          }
        }
      }

      this.clearAuthStorage();
      this.authState = { ...this.authState, isLoading: false };
    } catch (error) {
      console.error("认证初始化失败:", error);
      this.clearAuthStorage();
      this.authState = { ...this.authState, isLoading: false };
    }
  }

  private clearAuthStorage(): void {
    this.storage.remove(STORAGE_KEYS.USER);
    this.storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  async login(data: LoginData): Promise<{ success: boolean; error?: string }> {
    this.authState = { ...this.authState, isLoading: true, error: null };

    try {
      const response = await this.authApi.login(data);
      const { user, token } = response;

      if (!user || !token) {
        throw new Error("登录失败");
      }

      this.storage.save(STORAGE_KEYS.USER, JSON.stringify(user));
      this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
      if (response.refreshToken) {
        this.storage.save(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      this.apiClient.setToken(token);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
      }

      this.authState = {
        user: mapUser(user),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "登录失败，请检查邮箱和密码";
      this.authState = {
        ...this.authState,
        isLoading: false,
        error: errorMessage,
      };
      return { success: false, error: errorMessage };
    }
  }

  async register(
    data: RegisterData,
  ): Promise<{ success: boolean; error?: string }> {
    this.authState = { ...this.authState, isLoading: true, error: null };

    try {
      const response = await this.authApi.register(data);
      const { user, token } = response;

      if (!user || !token) {
        throw new Error("注册失败");
      }

      this.storage.save(STORAGE_KEYS.USER, JSON.stringify(user));
      this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
      if (response.refreshToken) {
        this.storage.save(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      this.apiClient.setToken(token);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
      }

      this.authState = {
        user: mapUser(user),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "注册失败，请稍后重试";
      this.authState = {
        ...this.authState,
        isLoading: false,
        error: errorMessage,
      };
      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authApi.logout();
    } catch (error) {
      console.error("登出API调用失败:", error);
    } finally {
      this.clearAuthStorage();
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.authApi.getCurrentUser();
      if (response.user) {
        const user = mapUser(response.user);
        this.authState = { ...this.authState, user };
        return user;
      }
      return null;
    } catch (error) {
      console.error("获取当前用户失败:", error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string } | null> {
    try {
      const response = await this.authApi.refreshToken(refreshToken);
      if (response.token) {
        const { token } = response;
        this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
        this.apiClient.setToken(token);
        return { token };
      }
      return null;
    } catch (error) {
      console.error("刷新token失败:", error);
      return null;
    }
  }

  async updateUser(updates: {
    username?: string;
    name?: string;
    about?: string;
    status?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: "用户未登录" };
    }

    try {
      const updated = await this.apiClient.put<User>(
        `/users/${this.authState.user.id}`,
        updates,
      );

      const updatedUser = mergeUserProfile(this.authState.user, {
        ...updated,
        ...updates,
      });
      this.storage.save(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      this.authState = { ...this.authState, user: updatedUser };
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "更新用户信息失败";
      this.authState = { ...this.authState, error: errorMessage };
      return { success: false, error: errorMessage };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!this.authState.user) {
      return { success: false, error: "用户未登录" };
    }

    try {
      await this.authApi.changePassword({
        currentPassword,
        newPassword,
      });

      this.clearAuthStorage();
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
      return { success: true, message: "密码修改成功，请重新登录" };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "密码修改失败";
      return { success: false, error: errorMessage };
    }
  }

  async forgotPassword(email: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      await this.authApi.forgotPassword(email);
      return {
        success: true,
        message: "重置链接已发送到邮箱",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "发送重置链接失败";
      return { success: false, error: errorMessage };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      await this.authApi.resetPassword({ token, newPassword });
      return { success: true, message: "密码重置成功" };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "密码重置失败";
      return { success: false, error: errorMessage };
    }
  }

  clearError(): void {
    this.authState = { ...this.authState, error: null };
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }
}

let authSessionInstance: AuthSession | null = null;

export const getAuthSession = (): AuthSession => {
  if (!authSessionInstance) {
    const { apiClient, authApi } = getAppComposition();
    authSessionInstance = new AuthSession(apiClient, authApi, getStorage());
  }
  return authSessionInstance;
};
