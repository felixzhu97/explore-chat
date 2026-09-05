import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-response.model";

export class AuthApi {
  constructor(private apiClient: ApiClient) {}

  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse> {
    return this.apiClient.post("/auth/register", userData);
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.apiClient.post("/auth/login", credentials);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    return this.apiClient.post("/auth/refresh-token", { refreshToken });
  }

  async logout(): Promise<ApiResponse> {
    return this.apiClient.post("/auth/logout");
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.apiClient.get("/auth/me");
  }

  async updateProfile(profileData: {
    username?: string;
    status?: string;
    avatar?: string;
  }): Promise<ApiResponse> {
    return this.apiClient.put("/auth/profile", profileData);
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.apiClient.put("/auth/change-password", passwordData);
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.apiClient.post("/auth/forgot-password", { email });
  }

  async resetPassword(resetData: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.apiClient.post("/auth/reset-password", resetData);
  }
}
