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
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: "user-1",
            email: "test@example.com",
            username: "testuser",
          },
          token: "access-token-123",
          refreshToken: "refresh-token-456",
        },
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

    it("should throw error when response success is false", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: false, message: "Invalid credentials" },
      });

      await expect(adapter.login("test@test.com", "wrong")).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should throw error with default message when success is true but data is missing", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: true, message: "" },
      });

      await expect(adapter.login("test@test.com", "password")).rejects.toThrow(
        "Login failed",
      );
    });

    it("should throw error when data.data is null", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: true, data: null },
      });

      await expect(adapter.login("test@test.com", "password")).rejects.toThrow(
        "Login failed",
      );
    });

    it("should use default error message when message is empty", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: false, message: "" },
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
      success: true,
      message: "Success",
      data: {
        user: { id: "user-2", email: "new@test.com", username: "newuser" },
        token: "new-token",
        refreshToken: "new-refresh",
      },
    };

    it("should return auth session on successful registration", async () => {
      mockHttpClient.post.mockResolvedValue({ data: mockRegisterResponse });

      const result = await adapter.register(registerPayload);

      expect(result).toEqual(mockRegisterResponse.data);
    });

    it("should call http.post with register payload", async () => {
      mockHttpClient.post.mockResolvedValue({ data: mockRegisterResponse });

      await adapter.register(registerPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        "/auth/register",
        registerPayload,
      );
    });

    it("should throw error when success is false", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: false, message: "Email already exists" },
      });

      await expect(adapter.register(registerPayload)).rejects.toThrow(
        "Email already exists",
      );
    });

    it("should throw error with default message when success is true but data is missing", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: { success: true, message: "" },
      });

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
