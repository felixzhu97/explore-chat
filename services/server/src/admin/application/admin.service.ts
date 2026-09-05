import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import { PrismaService } from "@/core/database/prisma.service";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";
import type { PostRepository } from "@/post/domain/repository/post.repository";
import type { EngagementRepository } from "@/post/domain/repository/engagement.repository";
import type { CommentRepository } from "@/comments/domain/repository/comment.repository";
import { VisionClientService } from "@/ai/application/vision-client.service";
import { ConfigService } from "@/core/config/config.service";
import { HTTP_URL_PREFIX, parseDataUrl } from "@/shared/utils/media-url";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
    @Inject("PostRepository")
    private readonly postRepo: PostRepository,
    @Inject("EngagementRepository")
    private readonly engagementRepo: EngagementRepository,
    @Inject("CommentRepository")
    private readonly commentRepo: CommentRepository,
    private readonly visionClient: VisionClientService,
  ) {}

  async getStats() {
    const [
      totalUsers,
      totalChats,
      totalGroups,
      totalMessages,
      onlineUsers,
      todayMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.chat.count(),
      this.prisma.group.count(),
      this.prisma.message.count(),
      this.prisma.user.count({ where: { isOnline: true } }),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const messagesByType = await this.prisma.message.groupBy({
      by: ["type"],
      _count: { id: true },
    });

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
      },
    });

    return {
      totalUsers,
      totalChats,
      totalGroups,
      totalMessages,
      onlineUsers,
      todayMessages,
      messagesByType: mapValues(
        keyBy(messagesByType, "type"),
        (item) => item?._count.id ?? 0,
      ) as Record<string, number>,
      recentUsers,
    };
  }

  async getAllChats(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        {
          participants: {
            some: {
              user: {
                OR: [
                  { username: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            },
          },
        },
      ];
    }

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatar: true,
                  isOnline: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.chat.count({ where }),
    ]);

    return {
      data: chats.map((chat) => ({
        id: chat.id,
        type: chat.type,
        name: chat.name,
        avatar: chat.avatar,
        participants: chat.participants.map((p) => ({
          ...p.user,
          role: p.role,
        })),
        lastMessage: chat.messages[0] || null,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllGroups(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        {
          creator: {
            OR: [
              { username: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      ];
    }

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  isOnline: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        avatar: g.avatar,
        creator: g.creator,
        participants: g.participants.map((p) => ({
          ...p.user,
          role: p.role,
        })),
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChatMessages(chatId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { chatId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.message.count({ where: { chatId } }),
    ]);

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteMessageAsAdmin(messageId: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: "[已删除]",
        isDeleted: true,
      },
    });
    return { success: true };
  }

  async getModerationStats(): Promise<{
    pass: number;
    reject: number;
    pending: number;
  }> {
    const client = this.elasticsearch.getClient();
    if (!client) {
      return { pass: 0, reject: 0, pending: 0 };
    }
    try {
      const [passRes, rejectRes, pendingRes] = await Promise.all([
        client.count({
          index: "posts",
          query: { term: { moderationStatus: "pass" } },
        }),
        client.count({
          index: "posts",
          query: { term: { moderationStatus: "reject" } },
        }),
        client.count({
          index: "posts",
          query: {
            bool: {
              must_not: [
                { term: { moderationStatus: "pass" } },
                { term: { moderationStatus: "reject" } },
              ],
            },
          },
        }),
      ]);
      return {
        pass: passRes.count ?? 0,
        reject: rejectRes.count ?? 0,
        pending: pendingRes.count ?? 0,
      };
    } catch {
      return { pass: 0, reject: 0, pending: 0 };
    }
  }

  async getPosts(
    page = 1,
    limit = 20,
    search?: string,
    moderationStatus?: string,
  ) {
    const client = this.elasticsearch.getClient();
    if (!client) {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    const from = (page - 1) * limit;
    const must: Record<string, unknown>[] = [];
    if (search?.trim()) {
      must.push({
        bool: {
          should: [
            { match: { caption: search } },
            { match: { hashtags: search } },
            { match: { autoTags: search } },
          ],
          minimum_should_match: 1,
        },
      });
    }
    if (moderationStatus === "pass" || moderationStatus === "reject") {
      must.push({ term: { moderationStatus } });
    } else if (moderationStatus === "pending") {
      must.push({
        bool: {
          must_not: [
            { term: { moderationStatus: "pass" } },
            { term: { moderationStatus: "reject" } },
          ],
        },
      });
    }
    const query: Record<string, unknown> =
      must.length > 0 ? { bool: { must } } : { match_all: {} };
    const result = await client.search({
      index: "posts",
      from,
      size: limit,
      query,
      sort: [{ createdAt: { order: "desc" } }],
      _source: [
        "postId",
        "userId",
        "caption",
        "hashtags",
        "autoTags",
        "mediaUrls",
        "createdAt",
        "moderationStatus",
        "moderationCategories",
        "moderationAt",
        "hidden",
      ],
    });
    const hits = (result.hits.hits || []) as Array<{
      _source: Record<string, unknown>;
    }>;
    const total =
      typeof result.hits.total === "object"
        ? (result.hits.total as { value: number }).value
        : ((result.hits.total as number) ?? 0);
    const postIds = hits
      .map((h) => h._source["postId"] as string)
      .filter(Boolean);
    const mediaByPostId = new Map<string, string[]>();
    const metaByPostId = new Map<
      string,
      { type: string; location: string | null; coverUrl: string | null }
    >();
    await Promise.all(
      postIds.map(async (postId) => {
        const row = await this.postRepo.getPostById(postId);
        if (row) {
          if (row.media_urls?.length) mediaByPostId.set(postId, row.media_urls);
          metaByPostId.set(postId, {
            type: row.type ?? "TEXT",
            location: row.location ?? null,
            coverUrl: row.cover_url ?? null,
          });
        }
      }),
    );
    const data = hits.map((h) => {
      const postId = h._source["postId"] as string;
      const mediaUrls =
        mediaByPostId.get(postId) ??
        (h._source["mediaUrls"] as string[] | undefined);
      const meta = metaByPostId.get(postId);
      return {
        ...h._source,
        mediaUrls: mediaUrls ?? [],
        type: meta?.type ?? (h._source["type"] as string) ?? "TEXT",
        location:
          meta?.location ??
          (h._source["location"] as string | undefined) ??
          null,
        coverUrl:
          meta?.coverUrl ??
          (h._source["coverUrl"] as string | undefined) ??
          null,
        moderationStatus: h._source["moderationStatus"] ?? "pending",
        moderationCategories:
          (h._source["moderationCategories"] as string[] | undefined) ?? [],
        moderationAt: h._source["moderationAt"] ?? null,
        hidden: h._source["hidden"] === true,
      };
    });
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostDetail(postId: string): Promise<{
    post: Record<string, unknown>;
    engagement: { likeCount: number; commentCount: number; saveCount: number };
    comments: Array<{
      id: string;
      userId: string;
      content: string;
      parentId?: string;
      createdAt: string;
    }>;
  }> {
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    let moderationStatus = "pending";
    let moderationCategories: string[] = [];
    let moderationAt: string | null = null;
    let hidden = false;
    let hashtags: string[] | undefined;
    let autoTags: string[] | undefined;
    const client = this.elasticsearch.getClient();
    if (client) {
      try {
        const hit = await client.get({ index: "posts", id: postId });
        const src = (hit as { _source?: Record<string, unknown> })._source;
        if (src) {
          moderationStatus = (src["moderationStatus"] as string) ?? "pending";
          moderationCategories =
            (src["moderationCategories"] as string[]) ?? [];
          moderationAt = (src["moderationAt"] as string) ?? null;
          hidden = src["hidden"] === true;
          if (Array.isArray(src["hashtags"]))
            hashtags = src["hashtags"] as string[];
          if (Array.isArray(src["autoTags"]))
            autoTags = src["autoTags"] as string[];
        }
      } catch {
        // ignore
      }
    }
    const engagement = await this.engagementRepo.getEngagementCounts(postId);
    const commentDocs = await this.commentRepo.findByPostId(postId, 100, 0);
    const comments = commentDocs.map((doc) => ({
      id: doc._id?.toString() ?? "",
      userId: doc.userId,
      content: doc.content,
      ...(doc.parentId != null && { parentId: doc.parentId }),
      createdAt:
        doc.createdAt instanceof Date
          ? doc.createdAt.toISOString()
          : String(doc.createdAt),
    }));
    const post = {
      postId: row.post_id,
      userId: row.user_id,
      type: row.type ?? "TEXT",
      caption: row.caption ?? "",
      hashtags: hashtags ?? [],
      autoTags: autoTags ?? [],
      mediaUrls: row.media_urls ?? [],
      coverUrl: row.cover_url ?? null,
      location: row.location ?? null,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      moderationStatus,
      moderationCategories,
      moderationAt,
      hidden,
    };
    return { post, engagement, comments };
  }

  async deletePostAdmin(postId: string): Promise<void> {
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    await this.postRepo.deletePost(postId, row.user_id);
    const client = this.elasticsearch.getClient();
    if (client) {
      try {
        await client.delete({ index: "posts", id: postId });
      } catch {
        // ignore if doc missing
      }
    }
  }

  async hidePost(postId: string): Promise<void> {
    const client = this.elasticsearch.getClient();
    if (!client) throw new NotFoundException("Elasticsearch not available");
    try {
      await client.update({
        index: "posts",
        id: postId,
        body: { doc: { hidden: true }, doc_as_upsert: false },
      });
    } catch (e: unknown) {
      const err =
        e && typeof e === "object"
          ? (e as { meta?: { body?: { error?: { type?: string } } } })
          : null;
      const errorType = err?.meta?.body?.error?.type;
      if (errorType !== "document_missing_exception") throw e;
    }
  }

  async unhidePost(postId: string): Promise<void> {
    const client = this.elasticsearch.getClient();
    if (!client) throw new NotFoundException("Elasticsearch not available");
    await client.update({
      index: "posts",
      id: postId,
      body: { doc: { hidden: false }, doc_as_upsert: false },
    });
  }

  async recheckModeration(postId: string): Promise<{
    moderationStatus: string;
    moderationCategories: string[];
    moderationAt: string;
  }> {
    const config = ConfigService.loadConfig();
    if (!config.vision.enabled || !config.vision.moderationEnabled) {
      return {
        moderationStatus: "pending",
        moderationCategories: [],
        moderationAt: new Date().toISOString(),
      };
    }
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    const rawUrls = row.media_urls ?? [];
    const urls = rawUrls
      .slice(0, config.vision.maxImagesPerPost)
      .filter((u): u is string => typeof u === "string");
    let moderationRejected = false;
    const moderationCategorySet = new Set<string>();
    const firstUrl = urls[0];
    if (row.type === "VIDEO" && firstUrl && HTTP_URL_PREFIX.test(firstUrl)) {
      const mod = await this.visionClient.moderateVideoFromUrl(firstUrl);
      if (!mod.safe) {
        const real = mod.categories.filter((c) => c.label !== "error");
        if (real.length > 0) {
          moderationRejected = true;
          real.forEach((c) => moderationCategorySet.add(c.label));
        }
      }
    } else {
      for (const url of urls) {
        try {
          let mod: { safe: boolean; categories: { label: string }[] };
          if (HTTP_URL_PREFIX.test(url)) {
            mod = await this.visionClient.moderateFromUrl(url);
          } else {
            const parsed = parseDataUrl(url);
            if (!parsed) continue;
            mod = await this.visionClient.moderateFromBuffer(
              parsed.buffer,
              parsed.mimeType,
            );
          }
          if (!mod.safe) {
            const real = mod.categories.filter((c) => c.label !== "error");
            if (real.length > 0) {
              moderationRejected = true;
              real.forEach((c) => moderationCategorySet.add(c.label));
            }
          }
        } catch {
          // skip failed media
        }
      }
    }
    const moderationAt = new Date().toISOString();
    const moderationStatus = moderationRejected ? "reject" : "pass";
    const moderationCategories = Array.from(moderationCategorySet);
    const es = this.elasticsearch.getClient();
    if (es) {
      try {
        await es.update({
          index: "posts",
          id: postId,
          body: {
            doc: { moderationStatus, moderationCategories, moderationAt },
            doc_as_upsert: false,
          },
        });
      } catch {
        // ignore
      }
    }
    return { moderationStatus, moderationCategories, moderationAt };
  }

  async batchDeletePosts(
    postIds: string[],
  ): Promise<{ deleted: number; failed: string[] }> {
    const failed: string[] = [];
    for (const postId of postIds) {
      try {
        const row = await this.postRepo.getPostById(postId);
        if (!row) {
          failed.push(postId);
          continue;
        }
        await this.postRepo.deletePost(postId, row.user_id);
        const client = this.elasticsearch.getClient();
        if (client) {
          try {
            await client.delete({ index: "posts", id: postId });
          } catch {
            // ignore
          }
        }
      } catch {
        failed.push(postId);
      }
    }
    return { deleted: postIds.length - failed.length, failed };
  }

  async batchHidePosts(
    postIds: string[],
  ): Promise<{ hidden: number; failed: string[] }> {
    const client = this.elasticsearch.getClient();
    if (!client) throw new NotFoundException("Elasticsearch not available");
    const failed: string[] = [];
    for (const postId of postIds) {
      try {
        await client.update({
          index: "posts",
          id: postId,
          body: { doc: { hidden: true }, doc_as_upsert: false },
        });
      } catch {
        failed.push(postId);
      }
    }
    return { hidden: postIds.length - failed.length, failed };
  }
}
