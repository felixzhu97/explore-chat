import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";
import { ConfigService } from "../config/config.service";
import { RedisService } from "../database/redis.service";
import { PrismaService } from "../database/prisma.service";
import { CassandraFeedRepository } from "../database/cassandra-feed.repository";
import { CacheService } from "../cache/cache.service";
import { ElasticsearchService } from "../database/elasticsearch.service";
import type { IPostRepository } from "@/post/domain/post.repository.interface";
import { VisionClientService } from "@/ai/application/vision-client.service";
import logger from "@/shared/utils/logger";
import { HTTP_URL_PREFIX, parseDataUrl } from "@/shared/utils/media-url";

const OFFLINE_KEY_PREFIX = "offline:";
const FEED_CACHE_KEY_PREFIX = "feed:";
const MAX_AUTO_TAGS = 20;
const MAX_LOG_MESSAGE = 500;

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message || String(err);
    return msg.length > MAX_LOG_MESSAGE
      ? `${msg.slice(0, MAX_LOG_MESSAGE)}…`
      : msg;
  }
  const s = String(err);
  return s.length > MAX_LOG_MESSAGE ? `${s.slice(0, MAX_LOG_MESSAGE)}…` : s;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private feedConsumer: Consumer | null = null;
  private cvConsumer: Consumer | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;
  private readonly enabled: boolean;

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly feedRepo: CassandraFeedRepository,
    private readonly cache: CacheService,
    private readonly elasticsearch: ElasticsearchService,
    @Inject("IPostRepository")
    private readonly postRepo: IPostRepository,
    private readonly visionClient: VisionClientService,
  ) {
    this.config = ConfigService.loadConfig();
    this.enabled = this.config.kafka.brokers.length > 0;
    if (this.enabled) {
      this.kafka = new Kafka({
        clientId: "whatschat-server",
        brokers: this.config.kafka.brokers,
      });
      this.consumer = this.kafka.consumer({
        groupId: "offline-messages-consumer",
      });
      this.feedConsumer = this.kafka.consumer({
        groupId: "post-created-consumer",
      });
      this.cvConsumer = this.kafka.consumer({ groupId: "post-cv-consumer" });
    }
  }

  async onModuleInit() {
    if (!this.enabled || !this.consumer) return;
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.config.kafka.topicOfflineMessages,
        fromBeginning: false,
      });
      await this.consumer.run({
        eachMessage: async ({
          message,
        }: {
          message: { key?: Buffer | null; value?: Buffer | null };
        }) => {
          const userId = message.key?.toString();
          const value = message.value?.toString();
          if (!userId || !value) return;
          try {
            await this.redis.rpush(`${OFFLINE_KEY_PREFIX}${userId}`, value);
          } catch (err) {
            logger.error(
              `Kafka consumer Redis rpush error: ${safeErrorMessage(err)}`,
            );
          }
        },
      });
      logger.info("Kafka consumer subscribed to offline-messages");
    } catch (err) {
      logger.warn(`Kafka consumer connect failed: ${safeErrorMessage(err)}`);
    }

    if (this.feedConsumer) {
      try {
        await this.feedConsumer.connect();
        await this.feedConsumer.subscribe({
          topic: this.config.kafka.topicPostCreated,
          fromBeginning: false,
        });
        await this.feedConsumer.run({
          eachMessage: async ({
            message,
          }: {
            message: { key?: Buffer | null; value?: Buffer | null };
          }) => {
            const value = message.value?.toString();
            if (!value) return;
            try {
              const payload = JSON.parse(value) as {
                postId: string;
                userId: string;
                createdAt: string;
                caption: string;
                type: string;
                location?: string;
              };
              const followers = await this.prisma.userFollow.findMany({
                where: { followingId: payload.userId },
                select: { followerId: true },
              });
              const createdAt = new Date(payload.createdAt);
              await this.feedRepo.insertFeedEntry(
                payload.userId,
                payload.userId,
                payload.postId,
                createdAt,
              );
              await this.cache.del(`${FEED_CACHE_KEY_PREFIX}${payload.userId}`);
              for (const f of followers) {
                await this.feedRepo.insertFeedEntry(
                  f.followerId,
                  payload.userId,
                  payload.postId,
                  createdAt,
                );
                await this.cache.del(`${FEED_CACHE_KEY_PREFIX}${f.followerId}`);
              }
              const es = this.elasticsearch.getClient();
              const rawTags = (payload.caption || "").match(/#\w+/g) || [];
              if (es && rawTags.length > 0) {
                const tagSet = new Set<string>();
                for (const t of rawTags) {
                  const normalized = t.replace(/^#/, "").toLowerCase();
                  if (normalized && !tagSet.has(normalized)) {
                    tagSet.add(normalized);
                    await es.index({
                      index: "hashtags",
                      id: normalized,
                      document: {
                        tag: normalized,
                        createdAt: payload.createdAt,
                      },
                    });
                  }
                }
              }
            } catch (err) {
              logger.error(
                `Kafka post.created consumer error: ${safeErrorMessage(err)}`,
              );
            }
          },
        });
        logger.info("Kafka consumer subscribed to post.created");
      } catch (err) {
        logger.warn(
          `Kafka feed consumer connect failed: ${safeErrorMessage(err)}`,
        );
      }

      if (
        this.cvConsumer &&
        this.config.vision.enabled &&
        this.config.vision.serviceUrl
      ) {
        try {
          await this.cvConsumer.connect();
          await this.cvConsumer.subscribe({
            topic: this.config.kafka.topicPostCreated,
            fromBeginning: false,
          });
          await this.cvConsumer.run({
            eachMessage: async ({
              message,
            }: {
              message: { key?: Buffer | null; value?: Buffer | null };
            }) => {
              const value = message.value?.toString();
              if (!value) return;
              try {
                const payload = JSON.parse(value) as {
                  postId: string;
                  userId: string;
                  createdAt: string;
                  caption: string;
                  type: string;
                  location?: string;
                };
                const postRow = await this.postRepo.getPostById(payload.postId);
                const rawUrls = postRow?.media_urls ?? [];
                if (rawUrls.length === 0) return;
                const maxImages = this.config.vision.maxImagesPerPost;
                const toProcess = rawUrls
                  .slice(0, maxImages)
                  .filter((u): u is string => typeof u === "string");
                const allLabels: string[] = [];
                const seen = new Set<string>();
                let moderationRejected = false;
                const moderationCategorySet = new Set<string>();
                for (const url of toProcess) {
                  try {
                    let labels: string[];
                    if (HTTP_URL_PREFIX.test(url)) {
                      labels = await this.visionClient.predictFromUrl(url);
                      if (this.config.vision.moderationEnabled) {
                        const mod =
                          await this.visionClient.moderateFromUrl(url);
                        if (!mod.safe) {
                          const real = mod.categories.filter(
                            (c) => c.label !== "error",
                          );
                          if (real.length > 0) {
                            moderationRejected = true;
                            real.forEach((c) =>
                              moderationCategorySet.add(c.label),
                            );
                          }
                        }
                      }
                    } else {
                      const parsed = parseDataUrl(url);
                      if (!parsed) continue;
                      labels = await this.visionClient.predictFromBuffer(
                        parsed.buffer,
                        parsed.mimeType,
                      );
                      if (this.config.vision.moderationEnabled) {
                        const mod = await this.visionClient.moderateFromBuffer(
                          parsed.buffer,
                          parsed.mimeType,
                        );
                        if (!mod.safe) {
                          const real = mod.categories.filter(
                            (c) => c.label !== "error",
                          );
                          if (real.length > 0) {
                            moderationRejected = true;
                            real.forEach((c) =>
                              moderationCategorySet.add(c.label),
                            );
                          }
                        }
                      }
                    }
                    for (const l of labels) {
                      const n = l.trim().toLowerCase();
                      if (n && !seen.has(n)) {
                        seen.add(n);
                        allLabels.push(n);
                      }
                    }
                  } catch (err) {
                    logger.warn(
                      `Vision predict failed: ${safeErrorMessage(err)}`,
                    );
                  }
                }
                if (
                  payload.type === "VIDEO" &&
                  this.config.vision.moderationEnabled &&
                  rawUrls.length > 0
                ) {
                  const firstUrl = rawUrls[0];
                  if (
                    typeof firstUrl === "string" &&
                    HTTP_URL_PREFIX.test(firstUrl)
                  ) {
                    try {
                      const mod =
                        await this.visionClient.moderateVideoFromUrl(firstUrl);
                      if (!mod.safe) {
                        const real = mod.categories.filter(
                          (c) => c.label !== "error",
                        );
                        if (real.length > 0) {
                          moderationRejected = true;
                          real.forEach((c) =>
                            moderationCategorySet.add(c.label),
                          );
                        }
                      }
                    } catch (err) {
                      logger.warn(
                        `Vision moderate video failed: ${safeErrorMessage(err)}`,
                      );
                    }
                  }
                }
                const autoTags = allLabels.slice(0, MAX_AUTO_TAGS);
                const moderationAt = new Date().toISOString();
                const moderationStatus = this.config.vision.moderationEnabled
                  ? moderationRejected
                    ? "reject"
                    : "pass"
                  : "pending";
                const moderationCategories = Array.from(moderationCategorySet);
                const es = this.elasticsearch.getClient();
                const hasUpdate =
                  autoTags.length > 0 || this.config.vision.moderationEnabled;
                if (es && hasUpdate) {
                  const doc: Record<string, unknown> = { autoTags };
                  if (this.config.vision.moderationEnabled) {
                    doc["moderationStatus"] = moderationStatus;
                    doc["moderationCategories"] = moderationCategories;
                    doc["moderationAt"] = moderationAt;
                  }
                  try {
                    await es.update({
                      index: "posts",
                      id: payload.postId,
                      body: { doc } as { doc: Record<string, unknown> },
                      doc_as_upsert: false,
                    });
                  } catch (updateErr: unknown) {
                    const isMissing =
                      updateErr &&
                      typeof updateErr === "object" &&
                      (
                        updateErr as {
                          meta?: { body?: { error?: { type?: string } } };
                        }
                      ).meta?.body?.error?.type ===
                        "document_missing_exception";
                    if (isMissing && postRow) {
                      const rawTags =
                        (payload.caption || "").match(/#\w+/g) || [];
                      const safeMediaUrls = rawUrls.map((u) =>
                        typeof u === "string" && HTTP_URL_PREFIX.test(u)
                          ? u
                          : "[inline]",
                      );
                      await es.index({
                        index: "posts",
                        id: payload.postId,
                        refresh: true,
                        document: {
                          postId: payload.postId,
                          userId: payload.userId,
                          caption: payload.caption,
                          type: payload.type,
                          hashtags: rawTags,
                          autoTags,
                          mediaUrls: safeMediaUrls,
                          createdAt: payload.createdAt,
                          moderationStatus,
                          moderationCategories,
                          moderationAt,
                        },
                      });
                    } else {
                      throw updateErr;
                    }
                  }
                }
              } catch (err) {
                logger.error(
                  `Kafka post-cv consumer error: ${safeErrorMessage(err)}`,
                );
              }
            },
          });
          logger.info("Kafka consumer subscribed to post.created (cv)");
        } catch (err) {
          logger.warn(
            `Kafka cv consumer connect failed: ${safeErrorMessage(err)}`,
          );
        }
      }
    }
  }

  async onModuleDestroy() {
    if (this.cvConsumer) {
      await this.cvConsumer.disconnect();
      this.cvConsumer = null;
    }
    if (this.feedConsumer) {
      await this.feedConsumer.disconnect();
      this.feedConsumer = null;
    }
    if (this.consumer) {
      await this.consumer.disconnect();
      logger.info("Kafka consumer disconnected");
    }
  }
}
