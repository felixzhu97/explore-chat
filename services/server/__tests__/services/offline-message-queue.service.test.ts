import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  OfflineMessageQueueService,
  QueuedMessagePayload,
} from "@/messages/application/offline-message-queue.service";

describe("OfflineMessageQueueService", () => {
  let service: OfflineMessageQueueService;
  let mockKafkaProducer: any;
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockKafkaProducer = {
      sendOfflineMessage: vi.fn().mockResolvedValue(undefined),
    };

    mockRedis = {
      lrange: vi.fn(),
      del: vi.fn(),
    };

    service = new OfflineMessageQueueService(mockKafkaProducer, mockRedis);
  });

  describe("enqueue", () => {
    it("should send message via kafka producer", () => {
      const message: QueuedMessagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Hello",
        createdAt: new Date(),
      };

      service.enqueue("user-1", message);

      expect(mockKafkaProducer.sendOfflineMessage).toHaveBeenCalledWith(
        "user-1",
        expect.any(String),
      );
    });

    it("should pass serialized JSON to kafka", () => {
      const message: QueuedMessagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Test content",
        createdAt: new Date("2024-01-15T10:00:00Z"),
      };

      service.enqueue("user-1", message);

      const callArg = mockKafkaProducer.sendOfflineMessage.mock.calls[0][1];
      const parsed = JSON.parse(callArg);
      expect(parsed.id).toBe("msg-1");
      expect(parsed.content).toBe("Test content");
    });

    it("should handle message with sender info", () => {
      const message: QueuedMessagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Hello",
        createdAt: new Date(),
        sender: { id: "sender-1", username: "testuser", avatar: null },
      };

      service.enqueue("user-1", message);

      expect(mockKafkaProducer.sendOfflineMessage).toHaveBeenCalled();
    });

    it("should handle kafka producer errors gracefully", async () => {
      mockKafkaProducer.sendOfflineMessage.mockRejectedValue(
        new Error("Kafka error"),
      );

      const message: QueuedMessagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Hello",
        createdAt: new Date(),
      };

      expect(() => service.enqueue("user-1", message)).not.toThrow();
    });
  });

  describe("getAndClear", () => {
    it("should return empty array when no messages", async () => {
      mockRedis.lrange.mockResolvedValue([]);

      const result = await service.getAndClear("user-1");

      expect(result).toEqual([]);
    });

    it("should delete the key after retrieving messages", async () => {
      mockRedis.lrange.mockResolvedValue([]);

      await service.getAndClear("user-1");

      expect(mockRedis.del).toHaveBeenCalledWith("offline:user-1");
    });

    it("should parse and return valid messages", async () => {
      const messagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Hello",
        createdAt: "2024-01-15T10:00:00.000Z",
      };
      mockRedis.lrange.mockResolvedValue([JSON.stringify(messagePayload)]);

      const result = await service.getAndClear("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("msg-1");
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it("should skip invalid JSON messages", async () => {
      mockRedis.lrange.mockResolvedValue([
        JSON.stringify({ id: "msg-1", content: "valid" }),
        "invalid-json",
        "{broken",
      ]);

      const result = await service.getAndClear("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("msg-1");
    });

    it("should convert string createdAt to Date", async () => {
      const messagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Hello",
        createdAt: "2024-01-15T10:00:00.000Z",
      };
      mockRedis.lrange.mockResolvedValue([JSON.stringify(messagePayload)]);

      const result = await service.getAndClear("user-1");

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].createdAt.toISOString()).toBe(
        "2024-01-15T10:00:00.000Z",
      );
    });

    it("should handle messages without createdAt field", async () => {
      const messagePayload = {
        id: "msg-1",
        chatId: "chat-1",
        senderId: "sender-1",
        type: "TEXT",
        content: "Hello",
      };
      mockRedis.lrange.mockResolvedValue([JSON.stringify(messagePayload)]);

      const result = await service.getAndClear("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("msg-1");
    });

    it("should handle multiple messages", async () => {
      const messages = [
        {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          type: "TEXT",
          content: "Hello",
          createdAt: "2024-01-15T10:00:00.000Z",
        },
        {
          id: "msg-2",
          chatId: "chat-1",
          senderId: "sender-1",
          type: "TEXT",
          content: "World",
          createdAt: "2024-01-15T10:01:00.000Z",
        },
      ];
      mockRedis.lrange.mockResolvedValue(
        messages.map((m) => JSON.stringify(m)),
      );

      const result = await service.getAndClear("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("msg-1");
      expect(result[1].id).toBe("msg-2");
    });

    it("should use correct key format", async () => {
      mockRedis.lrange.mockResolvedValue([]);

      await service.getAndClear("user-123");

      expect(mockRedis.lrange).toHaveBeenCalledWith("offline:user-123", 0, -1);
    });
  });
});
