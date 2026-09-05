import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import type { IPostRepository } from "@/post/domain/post.repository.interface";
import type { IEngagementRepository } from "@/post/domain/engagement.repository.interface";
import { KafkaProducerService } from "@/core/messaging/kafka-producer.service";
import { AiService } from "@/ai/application/ai.service";
import { UsersService } from "@/users/service/users.service";
import { VisionClientService } from "@/ai/application/vision-client.service";
import { ConfigService } from "@/core/config/config.service";
import { FeedFanoutService } from "@/post/application/feed-fanout.service";
import { SearchService } from "@/search/application/search.service";
import { HTTP_URL_PREFIX, parseDataUrl } from "@/shared/utils/media-url";
import logger from "@/shared/utils/logger";
import { v4 as uuidv4 } from "uuid";

export interface CreatePostData {
  caption: string;
  type: string;
  mediaUrls?: string[];
  location?: string;
  coverUrl?: string;
}

@Injectable()
export class PostService {
  constructor(
    @Inject("IPostRepository")
    private readonly postRepo: IPostRepository,
    @Inject("IEngagementRepository")
    private readonly engagementRepo: IEngagementRepository,
    private readonly kafka: KafkaProducerService,
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
    private readonly visionClient: VisionClientService,
    private readonly feedFanout: FeedFanoutService,
    private readonly searchService: SearchService,
  ) {}

  async createPost(userId: string, data: CreatePostData) {
    const caption = (data.caption ?? "").trim();
    const textMod = await this.aiService.moderateText(caption);
    if (!textMod.safe) {
      throw new BadRequestException("Content violates community guidelines");
    }
    const mediaUrls = data.mediaUrls ?? [];
    const config = ConfigService.loadConfig();
    if (
      config.vision.enabled &&
      config.vision.moderationEnabled &&
      mediaUrls.length > 0
    ) {
      const urls = mediaUrls
        .slice(0, config.vision.maxImagesPerPost)
        .filter((u): u is string => typeof u === "string");
      if (data.type === "VIDEO") {
        const firstUrl = urls[0];
        if (firstUrl && HTTP_URL_PREFIX.test(firstUrl)) {
          try {
            const mod = await this.visionClient.moderateVideoFromUrl(firstUrl);
            if (!mod.safe) {
              const real = mod.categories.filter((c) => c.label !== "error");
              if (real.length > 0)
                throw new BadRequestException(
                  "Content violates community guidelines",
                );
            }
          } catch (err) {
            if (err instanceof BadRequestException) throw err;
            logger.warn(
              `Sync video moderation failed: ${err instanceof Error ? err.message : String(err)}`,
            );
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
              if (real.length > 0)
                throw new BadRequestException(
                  "Content violates community guidelines",
                );
            }
          } catch (err) {
            if (err instanceof BadRequestException) throw err;
            logger.warn(
              `Sync image moderation failed: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      }
    }
    const postId = uuidv4();
    await this.postRepo.insertPost({
      postId,
      userId,
      caption: data.caption,
      type: data.type,
      mediaUrls,
      ...(data.location != null &&
        data.location !== "" && { location: data.location }),
      ...(data.coverUrl != null &&
        data.coverUrl !== "" && { coverUrl: data.coverUrl }),
    });
    const createdAt = new Date().toISOString();
    await this.searchService.indexPost(postId, data.caption);
    await this.feedFanout.fanoutPostCreated({
      postId,
      userId,
      createdAt,
      caption: data.caption,
    });
    // Optional Kafka (no-op when brokers empty)
    await this.kafka.sendPostCreated({
      postId,
      userId,
      createdAt,
      caption: data.caption,
      type: data.type,
      ...(data.location && data.location !== "" && { location: data.location }),
    });
    return { postId, userId, createdAt, ...data };
  }

  async getPost(postId: string, currentUserId?: string) {
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    let username: string | undefined;
    let avatar: string | undefined;
    try {
      const user = await this.usersService.getUserById(row.user_id);
      username = user?.username;
      avatar = user?.avatar ?? undefined;
    } catch {
      // author not found, leave username/avatar undefined
    }
    const counts = await this.engagementRepo.getEngagementCounts(postId);
    const result: Record<string, unknown> = {
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at,
      caption: row.caption,
      type: row.type,
      mediaUrls: row.media_urls,
      location: row.location,
      ...(row.cover_url != null &&
        row.cover_url !== "" && { coverUrl: row.cover_url }),
      likeCount: counts.likeCount,
      commentCount: counts.commentCount,
      saveCount: counts.saveCount,
      ...(username != null && { username }),
      ...(avatar != null && { avatar }),
    };
    if (currentUserId) {
      const [isLiked, isSaved] = await Promise.all([
        this.engagementRepo.isLiked(currentUserId, postId),
        this.engagementRepo.isSaved(currentUserId, postId),
      ]);
      result["isLiked"] = isLiked;
      result["isSaved"] = isSaved;
    }
    return result;
  }

  async getPostsBatch(
    postIds: string[],
    currentUserId?: string,
  ): Promise<(Record<string, unknown> | null)[]> {
    if (postIds.length === 0) return [];
    const rows = await Promise.all(
      postIds.map((id) => this.postRepo.getPostById(id)),
    );
    const authorIds = uniq(compact(rows.map((row) => row?.user_id)));
    const [userMap, countsMap] = await Promise.all([
      this.usersService.getUsersByIds(authorIds),
      this.engagementRepo.getEngagementCountsBatch(postIds),
    ]);
    let likedSaved: [boolean, boolean][] = [];
    if (currentUserId) {
      likedSaved = await Promise.all(
        postIds.map((pid) =>
          Promise.all([
            this.engagementRepo.isLiked(currentUserId, pid),
            this.engagementRepo.isSaved(currentUserId, pid),
          ]),
        ),
      );
    }
    return postIds.map((postId, idx) => {
      const row = rows[idx];
      if (!row) return null;
      const author = userMap.get(row.user_id);
      const counts = countsMap.get(postId) ?? {
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
      };
      const result: Record<string, unknown> = {
        postId: row.post_id,
        userId: row.user_id,
        createdAt: row.created_at,
        caption: row.caption,
        type: row.type,
        mediaUrls: row.media_urls,
        location: row.location,
        ...(row.cover_url != null &&
          row.cover_url !== "" && { coverUrl: row.cover_url }),
        likeCount: counts.likeCount,
        commentCount: counts.commentCount,
        saveCount: counts.saveCount,
        ...(author && {
          username: author.username,
          avatar: author.avatar ?? undefined,
        }),
      };
      if (currentUserId && likedSaved[idx]) {
        result["isLiked"] = likedSaved[idx][0];
        result["isSaved"] = likedSaved[idx][1];
      }
      return result;
    });
  }

  async getPostsByUser(userId: string, limit: number, pageState?: string) {
    const { rows, pageState: next } = await this.postRepo.getPostsByUserId(
      userId,
      limit,
      pageState,
    );
    return {
      posts: rows.map((r) => ({
        postId: r.post_id,
        userId: r.user_id,
        createdAt: r.created_at,
        caption: r.caption,
        type: r.type,
        mediaUrls: r.media_urls,
        location: r.location,
        ...(r.cover_url != null &&
          r.cover_url !== "" && { coverUrl: r.cover_url }),
      })),
      pageState: next,
    };
  }

  async deletePost(postId: string, userId: string) {
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    if (row.user_id !== userId) throw new NotFoundException("Forbidden");
    await this.postRepo.deletePost(postId, userId);
    await this.kafka.sendPostDeleted({ postId, userId });
    return { deleted: true };
  }
}
