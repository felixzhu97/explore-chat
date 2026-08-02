import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private client: Client | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async onModuleInit() {
    const { node, username, password } = this.config.elasticsearch;
    if (!node) {
      logger.info("Elasticsearch disabled (no node)");
      return;
    }
    try {
      this.client = new Client({
        node,
        ...(username && password && { auth: { username, password } }),
      });
      await this.client.ping();
      await this.ensureIndices();
      logger.info("Elasticsearch connected");
    } catch (err) {
      logger.warn(
        `Elasticsearch connect failed: ${err instanceof Error ? err.message : err}`,
      );
      this.client = null;
    }
  }

  private async ensureIndices() {
    if (!this.client) return;
    const indices = ["users", "posts", "hashtags"];
    for (const index of indices) {
      const exists = await this.client.indices.exists({ index });
      if (!exists) {
        const mappings =
          index === "users"
            ? {
                properties: {
                  id: { type: "keyword" as const },
                  username: { type: "text" as const },
                  avatar: { type: "keyword" as const },
                  createdAt: { type: "date" as const },
                },
              }
            : index === "posts"
              ? {
                  properties: {
                    postId: { type: "keyword" as const },
                    userId: { type: "keyword" as const },
                    caption: { type: "text" as const },
                    hashtags: { type: "keyword" as const },
                    autoTags: { type: "keyword" as const },
                    mediaUrls: { type: "keyword" as const },
                    createdAt: { type: "date" as const },
                    moderationStatus: { type: "keyword" as const },
                    moderationCategories: { type: "keyword" as const },
                    moderationAt: { type: "date" as const },
                    hidden: { type: "boolean" as const },
                  },
                }
              : {
                  properties: {
                    tag: { type: "keyword" as const },
                    createdAt: { type: "date" as const },
                  },
                };
        await this.client.indices.create({ index, mappings } as never);
      } else if (index === "posts") {
        try {
          await this.client.indices.putMapping({
            index: "posts",
            properties: {
              autoTags: { type: "keyword" as const },
              mediaUrls: { type: "keyword" as const },
              moderationStatus: { type: "keyword" as const },
              moderationCategories: { type: "keyword" as const },
              moderationAt: { type: "date" as const },
              hidden: { type: "boolean" as const },
            },
          } as never);
        } catch {
          // ignore if already present
        }
      }
    }
  }

  async onModuleDestroy() {
    this.client = null;
    logger.info("Elasticsearch client closed");
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client != null;
  }

  async indexUser(payload: {
    id: string;
    username: string;
    avatar?: string | null;
    createdAt: string;
  }) {
    if (!this.client) return;
    try {
      await this.client.index({
        index: "users",
        id: payload.id,
        document: {
          id: payload.id,
          username: payload.username,
          ...(payload.avatar != null && { avatar: payload.avatar }),
          createdAt: payload.createdAt,
        },
      });
    } catch (err) {
      logger.warn(
        `Elasticsearch indexUser failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  async deleteUser(id: string) {
    if (!this.client) return;
    try {
      await this.client.delete({ index: "users", id });
    } catch (err) {
      logger.warn(
        `Elasticsearch deleteUser failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
