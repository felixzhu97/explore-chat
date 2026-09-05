import { describe, it, expect } from "vitest";
import type { User } from "../user";

describe("User Types", () => {
  // ============================================================
  // User - Test the User interface
  // ============================================================
  describe("User", () => {
    describe("when creating a user with required fields only", () => {
      it("should create a valid user with required fields", () => {
        const user: User = {
          id: "user-1",
          isOnline: true,
        };

        expect(user.id).toBe("user-1");
        expect(user.isOnline).toBe(true);
      });

      it("should have id as required field", () => {
        const user: User = {
          id: "user-123",
          isOnline: false,
        };

        expect(user.id).toBe("user-123");
      });

      it("should have isOnline as required field", () => {
        const onlineUser: User = {
          id: "user-1",
          isOnline: true,
        };

        const offlineUser: User = {
          id: "user-2",
          isOnline: false,
        };

        expect(onlineUser.isOnline).toBe(true);
        expect(offlineUser.isOnline).toBe(false);
      });
    });

    describe("when creating a full user profile", () => {
      it("should create a user with all optional fields", () => {
        const user: User = {
          id: "user-1",
          username: "johndoe",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          phoneNumber: "+1234567890",
          avatar: "https://example.com/avatar.jpg",
          profilePicture: "https://example.com/profile.jpg",
          status: "Hey there!",
          about: "Just a regular person",
          isOnline: true,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        expect(user.username).toBe("johndoe");
        expect(user.email).toBe("john@example.com");
        expect(user.phone).toBe("+1234567890");
        expect(user.status).toBe("Hey there!");
      });

      it("should support both username and name fields", () => {
        const user: User = {
          id: "user-1",
          username: "johndoe",
          name: "John Doe",
          isOnline: true,
        };

        expect(user.username).toBe("johndoe");
        expect(user.name).toBe("John Doe");
      });

      it("should support both phone and phoneNumber fields", () => {
        const user: User = {
          id: "user-1",
          phone: "+1234567890",
          phoneNumber: "+1234567890",
          isOnline: true,
        };

        expect(user.phone).toBe("+1234567890");
        expect(user.phoneNumber).toBe("+1234567890");
      });

      it("should support both avatar and profilePicture fields", () => {
        const user: User = {
          id: "user-1",
          avatar: "https://example.com/avatar.jpg",
          profilePicture: "https://example.com/profile.jpg",
          isOnline: true,
        };

        expect(user.avatar).toBe("https://example.com/avatar.jpg");
        expect(user.profilePicture).toBe("https://example.com/profile.jpg");
      });
    });

    describe("when handling online status", () => {
      it("should indicate online status", () => {
        const onlineUser: User = {
          id: "user-1",
          isOnline: true,
          lastSeen: new Date().toISOString(),
        };

        expect(onlineUser.isOnline).toBe(true);
      });

      it("should indicate offline status", () => {
        const offlineUser: User = {
          id: "user-2",
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
        };

        expect(offlineUser.isOnline).toBe(false);
      });

      it("should track last seen time for offline users", () => {
        const lastSeenTime = new Date(Date.now() - 3600000).toISOString();
        const offlineUser: User = {
          id: "user-1",
          isOnline: false,
          lastSeen: lastSeenTime,
        };

        expect(offlineUser.lastSeen).toBe(lastSeenTime);
      });

      it("should track last seen time for online users", () => {
        const now = new Date().toISOString();
        const onlineUser: User = {
          id: "user-1",
          isOnline: true,
          lastSeen: now,
        };

        expect(onlineUser.lastSeen).toBe(now);
      });
    });

    describe("when handling avatar variations", () => {
      it("should support avatar field", () => {
        const userWithAvatar: User = {
          id: "user-1",
          isOnline: true,
          avatar: "https://example.com/avatar.jpg",
        };

        expect(userWithAvatar.avatar).toBeDefined();
        expect(userWithAvatar.avatar).toContain("avatar.jpg");
      });

      it("should support profilePicture field", () => {
        const userWithProfilePicture: User = {
          id: "user-2",
          isOnline: true,
          profilePicture: "https://example.com/profile.jpg",
        };

        expect(userWithProfilePicture.profilePicture).toBeDefined();
        expect(userWithProfilePicture.profilePicture).toContain("profile.jpg");
      });

      it("should support both avatar and profilePicture", () => {
        const user: User = {
          id: "user-1",
          isOnline: true,
          avatar: "https://example.com/avatar.jpg",
          profilePicture: "https://example.com/profile.jpg",
        };

        expect(user.avatar).toBeDefined();
        expect(user.profilePicture).toBeDefined();
      });

      it("should support users without avatar", () => {
        const userWithoutAvatar: User = {
          id: "user-1",
          isOnline: true,
        };

        expect(userWithoutAvatar.avatar).toBeUndefined();
        expect(userWithoutAvatar.profilePicture).toBeUndefined();
      });
    });

    describe("when handling timestamps", () => {
      it("should support ISO string timestamps", () => {
        const now = new Date().toISOString();
        const user: User = {
          id: "user-1",
          isOnline: true,
          createdAt: now,
          updatedAt: now,
          lastSeen: now,
        };

        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
        expect(user.lastSeen).toBeDefined();
      });

      it("should support Date object timestamps", () => {
        const createdAt = new Date("2024-01-01T10:00:00Z");
        const updatedAt = new Date("2024-01-15T10:00:00Z");
        const user: User = {
          id: "user-1",
          isOnline: true,
          createdAt,
          updatedAt,
        };

        expect(user.createdAt).toEqual(createdAt);
        expect(user.updatedAt).toEqual(updatedAt);
      });

      it("should support partial timestamps", () => {
        const user: User = {
          id: "user-1",
          isOnline: true,
          createdAt: new Date().toISOString(),
        };

        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeUndefined();
      });
    });

    describe("when handling user identity fields", () => {
      it("should support username field", () => {
        const user: User = {
          id: "user-1",
          username: "johndoe",
          isOnline: true,
        };

        expect(user.username).toBe("johndoe");
      });

      it("should support name field", () => {
        const user: User = {
          id: "user-1",
          name: "John Doe",
          isOnline: true,
        };

        expect(user.name).toBe("John Doe");
      });

      it("should support email field", () => {
        const user: User = {
          id: "user-1",
          email: "john@example.com",
          isOnline: true,
        };

        expect(user.email).toBe("john@example.com");
      });

      it("should support phone field", () => {
        const user: User = {
          id: "user-1",
          phone: "+1234567890",
          isOnline: true,
        };

        expect(user.phone).toBe("+1234567890");
      });
    });

    describe("when handling user status and about", () => {
      it("should support status field", () => {
        const user: User = {
          id: "user-1",
          status: "Hey there! I'm using Chat",
          isOnline: true,
        };

        expect(user.status).toContain("Chat");
      });

      it("should support about field", () => {
        const user: User = {
          id: "user-1",
          about: "Software developer from San Francisco",
          isOnline: true,
        };

        expect(user.about).toContain("Software developer");
      });

      it("should support both status and about", () => {
        const user: User = {
          id: "user-1",
          status: "Available",
          about: "Always learning",
          isOnline: true,
        };

        expect(user.status).toBe("Available");
        expect(user.about).toBe("Always learning");
      });

      it("should support empty status", () => {
        const user: User = {
          id: "user-1",
          status: "",
          isOnline: true,
        };

        expect(user.status).toBe("");
      });
    });

    describe("edge cases", () => {
      it("should handle user with no optional fields", () => {
        const user: User = {
          id: "user-1",
          isOnline: false,
        };

        expect(user.id).toBe("user-1");
        expect(user.username).toBeUndefined();
        expect(user.name).toBeUndefined();
        expect(user.email).toBeUndefined();
      });

      it("should handle user with Unicode characters", () => {
        const user: User = {
          id: "user-1",
          name: "张伟 🇨🇳",
          username: "zhangwei",
          isOnline: true,
        };

        expect(user.name).toContain("张伟");
        expect(user.name).toContain("🇨🇳");
      });

      it("should handle user with very long about text", () => {
        const longAbout = "a".repeat(500);
        const user: User = {
          id: "user-1",
          about: longAbout,
          isOnline: true,
        };

        expect(user.about).toHaveLength(500);
      });

      it("should handle user with international phone number", () => {
        const user: User = {
          id: "user-1",
          phone: "+86-138-0000-0000",
          phoneNumber: "+86-138-0000-0000",
          isOnline: true,
        };

        expect(user.phone).toContain("+86");
      });

      it("should handle user with email containing special characters", () => {
        const user: User = {
          id: "user-1",
          email: "john.doe+tag@example.com",
          isOnline: true,
        };

        expect(user.email).toContain("+");
        expect(user.email).toContain("@");
      });

      it("should handle user with various username formats", () => {
        const usernames = ["john", "john_doe", "john.doe", "john123", "JOHN"];

        usernames.forEach((username) => {
          const user: User = {
            id: "user-1",
            username,
            isOnline: true,
          };
          expect(user.username).toBe(username);
        });
      });

      it("should handle user with different avatar URL formats", () => {
        const user: User = {
          id: "user-1",
          avatar: "https://example.com/avatars/user-1.jpg?v=123",
          profilePicture: "https://cdn.example.com/pp/user-1.png",
          isOnline: true,
        };

        expect(user.avatar).toContain("?v=");
        expect(user.profilePicture).toContain("cdn.");
      });

      it("should preserve immutability concept", () => {
        const originalUser: User = {
          id: "user-1",
          name: "Original Name",
          isOnline: true,
        };

        const modifiedUser: User = {
          ...originalUser,
          name: "Modified Name",
          isOnline: false,
        };

        expect(originalUser.name).toBe("Original Name");
        expect(originalUser.isOnline).toBe(true);
        expect(modifiedUser.name).toBe("Modified Name");
        expect(modifiedUser.isOnline).toBe(false);
      });

      it("should handle user with all timestamps", () => {
        const createdAt = new Date("2024-01-01T10:00:00Z");
        const updatedAt = new Date("2024-06-01T10:00:00Z");
        const lastSeen = new Date("2024-06-10T15:30:00Z");

        const user: User = {
          id: "user-1",
          isOnline: true,
          createdAt,
          updatedAt,
          lastSeen,
        };

        expect(user.createdAt).toEqual(createdAt);
        expect(user.updatedAt).toEqual(updatedAt);
        expect(user.lastSeen).toEqual(lastSeen);
      });

      it("should handle user recently seen", () => {
        const recentLastSeen = new Date(Date.now() - 60000).toISOString();
        const user: User = {
          id: "user-1",
          isOnline: false,
          lastSeen: recentLastSeen,
        };

        const lastSeenTime = new Date(user.lastSeen as string).getTime();
        expect(Date.now() - lastSeenTime).toBeLessThan(120000);
      });

      it("should handle user seen long ago", () => {
        const oldLastSeen = new Date(Date.now() - 86400000 * 30).toISOString();
        const user: User = {
          id: "user-1",
          isOnline: false,
          lastSeen: oldLastSeen,
        };

        const lastSeenTime = new Date(user.lastSeen as string).getTime();
        expect(Date.now() - lastSeenTime).toBeGreaterThan(86400000 * 7);
      });
    });
  });
});
