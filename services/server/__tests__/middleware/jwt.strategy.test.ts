import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtStrategy, JwtPayload } from "@/auth/presentation/jwt.strategy";
import { ConfigService } from "@/core/config/config.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      jwt: {
        secret: "test-secret",
        refreshSecret: "test-refresh-secret",
        expiresIn: "15m",
        refreshExpiresIn: "7d",
      },
    })),
  },
}));

describe("JwtStrategy", () => {
  let jwtStrategy: JwtStrategy;
  let mockPrisma: any;
  let mockCache: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
    };

    jwtStrategy = new JwtStrategy(mockPrisma, mockCache);
  });

  describe("validate", () => {
    const payload: JwtPayload = {
      userId: "user-123",
      email: "test@example.com",
      username: "testuser",
    };

    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      username: "testuser",
      phone: "+1234567890",
      avatar: "avatar.jpg",
      status: "online",
      lastSeen: new Date(),
    };

    it("should return cached user if available", async () => {
      const cachedUser = { ...mockUser };
      mockCache.get.mockResolvedValue(cachedUser);

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(cachedUser);
      expect(mockCache.get).toHaveBeenCalledWith("jwt:user:user-123");
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("should fetch user from database when not cached", async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockCache.set.mockResolvedValue(undefined);

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: {
          id: true,
          email: true,
          username: true,
          phone: true,
          avatar: true,
          status: true,
          lastSeen: true,
        },
      });
    });

    it("should cache user after fetching from database", async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockCache.set.mockResolvedValue(undefined);

      await jwtStrategy.validate(payload);

      expect(mockCache.set).toHaveBeenCalledWith(
        "jwt:user:user-123",
        mockUser,
        60,
      );
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtStrategy.validate(payload)).rejects.toThrow("用户不存在");
    });

    it("should continue when cache get fails", async () => {
      mockCache.get.mockRejectedValue(new Error("Redis connection failed"));
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockCache.set.mockResolvedValue(undefined);

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(mockUser);
    });

    it("should continue when cache set fails", async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockCache.set.mockRejectedValue(new Error("Redis connection failed"));

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(mockUser);
    });
  });
});
