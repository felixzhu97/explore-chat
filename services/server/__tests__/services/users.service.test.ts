import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import {
  UsersService,
  GetUsersOptions,
  UpdateUserData,
} from "@/users/service/users.service";
import { PrismaService } from "@/core/database/prisma.service";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";

describe("UsersService", () => {
  let usersService: UsersService;
  let mockPrisma: Partial<PrismaService>;
  let mockElasticsearch: Partial<ElasticsearchService>;

  const mockUser = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    phone: "+1234567890",
    avatar: "https://example.com/avatar.jpg",
    status: "online",
    isOnline: true,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      blockedUser: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    mockElasticsearch = {
      indexUser: vi.fn(),
      deleteUser: vi.fn(),
    };

    usersService = new UsersService(
      mockPrisma as PrismaService,
      mockElasticsearch as ElasticsearchService,
    );
  });

  describe("getUsers", () => {
    const getUsersOptions: GetUsersOptions = {
      page: 1,
      limit: 20,
    };

    it("should return paginated users", async () => {
      const users = [mockUser];
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue(users);
      mockPrisma.user!.count = vi.fn().mockResolvedValue(1);

      const result = await usersService.getUsers(getUsersOptions);

      expect(result).toEqual({
        data: users,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it("should calculate correct skip value for pagination", async () => {
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.user!.count = vi.fn().mockResolvedValue(0);

      await usersService.getUsers({ page: 3, limit: 10 });

      expect(mockPrisma.user!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it("should filter users by search term", async () => {
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.user!.count = vi.fn().mockResolvedValue(0);

      await usersService.getUsers({ ...getUsersOptions, search: "test" });

      expect(mockPrisma.user!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { username: expect.objectContaining({ contains: "test" }) },
              { email: expect.objectContaining({ contains: "test" }) },
              { phone: expect.objectContaining({ contains: "test" }) },
            ]),
          }),
        }),
      );
    });

    it("should return correct total pages", async () => {
      mockPrisma.user!.findMany = vi
        .fn()
        .mockResolvedValue(Array(10).fill(mockUser));
      mockPrisma.user!.count = vi.fn().mockResolvedValue(45);

      const result = await usersService.getUsers({ page: 1, limit: 10 });

      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);

      const result = await usersService.getUserById("user-1");

      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(usersService.getUserById("non-existent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(usersService.getUserById("non-existent")).rejects.toThrow(
        "用户不存在",
      );
    });
  });

  describe("getUsersByIds", () => {
    it("should return map of users", async () => {
      const users = [
        { id: "user-1", username: "user1", avatar: null },
        { id: "user-2", username: "user2", avatar: "avatar.jpg" },
      ];
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue(users);

      const result = await usersService.getUsersByIds(["user-1", "user-2"]);

      expect(result).toBeInstanceOf(Map);
      expect(result.get("user-1")).toEqual({ username: "user1", avatar: null });
      expect(result.get("user-2")).toEqual({
        username: "user2",
        avatar: "avatar.jpg",
      });
    });

    it("should return empty map for empty input", async () => {
      const result = await usersService.getUsersByIds([]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockPrisma.user!.findMany).not.toHaveBeenCalled();
    });

    it("should deduplicate ids", async () => {
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([mockUser]);

      await usersService.getUsersByIds(["user-1", "user-1", "user-1"]);

      expect(mockPrisma.user!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ["user-1"] } },
        }),
      );
    });
  });

  describe("updateUser", () => {
    const updateData: UpdateUserData = {
      username: "newusername",
      email: "new@example.com",
      phone: "+9876543210",
      avatar: "https://example.com/new-avatar.jpg",
      status: "away",
    };

    it("should update user successfully", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.findFirst = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.update = vi
        .fn()
        .mockResolvedValue({ ...mockUser, ...updateData });
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);

      const result = await usersService.updateUser("user-1", updateData);

      expect(result.username).toBe(updateData.username);
      expect(mockElasticsearch.indexUser).toHaveBeenCalled();
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        usersService.updateUser("non-existent", updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when username is taken", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.findFirst = vi
        .fn()
        .mockResolvedValue({ id: "user-2", username: "taken" });

      await expect(
        usersService.updateUser("user-1", { username: "taken" }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        usersService.updateUser("user-1", { username: "taken" }),
      ).rejects.toThrow("用户名、邮箱或手机号已被使用");
    });

    it("should only update provided fields", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.findFirst = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.update = vi.fn().mockResolvedValue(mockUser);
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);

      await usersService.updateUser("user-1", { status: "busy" });

      expect(mockPrisma.user!.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "busy",
          }),
        }),
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.user!.delete = vi.fn().mockResolvedValue(mockUser);
      mockElasticsearch.deleteUser = vi.fn().mockResolvedValue(undefined);

      const result = await usersService.deleteUser("user-1");

      expect(result).toEqual({ message: "用户已删除" });
      expect(mockElasticsearch.deleteUser).toHaveBeenCalledWith("user-1");
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(usersService.deleteUser("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("blockUser", () => {
    it("should block user successfully", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.blockedUser!.findUnique = vi.fn().mockResolvedValue(null);
      mockPrisma.blockedUser!.create = vi.fn().mockResolvedValue({});

      const result = await usersService.blockUser("user-1", "user-2");

      expect(result).toEqual({ message: "用户已被阻止" });
    });

    it("should throw BadRequestException when blocking self", async () => {
      await expect(usersService.blockUser("user-1", "user-1")).rejects.toThrow(
        BadRequestException,
      );
      await expect(usersService.blockUser("user-1", "user-1")).rejects.toThrow(
        "不能阻止自己",
      );
    });

    it("should throw NotFoundException when blocked user not found", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        usersService.blockUser("user-1", "non-existent"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        usersService.blockUser("user-1", "non-existent"),
      ).rejects.toThrow("要阻止的用户不存在");
    });

    it("should throw BadRequestException when user already blocked", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      mockPrisma.blockedUser!.findUnique = vi.fn().mockResolvedValue({});

      await expect(usersService.blockUser("user-1", "user-2")).rejects.toThrow(
        BadRequestException,
      );
      await expect(usersService.blockUser("user-1", "user-2")).rejects.toThrow(
        "该用户已被阻止",
      );
    });
  });

  describe("unblockUser", () => {
    it("should unblock user successfully", async () => {
      mockPrisma.blockedUser!.findUnique = vi.fn().mockResolvedValue({});
      mockPrisma.blockedUser!.delete = vi.fn().mockResolvedValue({});

      const result = await usersService.unblockUser("user-1", "user-2");

      expect(result).toEqual({ message: "已取消阻止用户" });
    });

    it("should throw NotFoundException when user is not blocked", async () => {
      mockPrisma.blockedUser!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        usersService.unblockUser("user-1", "user-2"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        usersService.unblockUser("user-1", "user-2"),
      ).rejects.toThrow("该用户未被阻止");
    });
  });
});
