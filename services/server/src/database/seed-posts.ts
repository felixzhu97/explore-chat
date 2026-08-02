import { Client } from "cassandra-driver";
import { Client as EsClient } from "@elastic/elasticsearch";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./client";
import { ConfigService } from "@/core/config/config.service";
import logger from "@/shared/utils/logger";

if (!process.env["DATABASE_URL"]) {
  process.env["DATABASE_URL"] =
    "postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public";
}

const SAMPLE_CAPTIONS = [
  "Golden hour vibes #sunset",
  "Training day. Stay focused.",
  "New track dropping soon #music",
  "Court side. Let's go.",
  "Coffee and code.",
  "Match day energy #sport",
  "Studio session complete.",
  "Travel diary — day one #travel",
];

/** Prefer demo accounts used by web/mobile so Feed is non-empty after login. */
const PRIORITY_USERNAMES = [
  "serena",
  "cristiano",
  "ladygaga",
  "beyonce",
  "messi",
  "adele",
  "taylor",
  "drake",
  "zendaya",
  "zlatan",
  "neymar",
  "rihanna",
];

async function ensureCassandra(client: Client, keyspace: string) {
  await client.execute(
    `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`,
  );
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${keyspace}.posts (
      user_id text,
      created_at timestamp,
      post_id text,
      caption text,
      type text,
      media_urls list<text>,
      location text,
      cover_url text,
      PRIMARY KEY (user_id, created_at, post_id)
    ) WITH CLUSTERING ORDER BY (created_at DESC, post_id ASC)
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${keyspace}.post_by_id (
      post_id text PRIMARY KEY,
      user_id text,
      created_at timestamp,
      caption text,
      type text,
      media_urls list<text>,
      location text,
      cover_url text
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${keyspace}.feed_by_user (
      user_id text,
      created_at timestamp,
      post_id text,
      author_id text,
      PRIMARY KEY (user_id, created_at, post_id)
    ) WITH CLUSTERING ORDER BY (created_at DESC, post_id ASC)
  `);
  client.keyspace = keyspace;
}

export async function seedPosts(): Promise<void> {
  const config = ConfigService.loadConfig();
  const { contactPoints, keyspace, localDatacenter } = config.cassandra;
  if (!contactPoints.length) {
    logger.warn("Cassandra 未配置，跳过帖子种子");
    return;
  }

  const priorityUsers = await prisma.user.findMany({
    where: { username: { in: PRIORITY_USERNAMES } },
    select: { id: true, username: true },
  });
  const extraUsers = await prisma.user.findMany({
    where: { username: { notIn: PRIORITY_USERNAMES } },
    select: { id: true, username: true },
    take: Math.max(0, 12 - priorityUsers.length),
    orderBy: { username: "asc" },
  });
  const users = [...priorityUsers, ...extraUsers];
  if (users.length === 0) {
    logger.warn("无用户，跳过帖子种子（请先运行 db:seed）");
    return;
  }

  const client = new Client({
    contactPoints,
    localDataCenter: localDatacenter,
  });
  await client.connect();
  await ensureCassandra(client, keyspace);

  const esNode = config.elasticsearch.node;
  const es = esNode
    ? new EsClient({
        node: esNode,
        ...(config.elasticsearch.username &&
          config.elasticsearch.password && {
            auth: {
              username: config.elasticsearch.username,
              password: config.elasticsearch.password,
            },
          }),
      })
    : null;

  let created = 0;
  const posts: {
    postId: string;
    userId: string;
    createdAt: Date;
    caption: string;
  }[] = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i]!;
    const existing = await client.execute(
      `SELECT post_id FROM posts WHERE user_id = ? LIMIT 1`,
      [user.id],
      { prepare: true },
    );
    if (existing.rows.length > 0) {
      continue;
    }

    const perUser = i < 4 ? 2 : 1;
    for (let j = 0; j < perUser; j++) {
      const postId = uuidv4();
      const createdAt = new Date(Date.now() - (i * 3 + j) * 3600_000);
      const caption = SAMPLE_CAPTIONS[(i + j) % SAMPLE_CAPTIONS.length]!;
      const mediaUrl = `https://picsum.photos/seed/${postId.slice(0, 8)}/800/800`;
      await client.execute(
        `INSERT INTO posts (user_id, created_at, post_id, caption, type, media_urls, location, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          createdAt,
          postId,
          caption,
          "IMAGE",
          [mediaUrl],
          null,
          mediaUrl,
        ],
        { prepare: true },
      );
      await client.execute(
        `INSERT INTO post_by_id (post_id, user_id, created_at, caption, type, media_urls, location, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          postId,
          user.id,
          createdAt,
          caption,
          "IMAGE",
          [mediaUrl],
          null,
          mediaUrl,
        ],
        { prepare: true },
      );
      posts.push({ postId, userId: user.id, createdAt, caption });
      created += 1;

      if (es) {
        const hashtags = (caption.match(/#\w+/g) || []).map((t) => t.slice(1));
        try {
          await es.index({
            index: "posts",
            id: postId,
            refresh: true,
            document: {
              postId,
              userId: user.id,
              caption,
              type: "IMAGE",
              hashtags,
              autoTags: [],
              mediaUrls: [mediaUrl],
              createdAt: createdAt.toISOString(),
              moderationStatus: "approved",
            },
          });
        } catch (err) {
          logger.warn(
            `帖子 ES 索引失败 (${postId}): ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }
  }

  // Put newly created posts into every sampled user's feed.
  for (const viewer of users) {
    for (const post of posts) {
      if (post.userId === viewer.id) continue;
      await client.execute(
        `INSERT INTO feed_by_user (user_id, created_at, post_id, author_id) VALUES (?, ?, ?, ?)`,
        [viewer.id, post.createdAt, post.postId, post.userId],
        { prepare: true },
      );
    }
  }

  if (created === 0) {
    logger.info("目标用户均已有帖子，无需补种");
  } else {
    logger.info(`新建 ${created} 条 Cassandra 帖子，并写入 feed_by_user`);
  }
  await client.shutdown();
}

async function main() {
  try {
    await seedPosts();
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
