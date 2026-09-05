import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "@/auth/service/auth.service";
import { UserRepository } from "@/users/domain/repository/user.repository";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/core/database/prisma.service";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";
import { ConfigService } from "@/core/config/config.service";
import { User } from "@/users/domain/model/user";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      jwt: {
        secret: "test-secret",
        refreshSecret: "test-refresh-secret",
        expiresIn: "15m",
        refreshExpiresIn: "7d",
      },
      security: {
        bcrypt: {
          saltRounds: 10,
        },
      },
    })),
  },
}));

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: Partial<UserRepository>;
  let mockJwtService: Partial<JwtService>;
  let mockPrisma: Partial<PrismaService>;
  let mockElasticsearch: Partial<ElasticsearchService>;

  const mockUser = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    password: "$2a$10$hashedpassword",
    phone: "+1234567890",
    avatar: null,
    status: null,
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue("mock-token"),
      verify: vi.fn(),
    };

    mockPrisma = {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    mockElasticsearch = {
      indexUser: vi.fn(),
    };

    authService = new AuthService(
      mockUserRepository as UserRepository,
      mockJwtService as JwtService,
      mockPrisma as PrismaService,
      mockElasticsearch as ElasticsearchService,
    );
  });

  describe("register", () => {
    const registerData = {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      phone: "+1234567890",
    };

    it("should throw ConflictException if user already exists", async () => {
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        ConflictException,
      );
      await expect(authService.register(registerData)).rejects.toThrow(
        "User already exists",
      );
    });

    it("should create a new user and return user with tokens", async () => {
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.create = vi.fn().mockResolvedValue(mockUser);
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      const result = await authService.register(registerData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBe("mock-access-token");
      expect(result.tokens.refreshToken).toBe("mock-refresh-token");
    });

    it("should use email as username if username not provided", async () => {
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.create = vi.fn().mockImplementation((data) => {
        expect(data.data.username).toBe(registerData.email);
        return Promise.resolve({
          ...mockUser,
          username: data.data.username as string,
        });
      });
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      const dataWithoutUsername = {
        email: registerData.email,
        password: registerData.password,
      };

      await authService.register(dataWithoutUsername);
    });

    it("should index user in Elasticsearch after registration", async () => {
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.create = vi.fn().mockResolvedValue(mockUser);
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      await authService.register(registerData);

      expect(mockElasticsearch.indexUser).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        avatar: mockUser.avatar,
        createdAt: expect.any(String),
      });
    });

    it("should hash password before storing", async () => {
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.create = vi.fn().mockResolvedValue(mockUser);
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      await authService.register(registerData);

      expect(mockPrisma.user!.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: expect.not.stringContaining(registerData.password),
          }),
        }),
      );
    });
  });

  describe("login", () => {
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    it("should throw UnauthorizedException if user not found", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginData)).rejects.toThrow(
        "Invalid email or password",
      );
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      vi.spyOn(authService, "comparePassword").mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should return user and tokens on successful login", async () => {
      mockPrisma.user!.findUnique = vi.fn().mockResolvedValue(mockUser);
      vi.spyOn(authService, "comparePassword").mockResolvedValue(true);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      const result = await authService.login(loginData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBe("mock-access-token");
    });
  });

  describe("refreshToken", () => {
    it("should throw UnauthorizedException if token is invalid", async () => {
      mockJwtService.verify = vi.fn().mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockJwtService.verify = vi.fn().mockReturnValue({
        userId: "user-123",
        email: "test@example.com",
        username: "testuser",
      });
      mockUserRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(authService.refreshToken("valid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should return new tokens on valid refresh token", async () => {
      const mockDomainUser = User.create({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });

      mockJwtService.verify = vi.fn().mockReturnValue({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      mockUserRepository.findById = vi.fn().mockResolvedValue(mockDomainUser);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("new-access-token")
        .mockResolvedValueOnce("new-refresh-token");

      const result = await authService.refreshToken("valid-token");

      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
    });
  });

  describe("validateToken", () => {
    it("should throw UnauthorizedException if token is invalid", async () => {
      mockJwtService.verify = vi.fn().mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(authService.validateToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user does not exist", async () => {
      mockJwtService.verify = vi.fn().mockReturnValue({
        userId: "user-123",
        email: "test@example.com",
        username: "testuser",
      });
      mockUserRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(authService.validateToken("valid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should return user info on valid token", async () => {
      const mockDomainUser = User.create({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });

      mockJwtService.verify = vi.fn().mockReturnValue({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      mockUserRepository.findById = vi.fn().mockResolvedValue(mockDomainUser);

      const result = await authService.validateToken("valid-token");

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });
  });

  describe("hashPassword", () => {
    it("should hash the password", async () => {
      const password = "testPassword123";
      const hashedPassword = await authService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith("$2")).toBe(true);
    });

    it("should generate different hashes for same password", async () => {
      const password = "testPassword123";
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching passwords", async () => {
      const password = "testPassword123";
      const hashedPassword = await authService.hashPassword(password);

      const result = await authService.comparePassword(
        password,
        hashedPassword,
      );

      expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hashedPassword = await authService.hashPassword(password);

      const result = await authService.comparePassword(
        wrongPassword,
        hashedPassword,
      );

      expect(result).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle registration with empty optional phone", async () => {
      const registerData = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      };

      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.create = vi.fn().mockResolvedValue({
        ...mockUser,
        phone: null,
      });
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      const result = await authService.register(registerData);

      expect(result.user.phone).toBeUndefined();
    });

    it("should handle tokens expiration parsing correctly", async () => {
      const registerData = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      };
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.create = vi.fn().mockResolvedValue(mockUser);
      mockElasticsearch.indexUser = vi.fn().mockResolvedValue(undefined);
      mockJwtService.signAsync = vi
        .fn()
        .mockResolvedValueOnce("mock-access-token")
        .mockResolvedValueOnce("mock-refresh-token");

      const result = await authService.register(registerData);

      expect(result.tokens.expiresIn).toBe(900);
    });
  });
});
