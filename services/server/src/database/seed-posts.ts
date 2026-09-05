import { v4 as uuidv4 } from "uuid";
import { prisma } from "./client";
import logger from "@/shared/utils/logger";

if (!process.env["DATABASE_URL"]) {
  process.env["DATABASE_URL"] = "file:./dev.db";
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

export async function seedPosts(): Promise<void> {
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

  let created = 0;
  const posts: {
    postId: string;
    userId: string;
    createdAt: Date;
    caption: string;
  }[] = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i]!;
    const existing = await prisma.socialPost.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) continue;

    const perUser = i < 4 ? 2 : 1;
    for (let j = 0; j < perUser; j++) {
      const postId = uuidv4();
      const createdAt = new Date(Date.now() - (i * 3 + j) * 3600_000);
      const caption = SAMPLE_CAPTIONS[(i + j) % SAMPLE_CAPTIONS.length]!;
      const mediaUrl = `https://picsum.photos/seed/${postId.slice(0, 8)}/800/800`;
      await prisma.socialPost.create({
        data: {
          id: postId,
          userId: user.id,
          createdAt,
          caption,
          type: "IMAGE",
          mediaUrls: [mediaUrl],
          coverUrl: mediaUrl,
        },
      });
      const rawTags = caption.match(/#\w+/g) || [];
      for (const t of rawTags) {
        const tag = t.replace(/^#/, "").toLowerCase();
        if (!tag) continue;
        await prisma.hashtag.upsert({
          where: { tag },
          create: { tag },
          update: {},
        });
      }
      posts.push({ postId, userId: user.id, createdAt, caption });
      created += 1;
    }
  }

  for (const viewer of users) {
    for (const post of posts) {
      if (post.userId === viewer.id) continue;
      await prisma.feedEntry.upsert({
        where: {
          userId_postId: { userId: viewer.id, postId: post.postId },
        },
        create: {
          userId: viewer.id,
          authorId: post.userId,
          postId: post.postId,
          createdAt: post.createdAt,
        },
        update: {},
      });
    }
  }

  // Author's own posts also appear in their feed
  for (const post of posts) {
    await prisma.feedEntry.upsert({
      where: {
        userId_postId: { userId: post.userId, postId: post.postId },
      },
      create: {
        userId: post.userId,
        authorId: post.userId,
        postId: post.postId,
        createdAt: post.createdAt,
      },
      update: {},
    });
  }

  if (created === 0) {
    logger.info("目标用户均已有帖子，无需补种");
  } else {
    logger.info(`新建 ${created} 条 SQLite 帖子，并写入 feed_entries`);
  }
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
