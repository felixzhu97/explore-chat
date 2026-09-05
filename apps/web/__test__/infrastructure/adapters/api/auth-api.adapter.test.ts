import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthApi } from "@/auth/auth.api";
import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-response.model";

describe("AuthApi", () => {
  let adapter: AuthApi;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
      postStream: vi.fn(),
      setToken: vi.fn(),
      getToken: vi.fn(),
    } as unknown as ApiClient;
    adapter = new AuthApi(mockApiClient);
  });

  describe("register", () => {
    it("should call post with register endpoint and user data", async () => {
      const mockResponse: ApiResponse = { success: true, data: { id: "1" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        phone: "+86 138 0000 0000",
      };

      const result = await adapter.register(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        userData,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should register without optional phone field", async () => {
      const mockResponse: ApiResponse = { success: true, data: { id: "2" } };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      await adapter.register(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        userData,
      );
    });
  });

  describe("login", () => {
    it("should call post with login endpoint and credentials", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { token: "jwt-token" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await adapter.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("refreshToken", () => {
    it("should call post with refresh token endpoint", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { token: "new-token" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.refreshToken("refresh-token-value");

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/refresh-token", {
        refreshToken: "refresh-token-value",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should call post with logout endpoint", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getCurrentUser", () => {
    it("should call get with current user endpoint", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { id: "1", name: "Test User" },
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateProfile", () => {
    it("should call put with profile update endpoint", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const profileData = {
        username: "newname",
        status: "online",
        avatar: "http://example.com/avatar.jpg",
      };

      const result = await adapter.updateProfile(profileData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/auth/profile",
        profileData,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should update profile with partial data", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.updateProfile({ username: "newusername" });

      expect(mockApiClient.put).toHaveBeenCalledWith("/auth/profile", {
        username: "newusername",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("changePassword", () => {
    it("should call put with change password endpoint", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const passwordData = {
        currentPassword: "oldpass",
        newPassword: "newpass123",
      };

      const result = await adapter.changePassword(passwordData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/auth/change-password",
        passwordData,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("forgotPassword", () => {
    it("should call post with forgot password endpoint", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.forgotPassword("test@example.com");

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@example.com",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("resetPassword", () => {
    it("should call post with reset password endpoint", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const resetData = {
        token: "reset-token-abc",
        newPassword: "newpassword123",
      };

      const result = await adapter.resetPassword(resetData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/reset-password",
        resetData,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
