import bcrypt from "bcryptjs";
import uniqBy from "lodash/uniqBy";
import { prisma } from "./client";
import { ConfigService } from "../infrastructure/config/config.service";
import { seedPosts } from "./seed-posts";
import logger from "@/shared/utils/logger";

if (!process.env["DATABASE_URL"]) {
  process.env["DATABASE_URL"] =
    "postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public";
}

const config = ConfigService.loadConfig();

const PERSON_DATA: { username: string; name: string; status: string }[] = [
  { username: "serena", name: "Serena", status: "On the court." },
  { username: "beyonce", name: "Beyonce", status: "On tour." },
  { username: "messi", name: "Messi", status: "Training." },
  { username: "adele", name: "Adele", status: "In the studio." },
  { username: "leonardo", name: "Leonardo", status: "On set." },
  { username: "gisele", name: "Gisele", status: "At the shoot." },
  { username: "roger", name: "Roger", status: "Back on court." },
  { username: "rafa", name: "Rafa", status: "Roland Garros." },
  { username: "venus", name: "Venus", status: "Playing today." },
  { username: "tiger", name: "Tiger", status: "On the green." },
  { username: "kobe", name: "Kobe", status: "Mamba mentality." },
  { username: "shaq", name: "Shaq", status: "Big diesel." },
  { username: "bolt", name: "Bolt", status: "Lightning." },
  { username: "cristiano", name: "Cristiano", status: "SIUUU." },
  { username: "neymar", name: "Neymar", status: "Joga bonito." },
  { username: "zlatan", name: "Zlatan", status: "I am Zlatan." },
  { username: "rihanna", name: "Rihanna", status: "Fenty." },
  { username: "taylor", name: "Taylor", status: "Eras tour." },
  { username: "drake", name: "Drake", status: "OVO." },
  { username: "weeknd", name: "Weeknd", status: "After hours." },
  { username: "ariana", name: "Ariana", status: "Thank u next." },
  { username: "bruno", name: "Bruno", status: "In the room." },
  { username: "edsheeran", name: "Ed", status: "Writing." },
  { username: "justin", name: "Justin", status: "Purpose." },
  { username: "ladygaga", name: "Lady Gaga", status: "Chromatica." },
  { username: "madonna", name: "Madonna", status: "Queen." },
  { username: "elvis", name: "Elvis", status: "King." },
  { username: "michaelj", name: "Michael", status: "Thriller." },
  { username: "freddie", name: "Freddie", status: "Bohemian." },
  { username: "davidb", name: "David", status: "Bowie." },
  { username: "stevie", name: "Stevie", status: "Wonder." },
  { username: "jenniferl", name: "Jennifer", status: "J.Lo." },
  { username: "brad", name: "Brad", status: "On set." },
  { username: "tomh", name: "Tom H", status: "Forrest." },
  { username: "will", name: "Will", status: "Fresh prince." },
  { username: "denzel", name: "Denzel", status: "Training day." },
  { username: "samuel", name: "Samuel", status: "Pulp." },
  { username: "morgan", name: "Morgan", status: "Voice." },
  { username: "robertd", name: "Robert", status: "Downey." },
  { username: "alpacino", name: "Al", status: "Scarface." },
  { username: "angelina", name: "Angelina", status: "Tomb raider." },
  { username: "julia", name: "Julia", status: "Pretty woman." },
  { username: "nicole", name: "Nicole", status: "Moulin." },
  { username: "sandra", name: "Sandra", status: "Oscar." },
  { username: "charlize", name: "Charlize", status: "Fury road." },
  { username: "natalie", name: "Natalie", status: "Black swan." },
  { username: "scarlett", name: "Scarlett", status: "Avenger." },
  { username: "emma", name: "Emma", status: "Hermione." },
  { username: "anneh", name: "Anne H", status: "Devil wears." },
  { username: "katew", name: "Kate W", status: "Winslet." },
  { username: "margot", name: "Margot", status: "Barbie." },
  { username: "gal", name: "Gal", status: "Wonder." },
  { username: "cara", name: "Cara", status: "Runway." },
  { username: "kendall", name: "Kendall", status: "Runway." },
  { username: "gigi", name: "Gigi", status: "Runway." },
  { username: "naomi", name: "Naomi", status: "Super." },
  { username: "cindy", name: "Cindy", status: "Super." },
  { username: "linda", name: "Linda", status: "Super." },
  { username: "heidi", name: "Heidi", status: "Runway." },
  { username: "tyra", name: "Tyra", status: "ANTM." },
  { username: "kateb", name: "Kate B", status: "Vogue." },
  { username: "chrissy", name: "Chrissy", status: "Sports." },
  { username: "emily", name: "Emily", status: "Paris." },
  { username: "zendaya", name: "Zendaya", status: "Euphoria." },
  { username: "timothee", name: "Timothee", status: "Dune." },
  { username: "austin", name: "Austin", status: "Elvis." },
  { username: "florence", name: "Florence", status: "Florence." },
  { username: "adam", name: "Adam", status: "Driver." },
  { username: "oscar", name: "Oscar", status: "Isaac." },
  { username: "pedro", name: "Pedro", status: "Pascal." },
  { username: "idris", name: "Idris", status: "Luther." },
  { username: "michaelb", name: "Michael B", status: "Jordan." },
  { username: "chadwick", name: "Chadwick", status: "Wakanda." },
  { username: "viola", name: "Viola", status: "Davis." },
  { username: "lupita", name: "Lupita", status: "Oscar." },
  { username: "octavia", name: "Octavia", status: "Spencer." },
  { username: "reese", name: "Reese", status: "Witherspoon." },
  { username: "sandrao", name: "Sandra O", status: "Killing." },
  { username: "nicolek", name: "Nicole K", status: "Big little." },
  { username: "mindy", name: "Mindy", status: "Kaling." },
  { username: "priyanka", name: "Priyanka", status: "Jonas." },
  { username: "deepika", name: "Deepika", status: "Bollywood." },
  { username: "jackie", name: "Jackie", status: "Chan." },
  { username: "jet", name: "Jet", status: "Li." },
  { username: "donnie", name: "Donnie", status: "Yen." },
  { username: "keanu", name: "Keanu", status: "Neo." },
  { username: "johnny", name: "Johnny", status: "Depp." },
  { username: "javier", name: "Javier", status: "Bardem." },
  { username: "penelope", name: "Penelope", status: "Cruz." },
  { username: "salma", name: "Salma", status: "Hayek." },
  { username: "eva", name: "Eva", status: "Longoria." },
  { username: "sofia", name: "Sofia", status: "Vergara." },
  { username: "shakira", name: "Shakira", status: "Hips." },
  { username: "jlo", name: "J.Lo", status: "Jenny." },
  { username: "selena", name: "Selena", status: "Gomez." },
  { username: "demi", name: "Demi", status: "Lovato." },
  { username: "miley", name: "Miley", status: "Cyrus." },
  { username: "kelly", name: "Kelly", status: "Clarkson." },
  { username: "christina", name: "Christina", status: "Aguilera." },
  { username: "britney", name: "Britney", status: "Spears." },
  { username: "mariah", name: "Mariah", status: "Carey." },
  { username: "whitney", name: "Whitney", status: "Houston." },
  { username: "celinedion", name: "Celine", status: "Dion." },
  { username: "barbra", name: "Barbra", status: "Streisand." },
  { username: "diana", name: "Diana", status: "Ross." },
  { username: "tina", name: "Tina", status: "Turner." },
  { username: "janet", name: "Janet", status: "Jackson." },
  { username: "prince", name: "Prince", status: "Purple." },
  { username: "lenny", name: "Lenny", status: "Kravitz." },
  { username: "john", name: "John", status: "Legend." },
  { username: "pharrell", name: "Pharrell", status: "Happy." },
  { username: "kanye", name: "Kanye", status: "West." },
  { username: "jayz", name: "Jay-Z", status: "Empire." },
  { username: "eminem", name: "Eminem", status: "Slim." },
  { username: "snoop", name: "Snoop", status: "Dogg." },
  { username: "kendrick", name: "Kendrick", status: "Lamar." },
  { username: "travis", name: "Travis", status: "Scott." },
  { username: "post", name: "Post", status: "Malone." },
  { username: "billie", name: "Billie", status: "Eilish." },
  { username: "dua", name: "Dua", status: "Lipa." },
  { username: "olivia", name: "Olivia", status: "Rodrigo." },
  { username: "doja", name: "Doja", status: "Cat." },
  { username: "megan", name: "Megan", status: "Thee Stallion." },
  { username: "lizzo", name: "Lizzo", status: "Good as hell." },
  { username: "harry", name: "Harry", status: "Styles." },
  { username: "liam", name: "Liam", status: "Payne." },
  { username: "louis", name: "Louis", status: "Tomlinson." },
  { username: "niall", name: "Niall", status: "Horan." },
  { username: "zayn", name: "Zayn", status: "Malik." },
  { username: "admin", name: "Admin", status: "Admin." },
];

export async function main() {
  logger.info("开始数据库种子...");

  PERSON_DATA.sort((a, b) => a.name.localeCompare(b.name, "en"));

  try {
    const existingUserCount = await prisma.user.count();
    if (existingUserCount > 0) {
      logger.info("数据库已有数据，跳过 Postgres 种子；尝试补齐帖子种子…");
      await seedPosts();
      return;
    }

    const saltRounds = config.security.bcrypt.saltRounds;
    const hashedPassword = await bcrypt.hash("123456", saltRounds);

    const users: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
    for (let i = 0; i < PERSON_DATA.length; i++) {
      const p = PERSON_DATA[i]!;
      const initial = p.username[0]!.toUpperCase();
      const user = await prisma.user.create({
        data: {
          username: p.username,
          email: `${p.username}@whatschat.com`,
          phone: `+1 555 ${String(i).padStart(3, "0")} ${String(i).padStart(4, "0")}`,
          password: hashedPassword,
          avatar: `/placeholder.svg?height=40&width=40&text=${initial}`,
          status: p.status,
          isOnline: i % 3 !== 0,
        },
      });
      users.push(user);
    }

    logger.info(`创建了 ${users.length} 个用户`);

    for (const user of users) {
      await prisma.userSettings.create({ data: { userId: user.id } });
    }
    logger.info("创建了用户设置");

    const privateChat1 = await prisma.chat.create({
      data: {
        type: "PRIVATE",
        participants: {
          create: [
            { userId: users[0]!.id, role: "MEMBER" },
            { userId: users[1]!.id, role: "MEMBER" },
          ],
        },
      },
    });

    const groupChat = await prisma.chat.create({
      data: {
        type: "GROUP",
        name: "All Stars",
        avatar: "/placeholder.svg?height=40&width=40&text=A",
        participants: {
          create: users.map((u, i) => ({
            userId: u.id,
            role: i === 0 ? "ADMIN" : "MEMBER",
          })),
        },
      },
    });

    const privateChat2 = await prisma.chat.create({
      data: {
        type: "PRIVATE",
        participants: {
          create: [
            { userId: users[4]!.id, role: "MEMBER" },
            { userId: users[5]!.id, role: "MEMBER" },
          ],
        },
      },
    });

    const ladyGagaUser = users.find(
      (_, i) => PERSON_DATA[i]?.username === "ladygaga",
    );
    const cristianoUser = users.find(
      (_, i) => PERSON_DATA[i]?.username === "cristiano",
    );
    if (ladyGagaUser && cristianoUser) {
      const pc = await prisma.chat.create({
        data: {
          type: "PRIVATE",
          participants: {
            create: [
              { userId: ladyGagaUser.id, role: "MEMBER" },
              { userId: cristianoUser.id, role: "MEMBER" },
            ],
          },
        },
      });
      await prisma.message.create({
        data: {
          chatId: pc.id,
          senderId: cristianoUser.id,
          type: "TEXT",
          content: "Hey Lady Gaga!",
        },
      });
    }
    const ladyGagaIdx = PERSON_DATA.findIndex((p) => p.username === "ladygaga");
    if (ladyGagaIdx >= 0) {
      const others = [0, 1, 16, 17, 22, 24].filter(
        (i) => i !== ladyGagaIdx && i < users.length,
      );
      for (const otherIdx of others) {
        if (otherIdx === ladyGagaIdx) continue;
        const pc = await prisma.chat.create({
          data: {
            type: "PRIVATE",
            participants: {
              create: [
                { userId: users[ladyGagaIdx]!.id, role: "MEMBER" },
                { userId: users[otherIdx]!.id, role: "MEMBER" },
              ],
            },
          },
        });
        await prisma.message.create({
          data: {
            chatId: pc.id,
            senderId: users[otherIdx]!.id,
            type: "TEXT",
            content: `Hey ${PERSON_DATA[ladyGagaIdx]!.name}!`,
          },
        });
      }
    }

    logger.info("创建了聊天");

    const groupMessages = [
      { senderIdx: 0, content: "Welcome to All Stars!" },
      { senderIdx: 1, content: "Happy to be here." },
      { senderIdx: 2, content: "Thanks for the add." },
      { senderIdx: 3, content: "Hello everyone!" },
      { senderIdx: 4, content: "Great group." },
      { senderIdx: 5, content: "Hi all!" },
    ];
    for (let i = 6; i < Math.min(30, users.length); i++) {
      groupMessages.push({
        senderIdx: i,
        content: `Hey from ${PERSON_DATA[i]!.name}!`,
      });
    }

    await prisma.message.create({
      data: {
        chatId: privateChat1.id,
        senderId: users[0]!.id,
        type: "TEXT",
        content: "Hey! Welcome to WhatsChat.",
      },
    });
    await prisma.message.create({
      data: {
        chatId: privateChat1.id,
        senderId: users[1]!.id,
        type: "TEXT",
        content: "Thanks! This app is great.",
      },
    });
    await prisma.message.create({
      data: {
        chatId: privateChat2.id,
        senderId: users[4]!.id,
        type: "TEXT",
        content: "See you at the premiere.",
      },
    });
    await prisma.message.create({
      data: {
        chatId: privateChat2.id,
        senderId: users[5]!.id,
        type: "TEXT",
        content: "Can't wait!",
      },
    });
    for (const m of groupMessages) {
      await prisma.message.create({
        data: {
          chatId: groupChat.id,
          senderId: users[m.senderIdx]!.id,
          type: "TEXT",
          content: m.content,
        },
      });
    }
    logger.info(`创建了 ${4 + groupMessages.length} 条消息`);

    const contactPairs: [number, number][] = [
      [0, 1],
      [1, 0],
      [0, 2],
      [2, 0],
      [4, 5],
      [5, 4],
    ];
    const cristianoIdx = PERSON_DATA.findIndex(
      (p) => p.username === "cristiano",
    );
    if (ladyGagaIdx >= 0) {
      for (const otherIdx of [0, 1, 2, 16, 17, 22, 24, 25]) {
        if (otherIdx >= users.length || otherIdx === ladyGagaIdx) continue;
        contactPairs.push([ladyGagaIdx, otherIdx], [otherIdx, ladyGagaIdx]);
      }
    }
    if (cristianoIdx >= 0 && ladyGagaIdx >= 0) {
      contactPairs.push(
        [cristianoIdx, ladyGagaIdx],
        [ladyGagaIdx, cristianoIdx],
      );
    }
    for (let i = 0; i < Math.min(20, users.length - 1); i += 2) {
      const a = i;
      const b = i + 1;
      if (!contactPairs.some(([x, y]) => x === a && y === b)) {
        contactPairs.push([a, b], [b, a]);
      }
    }
    const uniqueContactPairs = uniqBy(
      contactPairs,
      ([ownerIdx, targetIdx]) => `${ownerIdx}:${targetIdx}`,
    );
    await prisma.contact.createMany({
      data: uniqueContactPairs.flatMap(([ownerIdx, targetIdx]) => {
        if (ownerIdx >= users.length || targetIdx >= users.length) return [];
        const owner = users[ownerIdx]!;
        const target = users[targetIdx]!;
        return [
          {
            ownerId: owner.id,
            name: PERSON_DATA[targetIdx]!.name,
            phone: target.phone,
            email: target.email,
            avatar: target.avatar,
          },
        ];
      }),
      skipDuplicates: true,
    });
    logger.info("创建了联系人关系");

    const statusExpiresAt = new Date();
    statusExpiresAt.setHours(statusExpiresAt.getHours() + 24);
    for (let i = 0; i < users.length; i++) {
      await prisma.status.create({
        data: {
          userId: users[i]!.id,
          type: "TEXT",
          content: PERSON_DATA[i]!.status,
          expiresAt: statusExpiresAt,
        },
      });
    }
    logger.info("创建了状态更新");

    await seedPosts();

    logger.info("数据库种子完成！");
    logger.info(`共 ${users.length} 个测试账户，密码均为: 123456`);
    logger.info(
      "示例: cristiano@whatschat.com (Web默认), ladygaga@whatschat.com (Mobile默认) ...",
    );
  } catch (error) {
    logger.error("数据库种子失败:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
