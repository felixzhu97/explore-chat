import { Injectable } from "@nestjs/common";
import { KafkaProducerService } from "@/core/messaging/kafka-producer.service";
import { RedisService } from "@/core/database/redis.service";

export type QueuedMessagePayload = {
  id: string;
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  createdAt: Date;
  sender?: { id: string; username: string; avatar: string | null };
  [key: string]: unknown;
};

const OFFLINE_KEY_PREFIX = "offline:";

@Injectable()
export class OfflineMessageQueueService {
  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly redis: RedisService,
  ) {}

  enqueue(recipientUserId: string, message: QueuedMessagePayload): void {
    const payload = JSON.stringify(message);
    this.kafkaProducer
      .sendOfflineMessage(recipientUserId, payload)
      .catch(() => {});
  }

  async getAndClear(userId: string): Promise<QueuedMessagePayload[]> {
    const key = `${OFFLINE_KEY_PREFIX}${userId}`;
    const raw = await this.redis.lrange(key, 0, -1);
    await this.redis.del(key);
    const result: QueuedMessagePayload[] = [];
    for (const s of raw) {
      try {
        const parsed = JSON.parse(s) as QueuedMessagePayload;
        if (parsed.createdAt && typeof parsed.createdAt === "string") {
          parsed.createdAt = new Date(parsed.createdAt) as unknown as Date;
        }
        result.push(parsed);
      } catch {
        // skip invalid
      }
    }
    return result;
  }
}
