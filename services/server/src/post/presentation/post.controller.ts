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
import { JwtAuthGuard } from "@/auth/presentation/jwt-auth.guard";
import { CurrentUser } from "@/auth/presentation/current-user.decorator";
import { PostService } from "@/post/application/post.service";
import { FeedService } from "@/post/application/feed.service";
import { EngagementService } from "@/post/application/engagement.service";
import { ExploreService } from "@/post/application/explore.service";

@ApiTags("帖子")
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
  @ApiOperation({ summary: "发帖" })
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
    const data = await this.postService.createPost(user.id, {
      caption: body.caption,
      type: body.type,
      ...(body.mediaUrls != null && { mediaUrls: body.mediaUrls }),
      ...(body.location != null && { location: body.location }),
      ...(body.coverUrl != null &&
        body.coverUrl !== "" && { coverUrl: body.coverUrl }),
    });
    return { success: true, data };
  }

  @Get("feed")
  @ApiOperation({ summary: "获取当前用户 Feed" })
  async getFeed(
    @CurrentUser() user: { id: string },
    @Query("limit") limit = "20",
    @Query("pageState") pageState?: string,
  ) {
    const data = await this.feedService.getFeed(
      user.id,
      parseInt(limit, 10),
      pageState,
    );
    return { success: true, ...data };
  }

  @Get("explore")
  @ApiOperation({ summary: "探索流" })
  async getExplore(
    @CurrentUser() user: { id: string },
    @Query("limit") limit = "20",
    @Query("offset") offset = "0",
  ) {
    const data = await this.exploreService.getExplore(
      user.id,
      Math.min(parseInt(limit, 10) || 20, 50),
      Math.max(0, parseInt(offset, 10) || 0),
    );
    return { success: true, ...data };
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "获取用户帖子列表" })
  async getPostsByUser(
    @Param("userId") userId: string,
    @Query("limit") limit = "20",
    @Query("pageState") pageState?: string,
  ) {
    const data = await this.postService.getPostsByUser(
      userId,
      parseInt(limit, 10),
      pageState,
    );
    return { success: true, ...data };
  }

  @Post(":postId/like")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "点赞" })
  async like(
    @CurrentUser() user: { id: string },
    @Param("postId") postId: string,
  ) {
    const data = await this.engagementService.like(user.id, postId);
    return { success: true, data };
  }

  @Delete(":postId/like")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "取消点赞" })
  async unlike(
    @CurrentUser() user: { id: string },
    @Param("postId") postId: string,
  ) {
    const data = await this.engagementService.unlike(user.id, postId);
    return { success: true, data };
  }

  @Post(":postId/save")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "收藏" })
  async save(
    @CurrentUser() user: { id: string },
    @Param("postId") postId: string,
  ) {
    const data = await this.engagementService.save(user.id, postId);
    return { success: true, data };
  }

  @Delete(":postId/save")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "取消收藏" })
  async unsave(
    @CurrentUser() user: { id: string },
    @Param("postId") postId: string,
  ) {
    const data = await this.engagementService.unsave(user.id, postId);
    return { success: true, data };
  }

  @Get(":postId")
  @ApiOperation({ summary: "获取帖子详情" })
  async getPost(
    @CurrentUser() user: { id: string } | undefined,
    @Param("postId") postId: string,
  ) {
    const data = await this.postService.getPost(postId, user?.id);
    return { success: true, data };
  }

  @Delete(":postId")
  @ApiOperation({ summary: "删除帖子" })
  async deletePost(
    @CurrentUser() user: { id: string },
    @Param("postId") postId: string,
  ) {
    await this.postService.deletePost(postId, user.id);
    return { success: true, message: "已删除" };
  }
}
