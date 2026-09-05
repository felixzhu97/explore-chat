import { describe, it, expect } from "vitest";
import type {
  Contact,
  GroupMember,
  GroupMemberRole,
} from "../contact";

describe("Contact Types", () => {
  // ============================================================
  // GroupMemberRole - Test the group member role type
  // ============================================================
  describe("GroupMemberRole", () => {
    it("should accept member role", () => {
      const role: GroupMemberRole = "member";
      expect(role).toBe("member");
    });

    it("should accept admin role", () => {
      const role: GroupMemberRole = "admin";
      expect(role).toBe("admin");
    });

    it("should accept owner role", () => {
      const role: GroupMemberRole = "owner";
      expect(role).toBe("owner");
    });

    it("should support all valid member roles", () => {
      const roles: GroupMemberRole[] = ["member", "admin", "owner"];

      roles.forEach((role) => {
        expect(["member", "admin", "owner"]).toContain(role);
      });
    });

    it("should have exactly 3 role options", () => {
      const roles: GroupMemberRole[] = ["member", "admin", "owner"];
      expect(roles).toHaveLength(3);
    });
  });

  // ============================================================
  // GroupMember - Test the group member interface
  // ============================================================
  describe("GroupMember", () => {
    describe("when creating a member with all fields", () => {
      it("should create a valid group member", () => {
        const member: GroupMember = {
          id: "member-1",
          userId: "user-1",
          name: "John Doe",
          userName: "johndoe",
          avatar: "https://example.com/avatar.jpg",
          userAvatar: "https://example.com/user-avatar.jpg",
          role: "member",
          joinedAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        };

        expect(member.userId).toBe("user-1");
        expect(member.role).toBe("member");
        expect(member.name).toBe("John Doe");
        expect(member.userName).toBe("johndoe");
        expect(member.avatar).toBe("https://example.com/avatar.jpg");
        expect(member.userAvatar).toBe("https://example.com/user-avatar.jpg");
      });

      it("should have both id and userId fields", () => {
        const member: GroupMember = {
          id: "member-1",
          userId: "user-1",
          name: "John",
          role: "member",
        };

        expect(member.id).toBe("member-1");
        expect(member.userId).toBe("user-1");
      });
    });

    describe("when creating members with different roles", () => {
      it("should create a regular member", () => {
        const member: GroupMember = {
          userId: "user-1",
          name: "John Doe",
          role: "member",
          joinedAt: new Date().toISOString(),
        };

        expect(member.role).toBe("member");
      });

      it("should create an admin member", () => {
        const admin: GroupMember = {
          userId: "user-2",
          name: "Jane Admin",
          role: "admin",
          joinedAt: new Date().toISOString(),
        };

        expect(admin.role).toBe("admin");
      });

      it("should create an owner member", () => {
        const owner: GroupMember = {
          userId: "user-3",
          name: "Group Owner",
          role: "owner",
          joinedAt: new Date().toISOString(),
        };

        expect(owner.role).toBe("owner");
      });
    });

    describe("when handling member identity fields", () => {
      it("should support name field", () => {
        const member: GroupMember = {
          userId: "user-1",
          name: "Display Name",
          role: "member",
          joinedAt: new Date().toISOString(),
        };

        expect(member.name).toBe("Display Name");
      });

      it("should support userName field", () => {
        const member: GroupMember = {
          userId: "user-1",
          userName: "username123",
          role: "member",
          joinedAt: new Date().toISOString(),
        };

        expect(member.userName).toBe("username123");
      });

      it("should support avatar field", () => {
        const member: GroupMember = {
          userId: "user-1",
          avatar: "https://example.com/avatar.jpg",
          role: "member",
          joinedAt: new Date().toISOString(),
        };

        expect(member.avatar).toBe("https://example.com/avatar.jpg");
      });

      it("should support userAvatar field", () => {
        const member: GroupMember = {
          userId: "user-1",
          userAvatar: "https://example.com/user-avatar.jpg",
          role: "member",
          joinedAt: new Date().toISOString(),
        };

        expect(member.userAvatar).toBe("https://example.com/user-avatar.jpg");
      });
    });

    describe("when handling timestamps", () => {
      it("should support ISO string joinedAt", () => {
        const joinedAt = "2024-01-15T10:30:00.000Z";
        const member: GroupMember = {
          userId: "user-1",
          name: "User",
          role: "member",
          joinedAt,
        };

        expect(member.joinedAt).toBe(joinedAt);
      });

      it("should support Date object joinedAt", () => {
        const joinedAt = new Date("2024-01-15T10:30:00Z");
        const member: GroupMember = {
          userId: "user-1",
          name: "User",
          role: "member",
          joinedAt,
        };

        expect(member.joinedAt).toEqual(joinedAt);
      });

      it("should support lastSeen timestamp", () => {
        const lastSeen = new Date(Date.now() - 3600000).toISOString();
        const member: GroupMember = {
          userId: "user-1",
          name: "User",
          role: "member",
          joinedAt: new Date().toISOString(),
          lastSeen,
        };

        expect(member.lastSeen).toBe(lastSeen);
      });
    });
  });

  // ============================================================
  // Contact - Test the main Contact interface
  // ============================================================
  describe("Contact", () => {
    describe("when creating a basic contact", () => {
      it("should create a contact with required fields only", () => {
        const contact: Contact = {
          id: "contact-1",
          name: "John Doe",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(contact.id).toBe("contact-1");
        expect(contact.name).toBe("John Doe");
        expect(contact.avatar).toBe("https://example.com/avatar.jpg");
      });
    });

    describe("when creating a contact with messaging info", () => {
      it("should include last message", () => {
        const contact: Contact = {
          id: "contact-2",
          name: "Jane Doe",
          avatar: "https://example.com/avatar.jpg",
          lastMessage: "Hey, how are you?",
          timestamp: new Date().toISOString(),
        };

        expect(contact.lastMessage).toBe("Hey, how are you?");
      });

      it("should include unread count", () => {
        const contact: Contact = {
          id: "contact-3",
          name: "Contact",
          avatar: "https://example.com/avatar.jpg",
          unreadCount: 5,
        };

        expect(contact.unreadCount).toBe(5);
      });

      it("should indicate online status", () => {
        const onlineContact: Contact = {
          id: "contact-4",
          name: "Online Contact",
          avatar: "https://example.com/avatar.jpg",
          isOnline: true,
        };

        const offlineContact: Contact = {
          id: "contact-5",
          name: "Offline Contact",
          avatar: "https://example.com/avatar.jpg",
          isOnline: false,
        };

        expect(onlineContact.isOnline).toBe(true);
        expect(offlineContact.isOnline).toBe(false);
      });

      it("should support zero unread count", () => {
        const contact: Contact = {
          id: "contact-6",
          name: "No Unread",
          avatar: "https://example.com/avatar.jpg",
          unreadCount: 0,
        };

        expect(contact.unreadCount).toBe(0);
      });

      it("should support large unread count", () => {
        const contact: Contact = {
          id: "contact-7",
          name: "Many Unread",
          avatar: "https://example.com/avatar.jpg",
          unreadCount: 999,
        };

        expect(contact.unreadCount).toBe(999);
      });
    });

    describe("when creating group contacts", () => {
      it("should identify as a group", () => {
        const group: Contact = {
          id: "group-1",
          name: "Family Group",
          avatar: "https://example.com/group.jpg",
          isGroup: true,
          memberCount: 10,
          description: "Family chat group",
        };

        expect(group.isGroup).toBe(true);
        expect(group.memberCount).toBe(10);
        expect(group.description).toBe("Family chat group");
      });

      it("should include members array for groups", () => {
        const group: Contact = {
          id: "group-2",
          name: "Team Group",
          avatar: "https://example.com/team.jpg",
          isGroup: true,
          members: [
            {
              userId: "user-1",
              name: "User 1",
              role: "admin",
              joinedAt: new Date().toISOString(),
            },
            {
              userId: "user-2",
              name: "User 2",
              role: "member",
              joinedAt: new Date().toISOString(),
            },
          ],
          admin: ["user-1"],
        };

        expect(group.members).toHaveLength(2);
        expect(group.admin).toContain("user-1");
      });

      it("should support member count without members array", () => {
        const group: Contact = {
          id: "group-3",
          name: "Large Group",
          avatar: "https://example.com/large.jpg",
          isGroup: true,
          memberCount: 100,
        };

        expect(group.memberCount).toBe(100);
        expect(group.members).toBeUndefined();
      });

      it("should support admin list for groups", () => {
        const group: Contact = {
          id: "group-4",
          name: "Admin Group",
          avatar: "https://example.com/admin.jpg",
          isGroup: true,
          admin: ["user-1", "user-2"],
        };

        expect(group.admin).toHaveLength(2);
      });
    });

    describe("when handling pinning and muting", () => {
      it("should support pinned contact", () => {
        const pinnedContact: Contact = {
          id: "contact-8",
          name: "Pinned Contact",
          avatar: "https://example.com/avatar.jpg",
          pinned: true,
          muted: false,
        };

        expect(pinnedContact.pinned).toBe(true);
        expect(pinnedContact.muted).toBe(false);
      });

      it("should support muted contact", () => {
        const mutedContact: Contact = {
          id: "contact-9",
          name: "Muted Contact",
          avatar: "https://example.com/avatar.jpg",
          pinned: false,
          muted: true,
        };

        expect(mutedContact.muted).toBe(true);
      });

      it("should support both pinned and muted", () => {
        const contact: Contact = {
          id: "contact-10",
          name: "Pinned and Muted",
          avatar: "https://example.com/avatar.jpg",
          pinned: true,
          muted: true,
        };

        expect(contact.pinned).toBe(true);
        expect(contact.muted).toBe(true);
      });

      it("should support neither pinned nor muted", () => {
        const contact: Contact = {
          id: "contact-11",
          name: "Normal Contact",
          avatar: "https://example.com/avatar.jpg",
          pinned: false,
          muted: false,
        };

        expect(contact.pinned).toBe(false);
        expect(contact.muted).toBe(false);
      });
    });

    describe("when handling blocking", () => {
      it("should support blocked contact", () => {
        const blockedContact: Contact = {
          id: "contact-12",
          name: "Blocked Contact",
          avatar: "https://example.com/avatar.jpg",
          blocked: true,
        };

        expect(blockedContact.blocked).toBe(true);
      });

      it("should support unblocked contact", () => {
        const unblockedContact: Contact = {
          id: "contact-13",
          name: "Unblocked Contact",
          avatar: "https://example.com/avatar.jpg",
          blocked: false,
        };

        expect(unblockedContact.blocked).toBe(false);
      });

      it("should default to unblocked when not specified", () => {
        const contact: Contact = {
          id: "contact-14",
          name: "Contact",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(contact.blocked).toBeUndefined();
      });
    });

    describe("when handling contact details", () => {
      it("should support phone field", () => {
        const contact: Contact = {
          id: "contact-15",
          name: "John Contact",
          avatar: "https://example.com/avatar.jpg",
          phone: "+1234567890",
        };

        expect(contact.phone).toBe("+1234567890");
      });

      it("should support phoneNumber field", () => {
        const contact: Contact = {
          id: "contact-16",
          name: "John Contact",
          avatar: "https://example.com/avatar.jpg",
          phoneNumber: "+1234567890",
        };

        expect(contact.phoneNumber).toBe("+1234567890");
      });

      it("should support both phone and phoneNumber", () => {
        const contact: Contact = {
          id: "contact-17",
          name: "John Contact",
          avatar: "https://example.com/avatar.jpg",
          phone: "+1234567890",
          phoneNumber: "+1234567890",
        };

        expect(contact.phone).toBe("+1234567890");
        expect(contact.phoneNumber).toBe("+1234567890");
      });

      it("should support email field", () => {
        const contact: Contact = {
          id: "contact-18",
          name: "John Contact",
          avatar: "https://example.com/avatar.jpg",
          email: "john@example.com",
        };

        expect(contact.email).toBe("john@example.com");
      });

      it("should support status field", () => {
        const contact: Contact = {
          id: "contact-19",
          name: "John Contact",
          avatar: "https://example.com/avatar.jpg",
          status: "Hey there! I'm using Chat",
        };

        expect(contact.status).toContain("Chat");
      });

      it("should support lastSeen field", () => {
        const lastSeen = new Date(Date.now() - 3600000).toISOString();
        const contact: Contact = {
          id: "contact-20",
          name: "John Contact",
          avatar: "https://example.com/avatar.jpg",
          lastSeen,
        };

        expect(contact.lastSeen).toBe(lastSeen);
      });
    });

    describe("when handling full contact profile", () => {
      it("should create a full-featured contact", () => {
        const contact: Contact = {
          id: "contact-21",
          name: "John Doe",
          avatar: "https://example.com/avatar.jpg",
          lastMessage: "See you later!",
          timestamp: new Date().toISOString(),
          unreadCount: 3,
          isOnline: true,
          isGroup: false,
          phone: "+1234567890",
          email: "john@example.com",
          phoneNumber: "+1234567890",
          status: "Available",
          lastSeen: new Date().toISOString(),
          pinned: true,
          muted: false,
          blocked: false,
        };

        expect(contact.id).toBe("contact-21");
        expect(contact.isOnline).toBe(true);
        expect(contact.pinned).toBe(true);
        expect(contact.unreadCount).toBe(3);
      });
    });

    describe("edge cases", () => {
      it("should handle contact with no optional fields", () => {
        const contact: Contact = {
          id: "contact-22",
          name: "Minimal Contact",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(contact.id).toBe("contact-22");
        expect(contact.name).toBe("Minimal Contact");
        expect(contact.lastMessage).toBeUndefined();
        expect(contact.unreadCount).toBeUndefined();
        expect(contact.isOnline).toBeUndefined();
      });

      it("should handle contact with empty name", () => {
        const contact: Contact = {
          id: "contact-23",
          name: "",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(contact.name).toBe("");
      });

      it("should handle contact with Unicode name", () => {
        const contact: Contact = {
          id: "contact-24",
          name: "张伟 🇨🇳",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(contact.name).toContain("张伟");
        expect(contact.name).toContain("🇨🇳");
      });

      it("should handle contact with very long status", () => {
        const longStatus = "a".repeat(500);
        const contact: Contact = {
          id: "contact-25",
          name: "Long Status Contact",
          avatar: "https://example.com/avatar.jpg",
          status: longStatus,
        };

        expect(contact.status).toHaveLength(500);
      });

      it("should handle contact with international phone number", () => {
        const contact: Contact = {
          id: "contact-26",
          name: "International Contact",
          avatar: "https://example.com/avatar.jpg",
          phone: "+86-138-0000-0000",
          phoneNumber: "+86-138-0000-0000",
        };

        expect(contact.phone).toContain("+86");
      });

      it("should preserve immutability concept", () => {
        const contact: Contact = {
          id: "contact-27",
          name: "Original Contact",
          avatar: "https://example.com/avatar.jpg",
        };

        const newContact: Contact = {
          ...contact,
          name: "Modified Contact",
        };

        expect(contact.name).toBe("Original Contact");
        expect(newContact.name).toBe("Modified Contact");
      });
    });
  });
});
