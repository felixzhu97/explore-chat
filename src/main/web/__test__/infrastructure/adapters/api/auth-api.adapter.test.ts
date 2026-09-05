import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthApi } from "@/auth/auth-session";
import type { ApiClient } from "@/auth/api-client";

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
      const mockResponse = {
        user: { id: "1", username: "test", email: "test@example.com" },
        token: "jwt",
      };
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
      const mockResponse = {
        user: { id: "2", username: "test", email: "test@example.com" },
        token: "jwt",
      };
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
      const mockResponse = {
        user: { id: "1", username: "test", email: "test@example.com" },
        token: "jwt-token",
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
      const mockResponse = { token: "new-token" };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.refreshToken("refresh-token-value");

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/refreshToken", {
        refreshToken: "refresh-token-value",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should call post with logout endpoint", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined,
      );

      const result = await adapter.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toBeUndefined();
    });
  });

  describe("getCurrentUser", () => {
    it("should call get with current user endpoint", async () => {
      const mockResponse = {
        user: { id: "1", username: "Test User", email: "test@example.com" },
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
    it("should call patch with profile update endpoint", async () => {
      const mockResponse = { user: { id: "1", username: "newname" } };
      (mockApiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const profileData = {
        username: "newname",
        status: "online",
        avatar: "http://example.com/avatar.jpg",
      };

      const result = await adapter.updateProfile(profileData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/auth/profile",
        profileData,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should update profile with partial data", async () => {
      const mockResponse = { user: { id: "1", username: "newusername" } };
      (mockApiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.updateProfile({ username: "newusername" });

      expect(mockApiClient.patch).toHaveBeenCalledWith("/auth/profile", {
        username: "newusername",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("changePassword", () => {
    it("should call put with change password endpoint", async () => {
      (mockApiClient.put as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined,
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
      expect(result).toBeUndefined();
    });
  });

  describe("forgotPassword", () => {
    it("should call post with forgot password endpoint", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined,
      );

      const result = await adapter.forgotPassword("test@example.com");

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@example.com",
      });
      expect(result).toBeUndefined();
    });
  });

  describe("resetPassword", () => {
    it("should call post with reset password endpoint", async () => {
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined,
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
      expect(result).toBeUndefined();
    });
  });
});
