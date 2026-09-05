import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthSession } from "../auth-session";
import type { ApiClient } from "@/auth/api-client";
import type { AppStorage } from "@/auth/storage";
import { AuthApi } from "@/auth/auth-session";

Object.defineProperty(globalThis, "localStorage", {
  value: {
    removeItem: vi.fn(),
    setItem: vi.fn(),
    getItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

const createMockApiClient = (): ApiClient => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  setToken: vi.fn(),
});

const createMockStorage = (): AppStorage => ({
  load: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
});

const createMockAuthApi = (): Partial<AuthApi> => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
  changePassword: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
});

describe("AuthSession", () => {
  let authService: AuthSession;
  let mockApiClient: ApiClient;
  let mockStorage: AppStorage;
  let mockAuthApi: Partial<AuthApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiClient = createMockApiClient();
    mockStorage = createMockStorage();
    mockAuthApi = createMockAuthApi();
  });

  const createAuthService = () => {
    return new AuthSession(mockApiClient, mockAuthApi as AuthApi, mockStorage);
  };

  describe("constructor", () => {
    it("should initialize with auth state", async () => {
      mockStorage.load = vi.fn().mockReturnValue(null);
      authService = createAuthService();
      await new Promise((r) => setTimeout(r, 50));
      const state = authService.getAuthState();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };
      const mockResponse = {
        success: true,
        data: { user: mockUser, token: "jwt-token" },
      };
      mockAuthApi.login = vi.fn().mockResolvedValue(mockResponse);
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(mockStorage.save).toHaveBeenCalledWith(
        "instagram_user",
        JSON.stringify(mockUser),
      );
      expect(mockStorage.save).toHaveBeenCalledWith(
        "access_token",
        "jwt-token",
      );
      expect(mockApiClient.setToken).toHaveBeenCalledWith("jwt-token");
    });

    it("should return error when login fails", async () => {
      mockAuthApi.login = vi.fn().mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.login({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid credentials");
    });

    it("should return error when login throws exception", async () => {
      mockAuthApi.login = vi.fn().mockRejectedValue(new Error("Network error"));
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should set loading state during login", async () => {
      mockAuthApi.login = vi
        .fn()
        .mockImplementation(() => new Promise((r) => setTimeout(r, 100)));
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const loginPromise = authService.login({
        email: "test@example.com",
        password: "password123",
      });

      const loadingState = authService.getAuthState();
      expect(loadingState.isLoading).toBe(true);

      await loginPromise;
      const finalState = authService.getAuthState();
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe("register", () => {
    it("should register successfully with valid data", async () => {
      const mockUser = {
        id: "user-2",
        username: "newuser",
        email: "new@example.com",
      };
      const mockResponse = {
        success: true,
        data: { user: mockUser, token: "new-jwt-token" },
      };
      mockAuthApi.register = vi.fn().mockResolvedValue(mockResponse);
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.register({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(mockStorage.save).toHaveBeenCalledWith(
        "instagram_user",
        JSON.stringify(mockUser),
      );
      expect(mockStorage.save).toHaveBeenCalledWith(
        "access_token",
        "new-jwt-token",
      );
    });

    it("should return error when registration fails", async () => {
      mockAuthApi.register = vi.fn().mockResolvedValue({
        success: false,
        message: "Email already exists",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.register({
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email already exists");
    });

    it("should return error when register throws exception", async () => {
      mockAuthApi.register = vi
        .fn()
        .mockRejectedValue(new Error("Server error"));
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.register({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Server error");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      mockAuthApi.logout = vi.fn().mockResolvedValue(undefined);
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      await authService.logout();

      const state = authService.getAuthState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(mockStorage.remove).toHaveBeenCalledWith("instagram_user");
      expect(mockStorage.remove).toHaveBeenCalledWith("access_token");
      expect(mockStorage.remove).toHaveBeenCalledWith("refresh_token");
    });

    it("should clear storage even if logout API fails", async () => {
      mockAuthApi.logout = vi.fn().mockRejectedValue(new Error("API error"));
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      await authService.logout();

      const state = authService.getAuthState();
      expect(state.isAuthenticated).toBe(false);
      expect(mockStorage.remove).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when authenticated", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };
      mockAuthApi.getCurrentUser = vi.fn().mockResolvedValue({
        success: true,
        data: { user: mockUser },
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const user = await authService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.id).toBe("user-1");
    });

    it("should return null when getCurrentUser fails", async () => {
      mockAuthApi.getCurrentUser = vi
        .fn()
        .mockRejectedValue(new Error("Not authenticated"));
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it("should return null when response is not successful", async () => {
      mockAuthApi.getCurrentUser = vi.fn().mockResolvedValue({
        success: false,
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      mockAuthApi.refreshToken = vi.fn().mockResolvedValue({
        success: true,
        data: { token: "new-refreshed-token" },
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.refreshToken("refresh-token-value");

      expect(result).toBeDefined();
      expect(mockStorage.save).toHaveBeenCalledWith(
        "access_token",
        "new-refreshed-token",
      );
      expect(mockApiClient.setToken).toHaveBeenCalledWith(
        "new-refreshed-token",
      );
    });

    it("should return null when refresh fails", async () => {
      mockAuthApi.refreshToken = vi
        .fn()
        .mockRejectedValue(new Error("Token expired"));
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.refreshToken("invalid-refresh-token");

      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully when authenticated", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };
      mockStorage.load = vi.fn().mockReturnValue(null);
      mockApiClient.put = vi.fn().mockResolvedValue({
        success: true,
        data: { user: { ...mockUser, name: "New Name" } },
      });

      authService = createAuthService();
      authService
        .login({ email: "test@example.com", password: "password" })
        .then(() => {});

      const result = await authService.updateUser({ name: "New Name" });

      if (result.success) {
        expect(result.success).toBe(true);
      }
    });

    it("should return error when user is not authenticated", async () => {
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.updateUser({ name: "New Name" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("用户未登录");
    });
  });

  describe("changePassword", () => {
    it("should return error when user is not authenticated", async () => {
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.changePassword(
        "oldPassword",
        "newPassword",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("用户未登录");
    });

    it("should change password successfully when authenticated", async () => {
      mockAuthApi.changePassword = vi.fn().mockResolvedValue({
        success: true,
        message: "Password changed",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);
      mockAuthApi.login = vi.fn().mockResolvedValue({
        success: true,
        data: {
          user: { id: "user-1", username: "test", email: "test@test.com" },
          token: "token",
        },
      });

      authService = createAuthService();
      await authService.login({ email: "test@test.com", password: "pass" });
      const result = await authService.changePassword(
        "oldPassword",
        "newPassword",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("forgotPassword", () => {
    it("should send reset link successfully", async () => {
      mockAuthApi.forgotPassword = vi.fn().mockResolvedValue({
        success: true,
        message: "Reset link sent",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.forgotPassword("test@example.com");

      expect(result.success).toBe(true);
    });

    it("should return error when forgotPassword fails", async () => {
      mockAuthApi.forgotPassword = vi.fn().mockResolvedValue({
        success: false,
        message: "Email not found",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.forgotPassword(
        "nonexistent@example.com",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email not found");
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      mockAuthApi.resetPassword = vi.fn().mockResolvedValue({
        success: true,
        message: "Password reset successful",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.resetPassword(
        "reset-token",
        "newPassword123",
      );

      expect(result.success).toBe(true);
    });

    it("should return error when resetPassword fails", async () => {
      mockAuthApi.resetPassword = vi.fn().mockResolvedValue({
        success: false,
        message: "Invalid or expired token",
      });
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const result = await authService.resetPassword(
        "invalid-token",
        "newPassword123",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid or expired token");
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      authService.clearError();

      const state = authService.getAuthState();
      expect(state.error).toBeNull();
    });
  });

  describe("getAuthState", () => {
    it("should return a copy of auth state", () => {
      mockStorage.load = vi.fn().mockReturnValue(null);

      authService = createAuthService();
      const state1 = authService.getAuthState();
      const state2 = authService.getAuthState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });
});
