import { describe, it, expect } from "vitest";
import { mapUnknownToUser } from "@/profile/users.service";

describe("users.mapper", () => {
  describe("mapUnknownToUser", () => {
    it("should map unknown data to User entity", () => {
      const unknownData = {
        id: "user-123",
        username: "johndoe",
        email: "john@example.com",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "online",
        name: "John Doe",
        about: "Hello world",
        isOnline: true,
        lastSeen: new Date("2024-01-15T10:30:00Z"),
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z"),
      };

      const user = mapUnknownToUser(unknownData);

      expect(user.id).toBe("user-123");
      expect(user.username).toBe("johndoe");
      expect(user.email).toBe("john@example.com");
      expect(user.phone).toBe("+1234567890");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.status).toBe("online");
      expect(user.name).toBe("John Doe");
      expect(user.about).toBe("Hello world");
      expect(user.isOnline).toBe(true);
    });

    it("should handle minimal user data", () => {
      const minimalData = {
        id: "user-456",
        username: "janedoe",
        email: "jane@example.com",
      };

      const user = mapUnknownToUser(minimalData);

      expect(user.id).toBe("user-456");
      expect(user.username).toBe("janedoe");
      expect(user.email).toBe("jane@example.com");
      expect(user.isOnline).toBe(false);
    });

    it("should handle string lastSeen", () => {
      const dataWithStringLastSeen = {
        id: "user-789",
        username: "testuser",
        email: "test@example.com",
        lastSeen: "2024-01-15T10:30:00Z",
      };

      const user = mapUnknownToUser(dataWithStringLastSeen);

      expect(user.lastSeen).toBe("2024-01-15T10:30:00Z");
    });

    it("should use default isOnline value when not provided", () => {
      const dataWithoutIsOnline = {
        id: "user-no-online",
        username: "testuser",
        email: "test@example.com",
      };

      const user = mapUnknownToUser(dataWithoutIsOnline);

      expect(user.isOnline).toBe(false);
    });
  });
});
