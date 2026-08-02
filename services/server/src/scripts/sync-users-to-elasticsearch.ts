import { Client } from "@elastic/elasticsearch";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@/core/config/config.service";

const config = ConfigService.loadConfig();
const prisma = new PrismaClient();

async function main() {
  const { node, username, password } = config.elasticsearch;
  if (!node) {
    console.error("Elasticsearch not configured (no node)");
    process.exit(1);
  }
  const client = new Client({
    node,
    ...(username && password && { auth: { username, password } }),
  });
  const users = await prisma.user.findMany({
    select: { id: true, username: true, avatar: true, createdAt: true },
  });
  for (const u of users) {
    await client.index({
      index: "users",
      id: u.id,
      document: {
        id: u.id,
        username: u.username,
        ...(u.avatar != null && { avatar: u.avatar }),
        createdAt: u.createdAt.toISOString(),
      },
    });
  }
  console.log(`Synced ${users.length} users to Elasticsearch`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
