import { AuthApi } from "../auth.api";
import type { HttpClient } from "@/core/api-client";

jest.mock("axios", () => ({
  isAxiosError: jest.fn((error) => {
    return (
      error &&
      typeof error === "object" &&
      "isAxiosError" in error &&
      error.isAxiosError === true
    );
  }),
}));

describe("AuthApi", () => {
  let adapter: AuthApi;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;
    adapter = new AuthApi(mockHttpClient);
  });

  describe("constructor", () => {
    it("should accept http client in constructor", () => {
      expect(() => new AuthApi(mockHttpClient)).not.toThrow();
    });
  });

  describe("login", () => {
    const mockSuccessResponse = {
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          username: "testuser",
        },
        token: "access-token-123",
        refreshToken: "refresh-token-456",
      },
    };

    it("should return auth session on successful login", async () => {
      mockHttpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await adapter.login("test@example.com", "password123");

      expect(result.user.id).toBe("user-1");
      expect(result.token).toBe("access-token-123");
      expect(result.refreshToken).toBe("refresh-token-456");
    });

    it("should call http.post with email and password", async () => {
      mockHttpClient.post.mockResolvedValue(mockSuccessResponse);

      await adapter.login("test@example.com", "password123");

      expect(mockHttpClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should throw error when user is missing", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { token: "token-only" },
      });

      await expect(adapter.login("test@test.com", "wrong")).rejects.toThrow(
        "Login failed",
      );
    });

    it("should throw error when token is missing", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          user: { id: "user-1", email: "test@test.com", username: "test" },
        },
      });

      await expect(adapter.login("test@test.com", "password")).rejects.toThrow(
        "Login failed",
      );
    });

    it("should throw error when http.post throws", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("Network error"));

      await expect(adapter.login("test@test.com", "password")).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("register", () => {
    const registerPayload = {
      email: "new@test.com",
      password: "password123",
      username: "newuser",
    };
    const mockRegisterResponse = {
      data: {
        user: { id: "user-2", email: "new@test.com", username: "newuser" },
        token: "new-token",
        refreshToken: "new-refresh",
      },
    };

    it("should return auth session on successful registration", async () => {
      mockHttpClient.post.mockResolvedValue(mockRegisterResponse);

      const result = await adapter.register(registerPayload);

      expect(result).toEqual({
        user: mockRegisterResponse.data.user,
        token: "new-token",
        refreshToken: "new-refresh",
      });
    });

    it("should call http.post with register payload", async () => {
      mockHttpClient.post.mockResolvedValue(mockRegisterResponse);

      await adapter.register(registerPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        "/auth/register",
        registerPayload,
      );
    });

    it("should throw error when user or token missing", async () => {
      mockHttpClient.post.mockResolvedValue({ data: { user: null } });

      await expect(adapter.register(registerPayload)).rejects.toThrow(
        "Register failed",
      );
    });
  });

  describe("isAuthError", () => {
    let isAxiosError: jest.Mock;

    beforeEach(() => {
      jest.resetModules();
      isAxiosError = require("axios").isAxiosError;
    });

    it("should return true for 401 axios error", () => {
      isAxiosError.mockReturnValue(true);
      const axiosError = { isAxiosError: true, response: { status: 401 } };

      const testAdapter = new AuthApi(mockHttpClient);
      const result = testAdapter.isAuthError(axiosError);

      expect(result).toBe(true);
    });

    it("should return true for 403 axios error", () => {
      isAxiosError.mockReturnValue(true);
      const axiosError = { isAxiosError: true, response: { status: 403 } };

      const testAdapter = new AuthApi(mockHttpClient);
      const result = testAdapter.isAuthError(axiosError);

      expect(result).toBe(true);
    });

    it("should return false for non-axios error", () => {
      isAxiosError.mockReturnValue(false);

      const testAdapter = new AuthApi(mockHttpClient);
      const result = testAdapter.isAuthError(new Error("Network error"));

      expect(result).toBe(false);
    });

    it("should return false for null", () => {
      const testAdapter = new AuthApi(mockHttpClient);
      expect(testAdapter.isAuthError(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      const testAdapter = new AuthApi(mockHttpClient);
      expect(testAdapter.isAuthError(undefined)).toBe(false);
    });
  });
});
