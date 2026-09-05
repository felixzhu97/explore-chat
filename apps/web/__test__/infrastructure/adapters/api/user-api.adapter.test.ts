import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserApi } from "@/profile/user.api";
import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-response.model";

describe("UserApi", () => {
  let adapter: UserApi;
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
    adapter = new UserApi(mockApiClient);
  });

  describe("getUsers", () => {
    it("should call get with users endpoint without params", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getUsers();

      expect(mockApiClient.get).toHaveBeenCalledWith("/users");
    });

    it("should include pagination params when provided", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getUsers({ page: 2, limit: 20 });

      expect(mockApiClient.get).toHaveBeenCalledWith("/users?page=2&limit=20");
    });

    it("should include search param when provided", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getUsers({ search: "john" });

      expect(mockApiClient.get).toHaveBeenCalledWith("/users?search=john");
    });

    it("should include all params when provided", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.getUsers({ page: 1, limit: 10, search: "test" });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users?page=1&limit=10&search=test",
      );
    });
  });

  describe("getUserById", () => {
    it("should call get with user-specific endpoint", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { id: "user-123" },
      };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.getUserById("user-123");

      expect(mockApiClient.get).toHaveBeenCalledWith("/users/user-123");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("searchUsers", () => {
    it("should call get with encoded search query", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.searchUsers("john doe");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/search?q=john%20doe",
      );
    });

    it("should encode special characters in search query", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.searchUsers("user@example.com");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/users/search?q=user%40example.com",
      );
    });

    it("should handle empty search query", async () => {
      const mockResponse: ApiResponse = { success: true, data: [] };
      (mockApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.searchUsers("");

      expect(mockApiClient.get).toHaveBeenCalledWith("/users/search?q=");
    });
  });
});
