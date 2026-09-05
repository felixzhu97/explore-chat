import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "@/admin/service/admin.service";
import { UsersService } from "@/users/service/users.service";
import { AnalyticsService } from "@/analytics/service/analytics.service";
import {
  clampPageSize,
  offsetFromPageToken,
  nextOffsetPageToken,
} from "@/core/aip/page-token";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get("stats")
  @ApiOperation({ summary: "Get dashboard stats" })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get("users/:id")
  @ApiOperation({ summary: "Get user" })
  async getUser(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch("users/:id")
  @ApiOperation({ summary: "Update user" })
  async updateUser(
    @Param("id") id: string,
    @Body()
    data: {
      username?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      status?: string;
    },
  ) {
    return this.usersService.updateUser(id, data);
  }

  @Delete("users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user" })
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);
  }

  @Get("users")
  @ApiOperation({ summary: "List users" })
  async getUsers(
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
    @Query("search") search?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const result = await this.usersService.getUsers({
      page,
      limit: pageSize,
      ...(search && { search }),
    });
    const hasMore = offset + result.data.length < result.pagination.total;
    return {
      users: result.data,
      total_size: result.pagination.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Get("chats")
  @ApiOperation({ summary: "List chats" })
  async getChats(
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
    @Query("search") search?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const result = await this.adminService.getAllChats(page, pageSize, search);
    const hasMore = offset + result.data.length < result.pagination.total;
    return {
      chats: result.data,
      total_size: result.pagination.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Get("groups")
  @ApiOperation({ summary: "List groups" })
  async getGroups(
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
    @Query("search") search?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const result = await this.adminService.getAllGroups(page, pageSize, search);
    const hasMore = offset + result.data.length < result.pagination.total;
    return {
      groups: result.data,
      total_size: result.pagination.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Get("chats/:chatId/messages")
  @ApiOperation({ summary: "List chat messages" })
  async getChatMessages(
    @Param("chatId") chatId: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
      50,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const result = await this.adminService.getChatMessages(
      chatId,
      page,
      pageSize,
    );
    const hasMore = offset + result.data.length < result.pagination.total;
    return {
      messages: result.data,
      total_size: result.pagination.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Delete("messages/:messageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete message (moderation)" })
  async deleteMessage(@Param("messageId") messageId: string) {
    await this.adminService.deleteMessageAsAdmin(messageId);
  }

  @Get("analytics/overview")
  @ApiOperation({ summary: "Analytics overview" })
  async getAnalyticsOverview(
    @Query("start") startStr: string,
    @Query("end") endStr: string,
  ) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return this.analyticsService.getOverview(start, end);
  }

  @Get("list/posts")
  @ApiOperation({ summary: "List posts with moderation labels" })
  async getPosts(
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
    @Query("search") search?: string,
    @Query("moderationStatus") moderationStatus?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const result = await this.adminService.getPosts(
      page,
      pageSize,
      search,
      moderationStatus,
    );
    const hasMore = offset + result.data.length < result.pagination.total;
    return {
      posts: result.data,
      total_size: result.pagination.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Get("posts/:postId/detail")
  @ApiOperation({ summary: "Post detail with engagement and comments" })
  async getPostDetail(@Param("postId") postId: string) {
    return this.adminService.getPostDetail(postId);
  }

  @Delete("posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete post" })
  async deletePost(@Param("postId") postId: string) {
    await this.adminService.deletePostAdmin(postId);
  }

  @Post("posts/:postId\\:hide")
  @ApiOperation({ summary: "Hide post" })
  async hidePost(@Param("postId") postId: string) {
    await this.adminService.hidePost(postId);
    return {};
  }

  @Post("posts/:postId\\:unhide")
  @ApiOperation({ summary: "Unhide post" })
  async unhidePost(@Param("postId") postId: string) {
    await this.adminService.unhidePost(postId);
    return {};
  }

  @Post("posts/:postId\\:recheckModeration")
  @ApiOperation({ summary: "Recheck post moderation" })
  async recheckModeration(@Param("postId") postId: string) {
    return this.adminService.recheckModeration(postId);
  }

  @Post("posts\\:batchDelete")
  @ApiOperation({ summary: "Batch delete posts" })
  async batchDeletePosts(@Body() body: { postIds: string[] }) {
    const postIds = Array.isArray(body?.postIds) ? body.postIds : [];
    return this.adminService.batchDeletePosts(postIds);
  }

  @Post("posts\\:batchHide")
  @ApiOperation({ summary: "Batch hide posts" })
  async batchHidePosts(@Body() body: { postIds: string[] }) {
    const postIds = Array.isArray(body?.postIds) ? body.postIds : [];
    return this.adminService.batchHidePosts(postIds);
  }

  @Get("content-safety/stats")
  @ApiOperation({ summary: "Content safety moderation stats" })
  async getContentSafetyStats() {
    return this.adminService.getModerationStats();
  }

  @Get("analytics/events")
  @ApiOperation({ summary: "List analytics events" })
  async getAnalyticsEvents(
    @Query("start") startStr: string,
    @Query("end") endStr: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
    @Query("eventName") eventName?: string,
  ) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const result = await this.analyticsService.getEvents({
      start,
      end,
      page,
      limit: pageSize,
      ...(eventName && { eventName }),
    });
    const hasMore = offset + result.data.length < result.total;
    return {
      events: result.data,
      total_size: result.total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }
}
