import { describe, it, expect, beforeEach, vi } from "vitest";
import { UsersService } from "../users.service";
import { UserApi } from "@/profile/users.service";

const createMockUserApi = (): Partial<UserApi> => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  searchUsers: vi.fn(),
});

describe("UsersService", () => {
  let usersService: UsersService;
  let mockUserApi: Partial<UserApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserApi = createMockUserApi();
    usersService = new UsersService(mockUserApi as UserApi);
  });

  describe("getUsers", () => {
    it("should return array of users when API returns success", async () => {
      const mockUsers = [
        { id: "user-1", username: "alice", email: "alice@example.com" },
        { id: "user-2", username: "bob", email: "bob@example.com" },
      ];
      mockUserApi.getUsers = vi.fn().mockResolvedValue({ users: mockUsers });

      const result = await usersService.getUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
      });
      expect(result[0].id).toBe("user-1");
      expect(result[1].id).toBe("user-2");
    });

    it("should return empty array when API returns null data", async () => {
      mockUserApi.getUsers = vi.fn().mockResolvedValue({ users: null });

      const result = await usersService.getUsers();

      expect(result).toEqual([]);
    });

    it("should return empty array when API returns empty array", async () => {
      mockUserApi.getUsers = vi.fn().mockResolvedValue({ users: [] });

      const result = await usersService.getUsers();

      expect(result).toEqual([]);
    });

    it("should return empty array when users field is missing", async () => {
      mockUserApi.getUsers = vi.fn().mockResolvedValue({});

      const result = await usersService.getUsers();

      expect(result).toEqual([]);
    });

    it("should pass pagination params to API", async () => {
      mockUserApi.getUsers = vi.fn().mockResolvedValue({ users: [] });

      await usersService.getUsers({ page: 2, limit: 20 });

      expect(mockUserApi.getUsers).toHaveBeenCalledWith({
        page_size: 20,
        search: undefined,
      });
    });

    it("should pass search query to API", async () => {
      mockUserApi.getUsers = vi.fn().mockResolvedValue({ users: [] });

      await usersService.getUsers({ search: "alice" });

      expect(mockUserApi.getUsers).toHaveBeenCalledWith({
        page_size: undefined,
        search: "alice",
      });
    });
  });

  describe("getUserById", () => {
    it("should return user when API returns success", async () => {
      const mockUser = {
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
      };
      mockUserApi.getUserById = vi.fn().mockResolvedValue(mockUser);

      const result = await usersService.getUserById("user-1");

      expect(result).toMatchObject({
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
      });
      expect(result?.id).toBe("user-1");
      expect(result?.username).toBe("alice");
    });

    it("should return null when API returns null data", async () => {
      mockUserApi.getUserById = vi.fn().mockResolvedValue(null);

      const result = await usersService.getUserById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null when API fails", async () => {
      mockUserApi.getUserById = vi
        .fn()
        .mockRejectedValue(new Error("User not found"));

      const result = await usersService.getUserById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("searchUsers", () => {
    it("should return array of matching users when API returns success", async () => {
      const mockUsers = [
        { id: "user-1", username: "alice_smith", email: "alice@example.com" },
      ];
      mockUserApi.searchUsers = vi.fn().mockResolvedValue({ users: mockUsers });

      const result = await usersService.searchUsers("alice");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ username: "alice_smith" });
      expect(result[0].username).toBe("alice_smith");
    });

    it("should return empty array when API returns null data", async () => {
      mockUserApi.searchUsers = vi.fn().mockResolvedValue({ users: null });

      const result = await usersService.searchUsers("nonexistent");

      expect(result).toEqual([]);
    });

    it("should return empty array when API returns empty array", async () => {
      mockUserApi.searchUsers = vi.fn().mockResolvedValue({ users: [] });

      const result = await usersService.searchUsers("xyz123");

      expect(result).toEqual([]);
    });

    it("should return empty array when users and hits are missing", async () => {
      mockUserApi.searchUsers = vi.fn().mockResolvedValue({});

      const result = await usersService.searchUsers("test");

      expect(result).toEqual([]);
    });

    it("should pass search query to API", async () => {
      mockUserApi.searchUsers = vi.fn().mockResolvedValue({ users: [] });

      await usersService.searchUsers("john");

      expect(mockUserApi.searchUsers).toHaveBeenCalledWith("john");
    });

    it("should map hits when users is absent", async () => {
      const mockHits = [
        { id: "user-9", username: "hit_user", email: "hit@example.com" },
      ];
      mockUserApi.searchUsers = vi.fn().mockResolvedValue({ hits: mockHits });

      const result = await usersService.searchUsers("hit");

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe("hit_user");
    });
  });

  describe("updateUser", () => {
    it("should update and return user when user exists", async () => {
      const existingUser = {
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
      };
      mockUserApi.getUserById = vi.fn().mockResolvedValue(existingUser);

      const result = await usersService.updateUser("user-1", {
        name: "Alice Smith",
        avatar: "new-avatar.jpg",
      });

      expect(result).toMatchObject({
        id: "user-1",
        name: "Alice Smith",
        avatar: "new-avatar.jpg",
      });
      expect(result.name).toBe("Alice Smith");
      expect(result.avatar).toBe("new-avatar.jpg");
    });

    it("should throw error when user does not exist", async () => {
      mockUserApi.getUserById = vi.fn().mockResolvedValue(null);

      await expect(
        usersService.updateUser("nonexistent", { name: "New Name" }),
      ).rejects.toThrow("用户不存在");
    });

    it("should throw error when getUserById fails", async () => {
      mockUserApi.getUserById = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));

      await expect(
        usersService.updateUser("user-1", { name: "New Name" }),
      ).rejects.toThrow("用户不存在");
    });

    it("should only update specified fields", async () => {
      const existingUser = {
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
        name: "Alice",
        avatar: "old-avatar.jpg",
        about: "Old about",
      };
      mockUserApi.getUserById = vi.fn().mockResolvedValue(existingUser);

      const result = await usersService.updateUser("user-1", {
        name: "Alice Updated",
      });

      expect(result.name).toBe("Alice Updated");
    });
  });
});
