import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { PostService } from "@/post/service/post.service";
import { FeedService } from "@/post/service/feed.service";
import { EngagementService } from "@/post/service/engagement.service";
import { ExploreService } from "@/post/service/explore.service";
import {
  clampPageSize,
  pageStateFromPageToken,
  nextPageStateToken,
  offsetFromPageToken,
  nextOffsetPageToken,
} from "@/core/aip/page-token";

@ApiTags("posts")
@Controller("posts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly feedService: FeedService,
    private readonly engagementService: EngagementService,
    private readonly exploreService: ExploreService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create post" })
  async createPost(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      caption: string;
      type: string;
      mediaUrls?: string[];
      location?: string;
      coverUrl?: string;
    },
  ) {
    return this.postService.createPost(user.id, {
      caption: body.caption,
      type: body.type,
      ...(body.mediaUrls != null && { mediaUrls: body.mediaUrls }),
      ...(body.location != null && { location: body.location }),
      ...(body.coverUrl != null &&
        body.coverUrl !== "" && { coverUrl: body.coverUrl }),
    });
  }

  @Get("feed")
  @ApiOperation({ summary: "List feed entries" })
  async getFeed(
    @CurrentUser() user: { id: string },
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const data = await this.feedService.getFeed(
      user.id,
      pageSize,
      pageStateFromPageToken(pageToken),
    );
    return {
      entries: data.entries,
      next_page_token: nextPageStateToken(data.pageState),
    };
  }

  @Get("explore")
  @ApiOperation({ summary: "List explore entries" })
  async getExplore(
    @CurrentUser() user: { id: string },
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const data = await this.exploreService.getExplore(
      user.id,
      Math.min(pageSize, 50),
      offset,
    );
    const entries = data.entries ?? [];
    const hasMore = offset + entries.length < (data.total ?? 0);
    return {
      entries,
      total_size: data.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Get("user/:user")
  @ApiOperation({ summary: "List posts by user" })
  async getPostsByUser(
    @Param("user") userId: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const data = await this.postService.getPostsByUser(
      userId,
      pageSize,
      pageStateFromPageToken(pageToken),
    );
    return {
      posts: data.posts,
      next_page_token: nextPageStateToken(data.pageState),
    };
  }

  @Post(":post\\:like")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Like post" })
  async like(
    @CurrentUser() user: { id: string },
    @Param("post") postId: string,
  ) {
    return this.engagementService.like(user.id, postId);
  }

  @Post(":post\\:unlike")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unlike post" })
  async unlike(
    @CurrentUser() user: { id: string },
    @Param("post") postId: string,
  ) {
    return this.engagementService.unlike(user.id, postId);
  }

  @Post(":post\\:save")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Save post" })
  async save(
    @CurrentUser() user: { id: string },
    @Param("post") postId: string,
  ) {
    return this.engagementService.save(user.id, postId);
  }

  @Post(":post\\:unsave")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unsave post" })
  async unsave(
    @CurrentUser() user: { id: string },
    @Param("post") postId: string,
  ) {
    return this.engagementService.unsave(user.id, postId);
  }

  @Get(":post")
  @ApiOperation({ summary: "Get post" })
  async getPost(
    @CurrentUser() user: { id: string } | undefined,
    @Param("post") postId: string,
  ) {
    return this.postService.getPost(postId, user?.id);
  }

  @Delete(":post")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete post" })
  async deletePost(
    @CurrentUser() user: { id: string },
    @Param("post") postId: string,
  ) {
    await this.postService.deletePost(postId, user.id);
  }
}
