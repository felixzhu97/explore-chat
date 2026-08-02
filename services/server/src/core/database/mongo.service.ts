import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async onModuleInit() {
    const uri = this.config.mongodb?.uri;
    if (!uri) {
      logger.info("MongoDB disabled (no URI)");
      return;
    }
    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();
      await this.ensureIndexes();
      logger.info("MongoDB connected");
    } catch (err) {
      logger.warn(
        `MongoDB connect failed: ${err instanceof Error ? err.message : err}`,
      );
      this.client = null;
      this.db = null;
    }
  }

  private async ensureIndexes() {
    if (!this.db) return;
    const comments = this.db.collection("comments");
    await comments.createIndex({ postId: 1, createdAt: 1 });
    await comments.createIndex({ userId: 1, createdAt: -1 });
    const analytics = this.db.collection("analytics_events");
    await analytics.createIndex({ userId: 1, createdAt: -1 });
    await analytics.createIndex({ eventName: 1, createdAt: -1 });
    const notifications = this.db.collection("notifications");
    await notifications.createIndex({ recipientId: 1, createdAt: -1 });
    await notifications.createIndex({ recipientId: 1, readAt: 1 });
    await notifications.createIndex({ actorId: 1, postId: 1, type: 1 });
    await notifications.createIndex({ commentId: 1 }, { sparse: true });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      logger.info("MongoDB disconnected");
      this.client = null;
      this.db = null;
    }
  }

  getDb(): Db | null {
    return this.db;
  }

  isConnected(): boolean {
    return this.db != null;
  }
}
