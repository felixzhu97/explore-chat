import { describe, it, expect } from "vitest";
import { mapUser, mergeUserProfile } from "../user.model";

describe("mapUser", () => {
  it("should_mapRequiredFields_when_minimalInput", () => {
    const user = mapUser({
      id: "user-1",
      username: "johndoe",
      email: "john@example.com",
    });

    expect(user.id).toBe("user-1");
    expect(user.username).toBe("johndoe");
    expect(user.email).toBe("john@example.com");
    expect(user.isOnline).toBe(false);
    expect(user.lastSeen).toBeInstanceOf(Date);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("should_preserveOptionalFields_when_provided", () => {
    const user = mapUser({
      id: "user-2",
      username: "janedoe",
      email: "jane@example.com",
      phone: "+1234567890",
      avatar: "https://example.com/avatar.jpg",
      status: "online",
      name: "Jane Doe",
      about: "Hello world",
      isOnline: true,
      lastSeen: "2024-01-15T10:30:00Z",
    });

    expect(user.phone).toBe("+1234567890");
    expect(user.avatar).toBe("https://example.com/avatar.jpg");
    expect(user.status).toBe("online");
    expect(user.name).toBe("Jane Doe");
    expect(user.about).toBe("Hello world");
    expect(user.isOnline).toBe(true);
    expect(user.lastSeen).toBe("2024-01-15T10:30:00Z");
  });
});

describe("mergeUserProfile", () => {
  it("should_mergeUpdates_when_profileFieldsChange", () => {
    const user = mapUser({
      id: "user-1",
      username: "johndoe",
      email: "john@example.com",
      name: "John Doe",
      avatar: "https://old.com/avatar.jpg",
    });

    const updated = mergeUserProfile(user, {
      name: "John Smith",
      avatar: "https://new.com/avatar.jpg",
    });

    expect(updated.name).toBe("John Smith");
    expect(updated.avatar).toBe("https://new.com/avatar.jpg");
    expect(updated.username).toBe("johndoe");
    expect(updated.email).toBe("john@example.com");
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it("should_returnNewObject_when_merging", () => {
    const user = mapUser({
      id: "user-1",
      username: "johndoe",
      email: "john@example.com",
    });

    const updated = mergeUserProfile(user, { name: "New Name" });

    expect(updated).not.toBe(user);
  });
});
