import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  ApiMessageLike,
  SocketMessagePayload,
} from "../application/message-mapping.types";
import {
  mapApiMessageToMessage,
  mapSocketPayloadToMessage,
} from "../application/mappers";

describe("ApiMessageLike", () => {
  describe("when message has all fields", () => {
    it("should accept complete message structure", () => {
      const message: ApiMessageLike = {
        id: "msg-1",
        senderId: "user-123",
        senderName: "John Doe",
        content: "Hello, World!",
        timestamp: "2024-01-15T10:30:00.000Z",
        type: "text",
        status: "sent",
        createdAt: "2024-01-15T10:29:00.000Z",
      };

      expect(message.id).toBe("msg-1");
      expect(message.senderId).toBe("user-123");
      expect(message.senderName).toBe("John Doe");
      expect(message.content).toBe("Hello, World!");
      expect(message.timestamp).toBe("2024-01-15T10:30:00.000Z");
      expect(message.type).toBe("text");
      expect(message.status).toBe("sent");
      expect(message.createdAt).toBe("2024-01-15T10:29:00.000Z");
    });
  });

  describe("when message has only required fields", () => {
    it("should accept minimal message structure", () => {
      const message: ApiMessageLike = {
        id: "msg-2",
        senderId: "user-456",
        content: "Minimal message",
      };

      expect(message.id).toBe("msg-2");
      expect(message.senderId).toBe("user-456");
      expect(message.content).toBe("Minimal message");
      expect(message.senderName).toBeUndefined();
      expect(message.timestamp).toBeUndefined();
      expect(message.type).toBeUndefined();
      expect(message.status).toBeUndefined();
    });
  });

  describe("when message has media", () => {
    it("should accept message with mediaUrl", () => {
      const message: ApiMessageLike = {
        id: "msg-3",
        senderId: "user-789",
        content: "Check this out",
        mediaUrl: "https://example.com/image.jpg",
      };

      expect((message as { mediaUrl?: string }).mediaUrl).toBe(
        "https://example.com/image.jpg",
      );
    });

    it("should allow different media types via content field", () => {
      const imageMessage: ApiMessageLike = {
        id: "msg-img",
        senderId: "user-1",
        content: "Image description",
        type: "image",
      };

      const videoMessage: ApiMessageLike = {
        id: "msg-video",
        senderId: "user-2",
        content: "Video description",
        type: "video",
      };

      const audioMessage: ApiMessageLike = {
        id: "msg-audio",
        senderId: "user-3",
        content: "Audio description",
        type: "audio",
      };

      const fileMessage: ApiMessageLike = {
        id: "msg-file",
        senderId: "user-4",
        content: "File description",
        type: "file",
      };

      expect(imageMessage.type).toBe("image");
      expect(videoMessage.type).toBe("video");
      expect(audioMessage.type).toBe("audio");
      expect(fileMessage.type).toBe("file");
    });
  });

  describe("message status values", () => {
    it("should accept all valid status values", () => {
      const statuses: ApiMessageLike["status"][] = [
        "sent",
        "delivered",
        "read",
      ];

      statuses.forEach((status) => {
        const message: ApiMessageLike = {
          id: `msg-${status}`,
          senderId: "user-1",
          content: "Test message",
          status,
        };
        expect(message.status).toBe(status);
      });
    });
  });

  describe("type coercion edge cases", () => {
    it("should handle uppercase type values", () => {
      const message: ApiMessageLike = {
        id: "msg-upper",
        senderId: "user-1",
        content: "Uppercase type",
        type: "TEXT",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.type).toBe("text");
    });

    it("should handle mixed case type values", () => {
      const message: ApiMessageLike = {
        id: "msg-mixed",
        senderId: "user-1",
        content: "Mixed case type",
        type: "ImAgE",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.type).toBe("image");
    });

    it("should handle empty string type value", () => {
      const message: ApiMessageLike = {
        id: "msg-empty-type",
        senderId: "user-1",
        content: "Empty type",
        type: "",
      };

      const mapped = mapApiMessageToMessage(message);
      // Empty string type results in empty string (not defaulted to "text")
      expect(mapped.type).toBe("");
    });
  });

  describe("timestamp edge cases", () => {
    it("should use timestamp when both timestamp and createdAt are present", () => {
      const message: ApiMessageLike = {
        id: "msg-ts-pref",
        senderId: "user-1",
        content: "Has both",
        timestamp: "2024-01-15T10:30:00.000Z",
        createdAt: "2024-01-15T11:00:00.000Z",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.timestamp).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should use createdAt when timestamp is missing", () => {
      const message: ApiMessageLike = {
        id: "msg-created-at",
        senderId: "user-1",
        content: "Has createdAt",
        createdAt: "2024-01-15T11:00:00.000Z",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.timestamp).toBe("2024-01-15T11:00:00.000Z");
    });

    it("should use current date when neither timestamp nor createdAt", () => {
      const message: ApiMessageLike = {
        id: "msg-no-ts",
        senderId: "user-1",
        content: "No timestamps",
      };

      const before = new Date().toISOString();
      const mapped = mapApiMessageToMessage(message);
      const after = new Date().toISOString();

      expect(mapped.timestamp >= before).toBe(true);
      expect(mapped.timestamp <= after).toBe(true);
    });

    it("should handle timestamp with timezone offset", () => {
      const message: ApiMessageLike = {
        id: "msg-tz",
        senderId: "user-1",
        content: "With timezone",
        timestamp: "2024-01-15T10:30:00+08:00",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.timestamp).toBe("2024-01-15T10:30:00+08:00");
    });
  });

  describe("status edge cases", () => {
    it("should default to sent when status is undefined", () => {
      const message: ApiMessageLike = {
        id: "msg-no-status",
        senderId: "user-1",
        content: "No status",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.status).toBe("sent");
    });

    it("should preserve defined status values", () => {
      const statuses: ApiMessageLike["status"][] = [
        "sent",
        "delivered",
        "read",
      ];

      statuses.forEach((status) => {
        const message: ApiMessageLike = {
          id: `msg-status-${status}`,
          senderId: "user-1",
          content: "Test",
          status,
        };

        const mapped = mapApiMessageToMessage(message);
        expect(mapped.status).toBe(status);
      });
    });
  });

  describe("senderName edge cases", () => {
    it("should default senderName to empty string", () => {
      const message: ApiMessageLike = {
        id: "msg-no-name",
        senderId: "user-1",
        content: "No sender name",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.senderName).toBe("");
    });

    it("should preserve defined senderName", () => {
      const message: ApiMessageLike = {
        id: "msg-has-name",
        senderId: "user-1",
        content: "Has name",
        senderName: "John Doe",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.senderName).toBe("John Doe");
    });
  });

  describe("mediaUrl edge cases", () => {
    it("should include mediaUrl when defined", () => {
      const message: ApiMessageLike = {
        id: "msg-media",
        senderId: "user-1",
        content: "Has media",
        mediaUrl: "https://cdn.example.com/photo.jpg",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.mediaUrl).toBe("https://cdn.example.com/photo.jpg");
    });

    it("should not include mediaUrl when undefined", () => {
      const message: ApiMessageLike = {
        id: "msg-no-media",
        senderId: "user-1",
        content: "No media",
      };

      const mapped = mapApiMessageToMessage(message);
      expect(mapped.mediaUrl).toBeUndefined();
    });

    it("should handle empty string mediaUrl (maps to empty string, not undefined)", () => {
      const message: ApiMessageLike = {
        id: "msg-empty-media",
        senderId: "user-1",
        content: "Empty media",
        mediaUrl: "",
      };

      const mapped = mapApiMessageToMessage(message);
      // Empty string mediaUrl is included (not filtered out)
      expect(mapped.mediaUrl).toBe("");
    });

    it("should handle various media types with mediaUrl", () => {
      const mediaTypes = ["image", "video", "audio", "file"] as const;

      mediaTypes.forEach((type) => {
        const message: ApiMessageLike = {
          id: `msg-${type}-media`,
          senderId: "user-1",
          content: `${type} content`,
          type,
          mediaUrl: `https://cdn.example.com/file.${type === "image" ? "jpg" : type === "video" ? "mp4" : type === "audio" ? "mp3" : "pdf"}`,
        };

        const mapped = mapApiMessageToMessage(message);
        expect(mapped.type).toBe(type);
        expect(mapped.mediaUrl).toBeDefined();
      });
    });
  });
});

describe("SocketMessagePayload", () => {
  describe("when payload has all fields", () => {
    it("should accept complete payload structure", () => {
      const payload: SocketMessagePayload = {
        from: "user-abc",
        to: "user-xyz",
        data: {
          id: "socket-msg-1",
          text: "Socket message content",
          type: "text",
        },
        timestamp: 1705312200000,
      };

      expect(payload.from).toBe("user-abc");
      expect(payload.to).toBe("user-xyz");
      expect(payload.data?.id).toBe("socket-msg-1");
      expect(payload.data?.text).toBe("Socket message content");
      expect(payload.timestamp).toBe(1705312200000);
    });
  });

  describe("when payload has only required fields", () => {
    it("should accept minimal payload structure", () => {
      const payload: SocketMessagePayload = {};

      expect(payload.from).toBeUndefined();
      expect(payload.to).toBeUndefined();
      expect(payload.data).toBeUndefined();
      expect(payload.timestamp).toBeUndefined();
    });
  });

  describe("when payload has partial data", () => {
    it("should accept payload with only text", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          text: "Just text",
        },
      };

      expect(payload.data?.text).toBe("Just text");
      expect(payload.data?.id).toBeUndefined();
    });

    it("should accept payload with only id", () => {
      const payload: SocketMessagePayload = {
        from: "user-2",
        data: {
          id: "msg-123",
        },
      };

      expect(payload.data?.id).toBe("msg-123");
      expect(payload.data?.text).toBeUndefined();
    });

    it("should accept payload with empty data", () => {
      const payload: SocketMessagePayload = {
        from: "user-3",
        data: {},
      };

      expect(payload.data).toEqual({});
    });
  });

  describe("timestamp handling", () => {
    it("should accept zero timestamp", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        timestamp: 0,
      };

      expect(payload.timestamp).toBe(0);
    });

    it("should accept negative timestamp (edge case)", () => {
      const payload: SocketMessagePayload = {
        from: "user-2",
        timestamp: -1,
      };

      expect(payload.timestamp).toBe(-1);
    });

    it("should accept large timestamp values", () => {
      const futureTimestamp = 4102444800000; // Year 2100
      const payload: SocketMessagePayload = {
        from: "user-3",
        timestamp: futureTimestamp,
      };

      expect(payload.timestamp).toBe(futureTimestamp);
    });
  });

  describe("transformation to Message", () => {
    it("should map complete payload to Message", () => {
      const payload: SocketMessagePayload = {
        from: "user-sender",
        to: "user-receiver",
        data: {
          id: "socket-msg-map",
          text: "Mapped message",
          type: "text",
        },
        timestamp: 1705312200000,
      };

      const message = mapSocketPayloadToMessage(payload);

      expect(message.id).toBe("socket-msg-map");
      expect(message.senderId).toBe("user-sender");
      expect(message.content).toBe("Mapped message");
      expect(message.senderName).toBe("");
      expect(message.type).toBe("text");
      expect(message.status).toBe("delivered");
    });

    it("should generate id when data.id is missing", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          text: "No ID provided",
        },
        timestamp: 1705312200000,
      };

      const message = mapSocketPayloadToMessage(payload);

      expect(message.id.startsWith("live-")).toBe(true);
      expect(message.content).toBe("No ID provided");
    });

    it("should use current timestamp when timestamp is missing", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          text: "No timestamp",
        },
      };

      const before = Date.now();
      const message = mapSocketPayloadToMessage(payload);
      const after = Date.now();

      const msgTimestamp = new Date(message.timestamp).getTime();
      expect(msgTimestamp >= before).toBe(true);
      expect(msgTimestamp <= after).toBe(true);
    });

    it("should handle empty data gracefully", () => {
      const payload: SocketMessagePayload = {
        from: "user-empty",
        data: {},
      };

      const message = mapSocketPayloadToMessage(payload);

      expect(message.id.startsWith("live-")).toBe(true);
      expect(message.senderId).toBe("user-empty");
      expect(message.content).toBe("");
      expect(message.type).toBe("text");
    });

    it("should handle completely empty payload", () => {
      const payload: SocketMessagePayload = {};

      const message = mapSocketPayloadToMessage(payload);

      expect(message.id.startsWith("live-")).toBe(true);
      expect(message.senderId).toBe("");
      expect(message.content).toBe("");
    });

    it("should convert numeric timestamp to ISO string", () => {
      const timestamp = 1705312200000;
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: { text: "test" },
        timestamp,
      };

      const message = mapSocketPayloadToMessage(payload);
      expect(message.timestamp).toBe(new Date(timestamp).toISOString());
    });

    it("should map data.type when provided", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          text: "content",
          type: "image",
        },
      };

      const message = mapSocketPayloadToMessage(payload);
      expect(message.type).toBe("image");
    });
  });

  describe("direction and routing", () => {
    it("should preserve 'to' field for routing", () => {
      const payload: SocketMessagePayload = {
        from: "user-a",
        to: "user-b",
        data: { text: "hello" },
      };

      expect(payload.to).toBe("user-b");
      expect(payload.from).toBe("user-a");
    });

    it("should handle bidirectional messages", () => {
      const messageToA: SocketMessagePayload = {
        from: "user-b",
        to: "user-a",
        data: { text: "reply" },
      };

      const messageToB: SocketMessagePayload = {
        from: "user-a",
        to: "user-b",
        data: { text: "original" },
      };

      expect(messageToA.to).toBe("user-a");
      expect(messageToB.to).toBe("user-b");
    });
  });

  describe("multi-byte content", () => {
    it("should handle emoji content", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          id: "msg-emoji",
          text: "Hello 👋🎉",
        },
      };

      const message = mapSocketPayloadToMessage(payload);
      expect(message.content).toBe("Hello 👋🎉");
    });

    it("should handle unicode content", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          id: "msg-unicode",
          text: "你好世界 مرحبا",
        },
      };

      const message = mapSocketPayloadToMessage(payload);
      expect(message.content).toBe("你好世界 مرحبا");
    });

    it("should handle empty string content", () => {
      const payload: SocketMessagePayload = {
        from: "user-1",
        data: {
          id: "msg-empty",
          text: "",
        },
      };

      const message = mapSocketPayloadToMessage(payload);
      expect(message.content).toBe("");
    });
  });
});
