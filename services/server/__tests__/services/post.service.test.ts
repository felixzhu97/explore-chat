import { describe, it, expect, vi, beforeEach } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PostService } from "@/post/application/post.service";
import type { IPostRepository } from "@/post/domain/post.repository.interface";
import type { IEngagementRepository } from "@/post/domain/engagement.repository.interface";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";
import { KafkaProducerService } from "@/core/messaging/kafka-producer.service";
import { UsersService } from "@/users/application/users.service";
import { AiService } from "@/ai/application/ai.service";
import { VisionClientService } from "@/ai/application/vision-client.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      vision: { enabled: true, moderationEnabled: true, maxImagesPerPost: 10 },
    })),
  },
}));

vi.mock("@/core/database/elasticsearch.service", () => ({
  ElasticsearchService: vi.fn().mockImplementation(() => ({
    getClient: vi.fn().mockReturnValue(null),
  })),
}));

vi.mock("@/core/messaging/kafka-producer.service", () => ({
  KafkaProducerService: vi.fn().mockImplementation(() => ({
    sendPostCreated: vi.fn().mockResolvedValue(undefined),
    sendPostDeleted: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("@/users/application/users.service", () => ({
  UsersService: vi.fn().mockImplementation(() => ({
    getUserById: vi.fn(),
    getUsersByIds: vi.fn(),
  })),
}));

vi.mock("@/ai/application/ai.service", () => ({
  AiService: vi.fn().mockImplementation(() => ({
    moderateText: vi.fn(),
  })),
}));

vi.mock("@/ai/application/vision-client.service", () => ({
  VisionClientService: vi.fn().mockImplementation(() => ({
    moderateFromUrl: vi.fn(),
    moderateVideoFromUrl: vi.fn(),
  })),
}));

describe("PostService", () => {
  let postService: PostService;
  let mockPostRepo: Partial<IPostRepository>;
  let mockEngagementRepo: Partial<IEngagementRepository>;
  let mockElasticsearch: Partial<ElasticsearchService>;
  let mockKafka: Partial<KafkaProducerService>;
  let mockUsersService: Partial<UsersService>;
  let mockAiService: Partial<AiService>;
  let mockVisionClient: Partial<VisionClientService>;

  const mockPostRow = {
    post_id: "post-1",
    user_id: "user-1",
    caption: "Test caption",
    type: "IMAGE",
    media_urls: ["https://example.com/image.jpg"],
    location: "New York",
    cover_url: null,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    mockPostRepo = {
      insertPost: vi.fn().mockResolvedValue(undefined),
      getPostById: vi.fn(),
      deletePost: vi.fn(),
      getPostsByUserId: vi.fn(),
    };

    mockEngagementRepo = {
      getEngagementCounts: vi.fn().mockResolvedValue({
        likeCount: 10,
        commentCount: 5,
        saveCount: 3,
      }),
      getEngagementCountsBatch: vi.fn().mockResolvedValue(new Map()),
      isLiked: vi.fn().mockResolvedValue(false),
      isSaved: vi.fn().mockResolvedValue(false),
    };

    mockElasticsearch = {
      getClient: vi.fn().mockReturnValue(null),
    };

    mockKafka = {
      sendPostCreated: vi.fn().mockResolvedValue(undefined),
      sendPostDeleted: vi.fn().mockResolvedValue(undefined),
    };

    mockUsersService = {
      getUserById: vi.fn(),
      getUsersByIds: vi.fn(),
    };

    mockAiService = {
      moderateText: vi.fn().mockResolvedValue({ safe: true }),
    };

    mockVisionClient = {
      moderateFromUrl: vi
        .fn()
        .mockResolvedValue({ safe: true, categories: [] }),
      moderateVideoFromUrl: vi
        .fn()
        .mockResolvedValue({ safe: true, categories: [] }),
    };

    postService = new PostService(
      mockPostRepo as IPostRepository,
      mockEngagementRepo as IEngagementRepository,
      mockElasticsearch as ElasticsearchService,
      mockKafka as KafkaProducerService,
      mockUsersService as UsersService,
      mockAiService as AiService,
      mockVisionClient as VisionClientService,
    );
  });

  describe("createPost", () => {
    const createPostData = {
      caption: "Test post",
      type: "IMAGE",
      mediaUrls: ["https://example.com/image.jpg"],
      location: "New York",
    };

    it("should create a post successfully", async () => {
      mockPostRepo.insertPost = vi.fn().mockResolvedValue(undefined);

      const result = await postService.createPost("user-1", createPostData);

      expect(result).toHaveProperty("postId");
      expect(result.userId).toBe("user-1");
      expect(result.caption).toBe("Test post");
      expect(mockPostRepo.insertPost).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          caption: "Test post",
          type: "IMAGE",
        }),
      );
    });

    it("should throw BadRequestException for unsafe content", async () => {
      mockAiService.moderateText = vi.fn().mockResolvedValue({ safe: false });

      await expect(
        postService.createPost("user-1", createPostData),
      ).rejects.toThrow(BadRequestException);
    });

    it("should moderate images before posting", async () => {
      mockPostRepo.insertPost = vi.fn().mockResolvedValue(undefined);
      mockVisionClient.moderateFromUrl = vi
        .fn()
        .mockResolvedValue({ safe: true, categories: [] });

      await postService.createPost("user-1", createPostData);

      expect(mockVisionClient.moderateFromUrl).toHaveBeenCalled();
    });

    it("should include optional location in post", async () => {
      mockPostRepo.insertPost = vi.fn().mockResolvedValue(undefined);

      await postService.createPost("user-1", createPostData);

      expect(mockPostRepo.insertPost).toHaveBeenCalledWith(
        expect.objectContaining({
          location: "New York",
        }),
      );
    });

    it("should send Kafka event on post creation", async () => {
      mockPostRepo.insertPost = vi.fn().mockResolvedValue(undefined);

      await postService.createPost("user-1", createPostData);

      expect(mockKafka.sendPostCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          caption: "Test post",
        }),
      );
    });

    it("should handle post without mediaUrls", async () => {
      mockPostRepo.insertPost = vi.fn().mockResolvedValue(undefined);

      const result = await postService.createPost("user-1", {
        caption: "Text only post",
        type: "TEXT",
      });

      expect(result).toHaveProperty("postId");
    });
  });

  describe("getPost", () => {
    it("should return post with engagement counts", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockUsersService.getUserById = vi.fn().mockResolvedValue({
        username: "testuser",
        avatar: "avatar.jpg",
      });

      const result = await postService.getPost("post-1");

      expect(result.postId).toBe("post-1");
      expect(result.likeCount).toBe(10);
      expect(result.commentCount).toBe(5);
      expect(result.username).toBe("testuser");
    });

    it("should throw NotFoundException when post not found", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(null);

      await expect(postService.getPost("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should include user interaction status when currentUserId provided", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockEngagementRepo.isLiked = vi.fn().mockResolvedValue(true);
      mockEngagementRepo.isSaved = vi.fn().mockResolvedValue(false);

      const result = await postService.getPost("post-1", "user-2");

      expect(result.isLiked).toBe(true);
      expect(result.isSaved).toBe(false);
    });

    it("should handle missing author gracefully", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockUsersService.getUserById = vi
        .fn()
        .mockRejectedValue(new Error("User not found"));

      const result = await postService.getPost("post-1");

      expect(result.postId).toBe("post-1");
      expect(result.username).toBeUndefined();
    });
  });

  describe("getPostsBatch", () => {
    it("should return batch of posts with enrichment", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockUsersService.getUsersByIds = vi
        .fn()
        .mockResolvedValue(
          new Map([["user-1", { username: "testuser", avatar: null }]]),
        );

      const result = await postService.getPostsBatch(["post-1"]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("postId");
      expect(result[0]).toHaveProperty("likeCount");
    });

    it("should return empty array for empty input", async () => {
      const result = await postService.getPostsBatch([]);

      expect(result).toEqual([]);
    });

    it("should filter out rejected posts from Elasticsearch", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockUsersService.getUsersByIds = vi.fn().mockResolvedValue(new Map());
      mockElasticsearch.getClient = vi.fn().mockReturnValue({
        mget: vi.fn().mockResolvedValue({
          docs: [{ _id: "post-1", _source: { moderationStatus: "reject" } }],
        }),
      });

      const result = await postService.getPostsBatch(["post-1"]);

      expect(result[0]).toBeNull();
    });

    it("should include autoTags from Elasticsearch", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockUsersService.getUsersByIds = vi.fn().mockResolvedValue(new Map());
      mockElasticsearch.getClient = vi.fn().mockReturnValue({
        mget: vi.fn().mockResolvedValue({
          docs: [
            { _id: "post-1", _source: { autoTags: ["nature", "travel"] } },
          ],
        }),
      });

      const result = await postService.getPostsBatch(["post-1"]);

      expect(result[0]).toHaveProperty("autoTags", ["nature", "travel"]);
    });
  });

  describe("getPostsByUser", () => {
    it("should return paginated posts for a user", async () => {
      mockPostRepo.getPostsByUserId = vi.fn().mockResolvedValue({
        rows: [mockPostRow],
        pageState: "cursor-123",
      });
      mockElasticsearch.getClient = vi.fn().mockReturnValue(null);

      const result = await postService.getPostsByUser("user-1", 10, undefined);

      expect(result.posts).toHaveLength(1);
      expect(result.pageState).toBe("cursor-123");
    });

    it("should filter out rejected posts", async () => {
      mockPostRepo.getPostsByUserId = vi.fn().mockResolvedValue({
        rows: [mockPostRow],
        pageState: undefined,
      });
      mockElasticsearch.getClient = vi.fn().mockReturnValue({
        mget: vi.fn().mockResolvedValue({
          docs: [{ _id: "post-1", _source: { moderationStatus: "reject" } }],
        }),
      });

      const result = await postService.getPostsByUser("user-1", 10, undefined);

      expect(result.posts).toHaveLength(0);
    });
  });

  describe("deletePost", () => {
    it("should delete post successfully", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);
      mockPostRepo.deletePost = vi.fn().mockResolvedValue(undefined);

      const result = await postService.deletePost("post-1", "user-1");

      expect(result).toEqual({ deleted: true });
      expect(mockKafka.sendPostDeleted).toHaveBeenCalledWith({
        postId: "post-1",
        userId: "user-1",
      });
    });

    it("should throw NotFoundException when post not found", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(null);

      await expect(
        postService.deletePost("nonexistent", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when user is not owner", async () => {
      mockPostRepo.getPostById = vi.fn().mockResolvedValue(mockPostRow);

      await expect(postService.deletePost("post-1", "user-2")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
