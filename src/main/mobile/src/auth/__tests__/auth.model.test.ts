import { AuthUser } from "../auth.model";

describe("AuthUser", () => {
  describe("interface structure", () => {
    it("should have all required properties", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
      expect(user.username).toBe("testuser");
    });

    it("should have all optional properties", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "Online",
      };
      expect(user.phone).toBe("+1234567890");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.status).toBe("Online");
    });
  });

  describe("required properties", () => {
    it("should require id property", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.id).toBeDefined();
    });

    it("should require email property", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.email).toBeDefined();
    });

    it("should require username property", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.username).toBeDefined();
    });
  });

  describe("optional properties", () => {
    it("should allow undefined phone", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.phone).toBeUndefined();
    });

    it("should allow undefined avatar", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.avatar).toBeUndefined();
    });

    it("should allow undefined status", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.status).toBeUndefined();
    });
  });

  describe("property types", () => {
    it("should accept string id", () => {
      const user: AuthUser = {
        id: "abc123-def456",
        email: "test@example.com",
        username: "testuser",
      };
      expect(user.id).toBe("abc123-def456");
    });

    it("should accept valid email format", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "user.name+tag@example.co.uk",
        username: "testuser",
      };
      expect(user.email).toBe("user.name+tag@example.co.uk");
    });

    it("should accept phone with country code", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        phone: "+86-138-0000-0000",
      };
      expect(user.phone).toBe("+86-138-0000-0000");
    });

    it("should accept avatar URL", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        avatar: "https://storage.example.com/avatars/user123.jpg",
      };
      expect(user.avatar).toBe(
        "https://storage.example.com/avatars/user123.jpg",
      );
    });

    it("should accept status message", () => {
      const user: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        status: "Hey there! I am using WhatsFeed.",
      };
      expect(user.status).toBe("Hey there! I am using WhatsFeed.");
    });
  });
});
