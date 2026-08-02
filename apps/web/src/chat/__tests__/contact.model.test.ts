import { describe, it, expect } from "vitest";
import { mapContact } from "../contact.model";

describe("mapContact", () => {
  it("should_mapRequiredFields_when_minimalInput", () => {
    const contact = mapContact({
      id: "contact-1",
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
      lastMessage: "Hello there",
      timestamp: "2024-01-15T10:30:00Z",
    });

    expect(contact.id).toBe("contact-1");
    expect(contact.name).toBe("John Doe");
    expect(contact.unreadCount).toBe(0);
    expect(contact.isOnline).toBe(false);
    expect(contact.isGroup).toBe(false);
  });

  it("should_preserveOptionalFields_when_provided", () => {
    const contact = mapContact({
      id: "contact-2",
      name: "Team Group",
      avatar: "",
      lastMessage: "Hi",
      timestamp: "2024-01-15T10:30:00Z",
      unreadCount: 3,
      isOnline: true,
      isGroup: true,
      pinned: true,
      muted: true,
    });

    expect(contact.unreadCount).toBe(3);
    expect(contact.isOnline).toBe(true);
    expect(contact.isGroup).toBe(true);
    expect(contact.pinned).toBe(true);
    expect(contact.muted).toBe(true);
  });
});
