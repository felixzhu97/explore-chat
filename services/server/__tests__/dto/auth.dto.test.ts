import { describe, it, expect } from "vitest";
import { plainToInstance } from "class-transformer";
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
} from "@/auth/controller/auth-request";

describe("Auth DTOs", () => {
  describe("RegisterRequest", () => {
    it("should pass validation with valid data", () => {
      const dto = plainToInstance(RegisterRequest, {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        phone: "+1234567890",
      });

      expect(dto.email).toBe("test@example.com");
      expect(dto.password).toBe("password123");
      expect(dto.username).toBe("testuser");
      expect(dto.phone).toBe("+1234567890");
    });

    it("should pass validation without optional phone", () => {
      const dto = plainToInstance(RegisterRequest, {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });

      expect(dto.email).toBe("test@example.com");
      expect(dto.phone).toBeUndefined();
    });

    it("should reject invalid email format", () => {
      const dto = plainToInstance(RegisterRequest, {
        email: "invalid-email",
        password: "password123",
        username: "testuser",
      });

      expect(dto.email).toBe("invalid-email");
    });

    it("should accept password with minimum 6 characters", () => {
      const dto = plainToInstance(RegisterRequest, {
        email: "test@example.com",
        password: "123456",
        username: "testuser",
      });

      expect(dto.password).toBe("123456");
    });

    it("should reject username with less than 2 characters", () => {
      const dto = plainToInstance(RegisterRequest, {
        email: "test@example.com",
        password: "password123",
        username: "a",
      });

      expect(dto.username).toBe("a");
    });

    it("should validate Chinese phone numbers", () => {
      const dto = plainToInstance(RegisterRequest, {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        phone: "13812345678",
      });

      expect(dto.phone).toBe("13812345678");
    });
  });

  describe("LoginRequest", () => {
    it("should pass validation with valid data", () => {
      const dto = plainToInstance(LoginRequest, {
        email: "test@example.com",
        password: "password123",
      });

      expect(dto.email).toBe("test@example.com");
      expect(dto.password).toBe("password123");
    });

    it("should reject missing email", () => {
      const dto = plainToInstance(LoginRequest, {
        password: "password123",
      });

      expect(dto.email).toBeUndefined();
    });
  });

  describe("RefreshTokenRequest", () => {
    it("should pass validation with valid token", () => {
      const dto = plainToInstance(RefreshTokenRequest, {
        refreshToken: "valid-token-string",
      });

      expect(dto.refreshToken).toBe("valid-token-string");
    });
  });

  describe("UpdateProfileRequest", () => {
    it("should pass validation with all fields", () => {
      const dto = plainToInstance(UpdateProfileRequest, {
        username: "newname",
        phone: "13812345678",
        status: "online",
        avatar: "https://example.com/avatar.jpg",
      });

      expect(dto.username).toBe("newname");
      expect(dto.phone).toBe("13812345678");
      expect(dto.status).toBe("online");
      expect(dto.avatar).toBe("https://example.com/avatar.jpg");
    });

    it("should pass validation with partial fields", () => {
      const dto = plainToInstance(UpdateProfileRequest, {
        status: "away",
      });

      expect(dto.username).toBeUndefined();
      expect(dto.status).toBe("away");
    });
  });
});
