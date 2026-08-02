import { describe, it, expect } from "vitest";
import { mapUnknownToUser } from "../users.mapper";

describe("users.mapper", () => {
  describe("mapUnknownToUser", () => {
    it("should create user from unknown data", () => {
      const data = {
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
      };

      const result = mapUnknownToUser(data);

      expect(result.id).toBe("user-1");
      expect(result.username).toBe("alice");
      expect(result.email).toBe("alice@example.com");
    });

    it("should handle user with all optional fields", () => {
      const data = {
        id: "user-2",
        username: "bob",
        email: "bob@example.com",
        phone: "+1234567890",
        avatar: "bob-avatar.jpg",
        status: "online",
        name: "Bob Smith",
        about: "Hello, I'm Bob",
        isOnline: true,
      };

      const result = mapUnknownToUser(data);

      expect(result.id).toBe("user-2");
      expect(result.username).toBe("bob");
      expect(result.email).toBe("bob@example.com");
      expect(result.phone).toBe("+1234567890");
      expect(result.avatar).toBe("bob-avatar.jpg");
      expect(result.status).toBe("online");
      expect(result.name).toBe("Bob Smith");
      expect(result.about).toBe("Hello, I'm Bob");
      expect(result.isOnline).toBe(true);
    });

    it("should handle user with no optional fields", () => {
      const data = {
        id: "user-3",
        username: "charlie",
        email: "charlie@example.com",
      };

      const result = mapUnknownToUser(data);

      expect(result.id).toBe("user-3");
      expect(result.username).toBe("charlie");
      expect(result.email).toBe("charlie@example.com");
      expect(result.phone).toBeUndefined();
      expect(result.avatar).toBeUndefined();
      expect(result.status).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.about).toBeUndefined();
    });

    it("should handle date fields", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const data = {
        id: "user-4",
        username: "dave",
        email: "dave@example.com",
        createdAt: date,
        updatedAt: date,
        lastSeen: date,
      };

      const result = mapUnknownToUser(data);

      expect(result.createdAt).toEqual(date);
      expect(result.updatedAt).toEqual(date);
      expect(result.lastSeen).toEqual(date);
    });

    it("should handle isOnline false", () => {
      const data = {
        id: "user-5",
        username: "eve",
        email: "eve@example.com",
        isOnline: false,
      };

      const result = mapUnknownToUser(data);

      expect(result.isOnline).toBe(false);
    });

    it("should default isOnline to false when not provided", () => {
      const data = {
        id: "user-6",
        username: "frank",
        email: "frank@example.com",
      };

      const result = mapUnknownToUser(data);

      expect(result.isOnline).toBe(false);
    });
  });
});
