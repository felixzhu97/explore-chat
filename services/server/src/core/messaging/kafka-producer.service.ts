import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;
  private readonly enabled: boolean;

  constructor() {
    this.config = ConfigService.loadConfig();
    this.enabled = this.config.kafka.brokers.length > 0;
    if (this.enabled) {
      this.kafka = new Kafka({
        clientId: "whatschat-server",
        brokers: this.config.kafka.brokers,
      });
      this.producer = this.kafka.producer();
    }
  }

  private connected = false;

  async onModuleInit() {
    if (!this.enabled || !this.producer) {
      logger.info(
        "Kafka disabled (no brokers); offline message queue will no-op",
      );
      return;
    }
    try {
      await this.producer.connect();
      this.connected = true;
      logger.info("Kafka producer connected");
    } catch (err) {
      logger.warn(`Kafka producer connect failed: ${err}`);
    }
  }

  async onModuleDestroy() {
    if (this.connected && this.producer) {
      await this.producer.disconnect();
      logger.info("Kafka producer disconnected");
    }
  }

  async sendOfflineMessage(
    recipientUserId: string,
    payload: string,
  ): Promise<void> {
    if (!this.connected || !this.producer) return;
    await this.producer.send({
      topic: this.config.kafka.topicOfflineMessages,
      messages: [{ key: recipientUserId, value: payload }],
    });
  }

  async sendPostCreated(payload: {
    postId: string;
    userId: string;
    createdAt: string;
    caption: string;
    type: string;
    location?: string;
  }): Promise<void> {
    if (!this.connected || !this.producer) return;
    await this.producer.send({
      topic: this.config.kafka.topicPostCreated,
      messages: [{ key: payload.userId, value: JSON.stringify(payload) }],
    });
  }

  async sendPostDeleted(payload: {
    postId: string;
    userId: string;
  }): Promise<void> {
    if (!this.connected || !this.producer) return;
    await this.producer.send({
      topic: this.config.kafka.topicPostDeleted,
      messages: [{ key: payload.userId, value: JSON.stringify(payload) }],
    });
  }

  async sendCommentCreated(payload: {
    commentId: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
  }): Promise<void> {
    if (!this.connected || !this.producer) return;
    await this.producer.send({
      topic: this.config.kafka.topicCommentCreated,
      messages: [{ key: payload.postId, value: JSON.stringify(payload) }],
    });
  }
}
