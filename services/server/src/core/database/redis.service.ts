import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

type Entry = {
  value: string;
  expiresAt?: number;
};

type ListEntry = {
  values: string[];
  expiresAt?: number;
};

type SetEntry = {
  members: Set<string>;
  expiresAt?: number;
};

/**
 * In-process cache compatible with the former RedisService API.
 * Uses memory by default (REDIS_URL empty / memory://). Optional ioredis
 * path is omitted for the docker-free local stack.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly strings = new Map<string, Entry>();
  private readonly lists = new Map<string, ListEntry>();
  private readonly sets = new Map<string, SetEntry>();
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async onModuleInit() {
    const url = this.config.redis.url || "";
    if (url && !url.startsWith("memory://") && url !== "memory") {
      logger.warn(
        `REDIS_URL=${url} ignored; using in-memory cache (docker-free stack)`,
      );
    }
    logger.info("Memory cache (RedisService) initialized");
  }

  async onModuleDestroy() {
    this.strings.clear();
    this.lists.clear();
    this.sets.clear();
  }

  /** @deprecated No external client in memory mode */
  getClient(): null {
    return null;
  }

  private isExpired(expiresAt?: number): boolean {
    return expiresAt != null && Date.now() >= expiresAt;
  }

  private touchExpire(
    map: Map<string, { expiresAt?: number }>,
    key: string,
  ): void {
    const e = map.get(key);
    if (e && this.isExpired(e.expiresAt)) map.delete(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);
    const entry: Entry = { value: serializedValue };
    if (ttl) entry.expiresAt = Date.now() + ttl * 1000;
    this.strings.set(key, entry);
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.touchExpire(this.strings, key);
    const entry = this.strings.get(key);
    if (!entry) return null;
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return entry.value as T;
    }
  }

  async del(key: string): Promise<void> {
    this.strings.delete(key);
    this.lists.delete(key);
    this.sets.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    this.touchExpire(this.strings, key);
    this.touchExpire(this.lists, key);
    this.touchExpire(this.sets, key);
    return this.strings.has(key) || this.lists.has(key) || this.sets.has(key);
  }

  async expire(key: string, ttl: number): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000;
    const s = this.strings.get(key);
    if (s) s.expiresAt = expiresAt;
    const l = this.lists.get(key);
    if (l) l.expiresAt = expiresAt;
    const set = this.sets.get(key);
    if (set) set.expiresAt = expiresAt;
  }

  async ttl(key: string): Promise<number> {
    const entry =
      this.strings.get(key) || this.lists.get(key) || this.sets.get(key);
    if (!entry?.expiresAt) return -1;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    this.touchExpire(this.sets, key);
    let entry = this.sets.get(key);
    if (!entry) {
      entry = { members: new Set() };
      this.sets.set(key, entry);
    }
    let added = 0;
    for (const m of members) {
      if (!entry.members.has(m)) {
        entry.members.add(m);
        added++;
      }
    }
    return added;
  }

  async smembers(key: string): Promise<string[]> {
    this.touchExpire(this.sets, key);
    const entry = this.sets.get(key);
    return entry ? [...entry.members] : [];
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    this.touchExpire(this.sets, key);
    const entry = this.sets.get(key);
    if (!entry) return 0;
    let removed = 0;
    for (const m of members) {
      if (entry.members.delete(m)) removed++;
    }
    return removed;
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    this.touchExpire(this.lists, key);
    let entry = this.lists.get(key);
    if (!entry) {
      entry = { values: [] };
      this.lists.set(key, entry);
    }
    entry.values.push(...values);
    return entry.values.length;
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    this.touchExpire(this.lists, key);
    let entry = this.lists.get(key);
    if (!entry) {
      entry = { values: [] };
      this.lists.set(key, entry);
    }
    entry.values.unshift(...values);
    return entry.values.length;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    this.touchExpire(this.lists, key);
    const entry = this.lists.get(key);
    if (!entry) return [];
    const len = entry.values.length;
    const from = start < 0 ? Math.max(0, len + start) : start;
    const to = stop < 0 ? len + stop + 1 : Math.min(len, stop + 1);
    return entry.values.slice(from, Math.max(from, to));
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    this.touchExpire(this.lists, key);
    const entry = this.lists.get(key);
    if (!entry) return;
    const len = entry.values.length;
    const from = start < 0 ? Math.max(0, len + start) : start;
    const to = stop < 0 ? len + stop + 1 : Math.min(len, stop + 1);
    entry.values = entry.values.slice(from, Math.max(from, to));
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    this.touchExpire(this.strings, key);
    if (this.strings.has(key)) return false;
    await this.set(key, value, ttlSeconds);
    return true;
  }
}
