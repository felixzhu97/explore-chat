import { UserProfile } from "../user-profile.model";

describe("UserProfile", () => {
  describe("interface structure", () => {
    it("should have all optional properties", () => {
      const profile: UserProfile = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: "https://example.com/avatar.jpg",
        status: "Online",
        followersCount: 100,
        followingCount: 50,
      };
      expect(profile.id).toBe("user-123");
      expect(profile.username).toBe("testuser");
    });

    it("should allow empty object", () => {
      const profile: UserProfile = {};
      expect(Object.keys(profile)).toHaveLength(0);
    });
  });

  describe("id property", () => {
    it("should accept string id", () => {
      const profile: UserProfile = { id: "user-456" };
      expect(profile.id).toBe("user-456");
    });

    it("should be optional", () => {
      const profile: UserProfile = { username: "test" };
      expect(profile.id).toBeUndefined();
    });
  });

  describe("username property", () => {
    it("should accept string username", () => {
      const profile: UserProfile = { username: "johndoe" };
      expect(profile.username).toBe("johndoe");
    });

    it("should be optional", () => {
      const profile: UserProfile = { id: "user-123" };
      expect(profile.username).toBeUndefined();
    });
  });

  describe("email property", () => {
    it("should accept string email", () => {
      const profile: UserProfile = { email: "user@example.com" };
      expect(profile.email).toBe("user@example.com");
    });

    it("should be optional", () => {
      const profile: UserProfile = {};
      expect(profile.email).toBeUndefined();
    });
  });

  describe("avatar property", () => {
    it("should accept string avatar URL", () => {
      const profile: UserProfile = { avatar: "https://example.com/avatar.jpg" };
      expect(profile.avatar).toBe("https://example.com/avatar.jpg");
    });

    it("should accept null avatar", () => {
      const profile: UserProfile = { avatar: null };
      expect(profile.avatar).toBeNull();
    });

    it("should be optional", () => {
      const profile: UserProfile = {};
      expect(profile.avatar).toBeUndefined();
    });
  });

  describe("status property", () => {
    it("should accept string status", () => {
      const profile: UserProfile = { status: "Hey there!" };
      expect(profile.status).toBe("Hey there!");
    });

    it("should accept null status", () => {
      const profile: UserProfile = { status: null };
      expect(profile.status).toBeNull();
    });

    it("should be optional", () => {
      const profile: UserProfile = {};
      expect(profile.status).toBeUndefined();
    });
  });

  describe("followersCount property", () => {
    it("should accept number", () => {
      const profile: UserProfile = { followersCount: 1000 };
      expect(profile.followersCount).toBe(1000);
    });

    it("should accept zero", () => {
      const profile: UserProfile = { followersCount: 0 };
      expect(profile.followersCount).toBe(0);
    });

    it("should be optional", () => {
      const profile: UserProfile = {};
      expect(profile.followersCount).toBeUndefined();
    });
  });

  describe("followingCount property", () => {
    it("should accept number", () => {
      const profile: UserProfile = { followingCount: 500 };
      expect(profile.followingCount).toBe(500);
    });

    it("should accept zero", () => {
      const profile: UserProfile = { followingCount: 0 };
      expect(profile.followingCount).toBe(0);
    });

    it("should be optional", () => {
      const profile: UserProfile = {};
      expect(profile.followingCount).toBeUndefined();
    });
  });

  describe("combined usage", () => {
    it("should support all properties together", () => {
      const profile: UserProfile = {
        id: "user-789",
        username: "testuser",
        email: "test@example.com",
        avatar: "https://example.com/avatar.jpg",
        status: "Busy",
        followersCount: 1000,
        followingCount: 200,
      };
      expect(profile.id).toBe("user-789");
      expect(profile.username).toBe("testuser");
      expect(profile.email).toBe("test@example.com");
      expect(profile.avatar).toBe("https://example.com/avatar.jpg");
      expect(profile.status).toBe("Busy");
      expect(profile.followersCount).toBe(1000);
      expect(profile.followingCount).toBe(200);
    });
  });
});
