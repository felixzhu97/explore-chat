import { describe, it, expect } from "vitest";
import { User } from "@/users/domain/user.entity";

describe("User Entity", () => {
  describe("constructor", () => {
    it("should create a user with all required fields", () => {
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        "+1234567890",
        "https://example.com/avatar.jpg",
        "online",
        true,
        new Date("2024-01-01"),
        new Date("2024-01-01"),
        new Date("2024-01-01"),
      );

      expect(user.id).toBe("user-1");
      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.phone).toBe("+1234567890");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.status).toBe("online");
      expect(user.isOnline).toBe(true);
    });

    it("should use default values for optional fields", () => {
      const user = new User("user-1", "testuser", "test@example.com");

      expect(user.isOnline).toBe(false);
      expect(user.lastSeen).toBeInstanceOf(Date);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should allow optional fields to be undefined", () => {
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        undefined,
        false,
      );

      expect(user.phone).toBeUndefined();
      expect(user.avatar).toBeUndefined();
      expect(user.status).toBeUndefined();
      expect(user.isOnline).toBe(false);
    });
  });

  describe("User.create", () => {
    it("should create a user with provided data", () => {
      const createdAt = new Date("2024-01-01");
      const user = User.create({
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "online",
        isOnline: true,
        lastSeen: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      expect(user.id).toBe("user-1");
      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.phone).toBe("+1234567890");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.status).toBe("online");
      expect(user.isOnline).toBe(true);
      expect(user.lastSeen).toBe(createdAt);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(createdAt);
    });

    it("should use default values when optional fields are not provided", () => {
      const user = User.create({
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      });

      expect(user.isOnline).toBe(false);
      expect(user.lastSeen).toBeInstanceOf(Date);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should set isOnline to false when explicitly false", () => {
      const user = User.create({
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
        isOnline: false,
      });

      expect(user.isOnline).toBe(false);
    });
  });

  describe("updateStatus", () => {
    it("should return a new user with updated status", () => {
      const originalDate = new Date("2024-01-01");
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "offline",
        true,
        originalDate,
        originalDate,
        originalDate,
      );

      const updatedUser = user.updateStatus("online");

      expect(updatedUser.id).toBe("user-1");
      expect(updatedUser.username).toBe("testuser");
      expect(updatedUser.email).toBe("test@example.com");
      expect(updatedUser.status).toBe("online");
      expect(updatedUser.isOnline).toBe(true);
      expect(updatedUser.lastSeen).toBe(originalDate);
    });

    it("should preserve original user unchanged", () => {
      const originalDate = new Date("2024-01-01");
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "offline",
        true,
        originalDate,
        originalDate,
        originalDate,
      );

      const updatedUser = user.updateStatus("online");

      expect(user.status).toBe("offline");
      expect(updatedUser.status).toBe("online");
      expect(user.updatedAt).toBe(originalDate);
      expect(updatedUser.updatedAt).not.toBe(originalDate);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "offline",
        true,
        originalDate,
        originalDate,
        originalDate,
      );

      const beforeUpdate = new Date();
      const updatedUser = user.updateStatus("online");

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });
  });

  describe("setOnline", () => {
    it("should return a new user set to online", () => {
      const originalDate = new Date("2024-01-01");
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "offline",
        false,
        originalDate,
        originalDate,
        originalDate,
      );

      const updatedUser = user.setOnline(true);

      expect(updatedUser.id).toBe("user-1");
      expect(updatedUser.username).toBe("testuser");
      expect(updatedUser.email).toBe("test@example.com");
      expect(updatedUser.isOnline).toBe(true);
      expect(updatedUser.status).toBe("offline");
      expect(updatedUser.lastSeen).not.toBe(originalDate);
    });

    it("should return a new user set to offline", () => {
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "online",
        true,
        new Date(),
        new Date(),
        new Date(),
      );

      const updatedUser = user.setOnline(false);

      expect(updatedUser.isOnline).toBe(false);
      expect(updatedUser.status).toBe("online");
    });

    it("should preserve original user unchanged", () => {
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "online",
        true,
        new Date(),
        new Date(),
        new Date(),
      );

      const updatedUser = user.setOnline(false);

      expect(user.isOnline).toBe(true);
      expect(updatedUser.isOnline).toBe(false);
    });

    it("should update lastSeen and updatedAt timestamps", () => {
      const originalDate = new Date("2024-01-01");
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "offline",
        false,
        originalDate,
        new Date("2024-01-01"),
        new Date("2024-01-01"),
      );

      const beforeUpdate = new Date();
      const updatedUser = user.setOnline(true);

      expect(updatedUser.lastSeen.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should preserve createdAt when setting online status", () => {
      const createdAt = new Date("2024-01-01");
      const user = new User(
        "user-1",
        "testuser",
        "test@example.com",
        undefined,
        undefined,
        "offline",
        false,
        new Date(),
        createdAt,
        new Date("2024-01-01"),
      );

      const updatedUser = user.setOnline(true);

      expect(updatedUser.createdAt).toBe(createdAt);
    });
  });
});
