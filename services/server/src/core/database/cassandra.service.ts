import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Client } from "cassandra-driver";
import { ConfigService } from "../config/config.service";
import logger from "@/shared/utils/logger";

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private client: Client | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async onModuleInit() {
    const { contactPoints, keyspace, localDatacenter } = this.config.cassandra;
    if (!contactPoints.length) {
      logger.info("Cassandra disabled (no contact points)");
      return;
    }
    try {
      this.client = new Client({
        contactPoints,
        localDataCenter: localDatacenter,
      });
      await this.client.connect();
      await this.ensureKeyspaceAndTables(keyspace);
      this.client.keyspace = keyspace;
      logger.info("Cassandra connected");
    } catch (err) {
      logger.warn(
        `Cassandra connect failed: ${err instanceof Error ? err.message : err}`,
      );
      this.client = null;
    }
  }

  private async ensureKeyspaceAndTables(keyspace: string) {
    if (!this.client) return;
    await this.client.execute(
      `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`,
    );

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${keyspace}.posts (
        user_id text,
        created_at timestamp,
        post_id text,
        caption text,
        type text,
        media_urls list<text>,
        location text,
        PRIMARY KEY (user_id, created_at, post_id)
      ) WITH CLUSTERING ORDER BY (created_at DESC, post_id ASC)
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${keyspace}.feed_by_user (
        user_id text,
        created_at timestamp,
        post_id text,
        author_id text,
        PRIMARY KEY (user_id, created_at, post_id)
      ) WITH CLUSTERING ORDER BY (created_at DESC, post_id ASC)
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${keyspace}.post_by_id (
        post_id text PRIMARY KEY,
        user_id text,
        created_at timestamp,
        caption text,
        type text,
        media_urls list<text>,
        location text
      )
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${keyspace}.post_likes (
        user_id text,
        post_id text,
        created_at timestamp,
        PRIMARY KEY (user_id, post_id)
      )
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${keyspace}.post_saves (
        user_id text,
        post_id text,
        created_at timestamp,
        PRIMARY KEY (user_id, post_id)
      )
    `);

    await this.addColumnIfNeeded(keyspace, "posts", "cover_url", "text");
    await this.addColumnIfNeeded(keyspace, "post_by_id", "cover_url", "text");

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${keyspace}.post_engagement_counts (
        post_id text PRIMARY KEY,
        like_count counter,
        comment_count counter,
        save_count counter
      )
    `);
  }

  private async addColumnIfNeeded(
    keyspace: string,
    table: string,
    column: string,
    ctype: string,
  ) {
    if (!this.client) return;
    try {
      await this.client.execute(
        `ALTER TABLE ${keyspace}.${table} ADD ${column} ${ctype}`,
      );
    } catch {
      // column may already exist
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.shutdown();
      logger.info("Cassandra disconnected");
      this.client = null;
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client != null;
  }
}
