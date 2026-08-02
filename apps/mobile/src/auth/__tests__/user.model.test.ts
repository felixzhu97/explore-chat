import { UserEntity } from "../user.model";

describe("UserEntity", () => {
  const createValidUserData = (overrides = {}) => ({
    id: "user-1",
    name: "John Doe",
    phoneNumber: "+1234567890",
    profilePicture: "https://example.com/avatar.jpg",
    about: "Hello there!",
    lastSeen: new Date("2024-06-15T12:00:00Z"),
    isOnline: true,
    isTyping: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-06-15T12:00:00Z"),
    ...overrides,
  });

  describe("constructor", () => {
    it("should create UserEntity with all properties", () => {
      const data = createValidUserData();
      const entity = new UserEntity(data);

      expect(entity.id).toBe("user-1");
      expect(entity.name).toBe("John Doe");
      expect(entity.phoneNumber).toBe("+1234567890");
      expect(entity.profilePicture).toBe("https://example.com/avatar.jpg");
      expect(entity.about).toBe("Hello there!");
      expect(entity.lastSeen).toBeInstanceOf(Date);
      expect(entity.isOnline).toBe(true);
      expect(entity.isTyping).toBe(true);
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it("should default about when undefined", () => {
      const data = createValidUserData({ about: undefined });
      const entity = new UserEntity(data);

      expect(entity.about).toBe("嗨，我正在使用 WhatsChat！");
    });

    it("should default isOnline to false when undefined", () => {
      const data = createValidUserData({ isOnline: undefined });
      const entity = new UserEntity(data);

      expect(entity.isOnline).toBe(false);
    });

    it("should default isTyping to false when undefined", () => {
      const data = createValidUserData({ isTyping: undefined });
      const entity = new UserEntity(data);

      expect(entity.isTyping).toBe(false);
    });
  });

  describe("copyWith", () => {
    it("should create a copy with updated properties", () => {
      const original = new UserEntity(createValidUserData());
      const updated = original.copyWith({ name: "Jane Doe", isOnline: false });

      expect(updated.name).toBe("Jane Doe");
      expect(updated.isOnline).toBe(false);
      expect(updated.id).toBe(original.id);
      expect(updated.phoneNumber).toBe(original.phoneNumber);
    });

    it("should preserve original values when updates are undefined", () => {
      const original = new UserEntity(
        createValidUserData({ name: "Original" }),
      );
      const copy = original.copyWith({});

      expect(copy.name).toBe("Original");
    });

    it("should create a new instance", () => {
      const original = new UserEntity(createValidUserData());
      const copy = original.copyWith({ name: "New Name" });

      expect(copy).not.toBe(original);
    });
  });

  describe("toMap", () => {
    it("should convert entity to map with timestamp as milliseconds", () => {
      const entity = new UserEntity(createValidUserData());
      const map = entity.toMap();

      expect(map.id).toBe("user-1");
      expect(map.name).toBe("John Doe");
      expect(map.phoneNumber).toBe("+1234567890");
      expect(map.profilePicture).toBe("https://example.com/avatar.jpg");
      expect(map.about).toBe("Hello there!");
      expect(map.lastSeen).toBe(1718452800000);
      expect(map.isOnline).toBe(true);
      expect(map.isTyping).toBe(true);
      expect(map.createdAt).toBe(1704067200000);
      expect(map.updatedAt).toBe(1718452800000);
    });

    it("should handle undefined optional fields", () => {
      const data = createValidUserData({
        profilePicture: undefined,
        lastSeen: undefined,
      });
      const entity = new UserEntity(data);
      const map = entity.toMap();

      expect(map.profilePicture).toBeUndefined();
      expect(map.lastSeen).toBeUndefined();
    });
  });

  describe("fromMap", () => {
    it("should create entity from map", () => {
      const map = {
        id: "user-map-1",
        name: "Map User",
        phoneNumber: "+9876543210",
        profilePicture: "https://example.com/map-avatar.jpg",
        about: "Map user about",
        lastSeen: 1718452800000,
        isOnline: true,
        isTyping: false,
        createdAt: 1704067200000,
        updatedAt: 1718452800000,
      };

      const entity = UserEntity.fromMap(map);

      expect(entity.id).toBe("user-map-1");
      expect(entity.name).toBe("Map User");
      expect(entity.phoneNumber).toBe("+9876543210");
      expect(entity.profilePicture).toBe("https://example.com/map-avatar.jpg");
      expect(entity.about).toBe("Map user about");
      expect(entity.lastSeen).toBeInstanceOf(Date);
      expect(entity.isOnline).toBe(true);
      expect(entity.isTyping).toBe(false);
    });

    it("should default to empty string for missing id", () => {
      const map = {
        name: "Name",
        phoneNumber: "+1234567890",
        createdAt: 1704067200000,
        updatedAt: 1718452800000,
      };

      const entity = UserEntity.fromMap(map);

      expect(entity.id).toBe("");
    });

    it("should default to empty string for missing name", () => {
      const map = {
        id: "user-1",
        phoneNumber: "+1234567890",
        createdAt: 1704067200000,
        updatedAt: 1718452800000,
      };

      const entity = UserEntity.fromMap(map);

      expect(entity.name).toBe("");
    });

    it("should default to false for missing isOnline", () => {
      const map = {
        id: "user-1",
        name: "Name",
        phoneNumber: "+1234567890",
        createdAt: 1704067200000,
        updatedAt: 1718452800000,
      };

      const entity = UserEntity.fromMap(map);

      expect(entity.isOnline).toBe(false);
    });

    it("should default to false for missing isTyping", () => {
      const map = {
        id: "user-1",
        name: "Name",
        phoneNumber: "+1234567890",
        createdAt: 1704067200000,
        updatedAt: 1718452800000,
      };

      const entity = UserEntity.fromMap(map);

      expect(entity.isTyping).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return formatted string", () => {
      const entity = new UserEntity(createValidUserData());
      const str = entity.toString();

      expect(str).toContain("user-1");
      expect(str).toContain("John Doe");
      expect(str).toContain("+1234567890");
      expect(str).toContain("true");
    });
  });

  describe("equals", () => {
    it("should return true for same id", () => {
      const entity = new UserEntity(createValidUserData({ id: "same-id" }));
      const other = createValidUserData({ id: "same-id" });

      expect(entity.equals(other)).toBe(true);
    });

    it("should return false for different id", () => {
      const entity = new UserEntity(createValidUserData({ id: "id-1" }));
      const other = createValidUserData({ id: "id-2" });

      expect(entity.equals(other)).toBe(false);
    });
  });
});
