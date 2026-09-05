import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "@/auth/controller/auth.controller";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { User } from "@/users/domain/model/user";

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockUsersService: any;

  const mockUser = User.create({
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    phone: "+1234567890",
    avatar: null,
    status: "online",
    isOnline: true,
  });

  const mockTokens = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
  };

  beforeEach(() => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      refreshToken: vi.fn(),
    };

    mockUsersService = {
      updateUser: vi.fn(),
    };

    authController = new AuthController(mockAuthService, mockUsersService);
  });

  describe("register", () => {
    const registerDto = {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      phone: "+1234567890",
    };

    it("should register a new user and return success response", async () => {
      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      const result = await authController.register(registerDto);

      expect(result).toEqual({
        success: true,
        message: "用户注册成功",
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            phone: mockUser.phone,
            avatar: mockUser.avatar,
            status: mockUser.status,
          },
          token: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
        },
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it("should throw ConflictException if user already exists", async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException("User already exists"),
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should login user and return success response", async () => {
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      const result = await authController.login(loginDto);

      expect(result).toEqual({
        success: true,
        message: "登录成功",
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            phone: mockUser.phone,
            avatar: mockUser.avatar,
            status: mockUser.status,
          },
          token: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
        },
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException("Invalid email or password"),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("refreshToken", () => {
    const refreshTokenDto = {
      refreshToken: "valid-refresh-token",
    };

    it("should refresh tokens and return new tokens", async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresIn: 900,
      });

      const result = await authController.refreshToken(refreshTokenDto);

      expect(result).toEqual({
        success: true,
        message: "Token刷新成功",
        data: {
          token: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      });
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException("Invalid refresh token"),
      );

      await expect(
        authController.refreshToken(refreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should return success response", async () => {
      const result = await authController.logout();

      expect(result).toEqual({
        success: true,
        message: "退出登录成功",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user info", async () => {
      const mockCurrentUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };

      const result = await authController.getCurrentUser(mockCurrentUser);

      expect(result).toEqual({
        success: true,
        message: "获取用户信息成功",
        data: {
          user: mockCurrentUser,
        },
      });
    });
  });

  describe("updateProfile", () => {
    const currentUser = { id: "user-123", email: "test@example.com" };
    const updateProfileDto = {
      username: "newusername",
      phone: "+9876543210",
      status: "away",
      avatar: "https://example.com/avatar.jpg",
    };

    it("should update user profile and return success response", async () => {
      const updatedUser = User.create({
        ...updateProfileDto,
        id: currentUser.id,
        email: currentUser.email,
      });

      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      const result = await authController.updateProfile(
        currentUser,
        updateProfileDto,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("更新用户资料成功");
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(currentUser.id, {
        username: updateProfileDto.username,
        phone: updateProfileDto.phone,
        status: updateProfileDto.status,
        avatar: updateProfileDto.avatar,
      });
    });

    it("should only include defined fields in update", async () => {
      const partialUpdateDto = {
        username: "newusername",
      };

      mockUsersService.updateUser.mockResolvedValue(mockUser);

      await authController.updateProfile(currentUser, partialUpdateDto);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(currentUser.id, {
        username: partialUpdateDto.username,
      });
    });
  });

  describe("changePassword", () => {
    it("should return NOT_IMPLEMENTED response", async () => {
      const result = await authController.changePassword(
        { id: "user-123" },
        {
          currentPassword: "oldpassword",
          newPassword: "newpassword123",
        },
      );

      expect(result).toEqual({
        success: false,
        message: "未实现",
        code: "NOT_IMPLEMENTED",
      });
    });
  });

  describe("forgotPassword", () => {
    it("should return NOT_IMPLEMENTED response", async () => {
      const result = await authController.forgotPassword({
        email: "test@example.com",
      });

      expect(result).toEqual({
        success: false,
        message: "未实现",
        code: "NOT_IMPLEMENTED",
      });
    });
  });

  describe("resetPassword", () => {
    it("should return NOT_IMPLEMENTED response", async () => {
      const result = await authController.resetPassword({
        token: "reset-token",
        newPassword: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        message: "未实现",
        code: "NOT_IMPLEMENTED",
      });
    });
  });
});
