import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { RedisService } from "../database/redis.service";

const KEY_PREFIX = "cache:";

@Injectable()
export class CacheService {
  private readonly defaultTtl: number;

  constructor(private readonly redis: RedisService) {
    this.defaultTtl = ConfigService.loadConfig().redis.cacheTtlSeconds;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(KEY_PREFIX + key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.redis.set(
      KEY_PREFIX + key,
      value,
      ttlSeconds ?? this.defaultTtl,
    );
  }

  async del(key: string): Promise<void> {
    await this.redis.del(KEY_PREFIX + key);
  }

  async delMany(keys: string[]): Promise<void> {
    for (const k of keys) {
      await this.redis.del(KEY_PREFIX + k);
    }
  }
}
