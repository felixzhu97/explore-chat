import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
    this.client = this.createClient();
    this.setupEventHandlers();
  }

  private createClient(): Redis {
    const url = this.config.redis.url;
    const password = this.config.redis.password;

    if (url && (url.startsWith("redis://") || url.startsWith("rediss://"))) {
      return new Redis(url, password ? { password } : {});
    }

    // 兼容 host:port 形式
    const [hostRaw, portStr] = (url || "127.0.0.1:6379").split(":");
    const host = hostRaw || "127.0.0.1";
    const port = parseInt(portStr || "6379", 10);
    return new Redis(port, host, password ? { password } : {});
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      logger.info("Redis连接已建立");
    });

    this.client.on("ready", () => {
      logger.info("Redis客户端已准备就绪");
    });

    this.client.on("error", (error) => {
      logger.error(`Redis错误: ${error.message}`);
    });

    this.client.on("close", () => {
      logger.warn("Redis连接已关闭");
    });

    this.client.on("reconnecting", () => {
      logger.info("正在重新连接Redis...");
    });
  }

  async onModuleInit() {
    // Redis连接在构造函数中已建立
    logger.info("Redis服务初始化完成");
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      logger.info("Redis连接已关闭");
    } catch (error) {
      logger.error("Redis关闭失败:", error);
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Redis工具方法
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error(`Redis SET错误: ${error}`);
      throw error;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`Redis GET错误: ${error}`);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL错误: ${error}`);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS错误: ${error}`);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`Redis EXPIRE错误: ${error}`);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL错误: ${error}`);
      throw error;
    }
  }

  // Redis Set 操作方法
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      logger.error(`Redis SADD错误: ${error}`);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      logger.error(`Redis SMEMBERS错误: ${error}`);
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, ...members);
    } catch (error) {
      logger.error(`Redis SREM错误: ${error}`);
      throw error;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.rpush(key, ...values);
    } catch (error) {
      logger.error(`Redis RPUSH错误: ${error}`);
      throw error;
    }
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lpush(key, ...values);
    } catch (error) {
      logger.error(`Redis LPUSH错误: ${error}`);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      logger.error(`Redis LRANGE错误: ${error}`);
      throw error;
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.client.ltrim(key, start, stop);
    } catch (error) {
      logger.error(`Redis LTRIM错误: ${error}`);
      throw error;
    }
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    try {
      const res = await this.client.set(key, value, "EX", ttlSeconds, "NX");
      return res === "OK";
    } catch (error) {
      logger.error(`Redis SETNX错误: ${error}`);
      throw error;
    }
  }
}
