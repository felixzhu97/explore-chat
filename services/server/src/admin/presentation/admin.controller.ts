import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/presentation/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "@/admin/application/admin.service";
import { UsersService } from "@/users/application/users.service";
import { AnalyticsService } from "@/analytics/application/analytics.service";

@ApiTags("管理员")
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
  @ApiOperation({ summary: "获取仪表盘统计" })
  async getStats() {
    const stats = await this.adminService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get("users/:id")
  @ApiOperation({ summary: "获取用户详情" })
  async getUser(@Param("id") id: string) {
    const user = await this.usersService.getUserById(id);
    return { success: true, data: user };
  }

  @Put("users/:id")
  @ApiOperation({ summary: "更新用户" })
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
    const user = await this.usersService.updateUser(id, data);
    return { success: true, data: user };
  }

  @Delete("users/:id")
  @ApiOperation({ summary: "删除用户" })
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);
    return { success: true, message: "用户已删除" };
  }

  @Get("users")
  @ApiOperation({ summary: "获取所有用户" })
  async getUsers(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("search") search?: string,
  ) {
    const result = await this.usersService.getUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      ...(search && { search }),
    });
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get("chats")
  @ApiOperation({ summary: "获取所有聊天" })
  async getChats(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("search") search?: string,
  ) {
    const result = await this.adminService.getAllChats(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get("groups")
  @ApiOperation({ summary: "获取所有群组" })
  async getGroups(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("search") search?: string,
  ) {
    const result = await this.adminService.getAllGroups(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get("chats/:chatId/messages")
  @ApiOperation({ summary: "获取聊天消息" })
  async getChatMessages(
    @Param("chatId") chatId: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "50",
  ) {
    const result = await this.adminService.getChatMessages(
      chatId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return {
      success: true,
      ...result,
    };
  }

  @Delete("messages/:messageId")
  @ApiOperation({ summary: "删除消息(内容审核)" })
  async deleteMessage(@Param("messageId") messageId: string) {
    await this.adminService.deleteMessageAsAdmin(messageId);
    return {
      success: true,
      message: "消息已删除",
    };
  }

  @Get("analytics/overview")
  @ApiOperation({ summary: "行为分析概览" })
  async getAnalyticsOverview(
    @Query("start") startStr: string,
    @Query("end") endStr: string,
  ) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const data = await this.analyticsService.getOverview(start, end);
    return { success: true, data };
  }

  @Get("list/posts")
  @ApiOperation({ summary: "获取帖子列表（含识别标签）" })
  async getPosts(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("search") search?: string,
    @Query("moderationStatus") moderationStatus?: string,
  ) {
    const result = await this.adminService.getPosts(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
      moderationStatus,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get("posts/:postId/detail")
  @ApiOperation({ summary: "帖子详情（含互动数与评论）" })
  async getPostDetail(@Param("postId") postId: string) {
    const result = await this.adminService.getPostDetail(postId);
    return { success: true, data: result };
  }

  @Delete("posts/:postId")
  @ApiOperation({ summary: "物理删除帖子" })
  async deletePost(@Param("postId") postId: string) {
    await this.adminService.deletePostAdmin(postId);
    return { success: true, message: "Post deleted" };
  }

  @Put("posts/:postId/hide")
  @ApiOperation({ summary: "隐藏帖子" })
  async hidePost(@Param("postId") postId: string) {
    await this.adminService.hidePost(postId);
    return { success: true, message: "Post hidden" };
  }

  @Put("posts/:postId/unhide")
  @ApiOperation({ summary: "取消隐藏帖子" })
  async unhidePost(@Param("postId") postId: string) {
    await this.adminService.unhidePost(postId);
    return { success: true, message: "Post unhidden" };
  }

  @Post("posts/:postId/recheck-moderation")
  @ApiOperation({ summary: "重新识别违规内容" })
  async recheckModeration(@Param("postId") postId: string) {
    const result = await this.adminService.recheckModeration(postId);
    return { success: true, data: result };
  }

  @Post("posts/batch-delete")
  @ApiOperation({ summary: "批量物理删除帖子" })
  async batchDeletePosts(@Body() body: { postIds: string[] }) {
    const postIds = Array.isArray(body?.postIds) ? body.postIds : [];
    const result = await this.adminService.batchDeletePosts(postIds);
    return { success: true, data: result };
  }

  @Post("posts/batch-hide")
  @ApiOperation({ summary: "批量隐藏帖子" })
  async batchHidePosts(@Body() body: { postIds: string[] }) {
    const postIds = Array.isArray(body?.postIds) ? body.postIds : [];
    const result = await this.adminService.batchHidePosts(postIds);
    return { success: true, data: result };
  }

  @Get("content-safety/stats")
  @ApiOperation({ summary: "内容安全审核统计" })
  async getContentSafetyStats() {
    const stats = await this.adminService.getModerationStats();
    return { success: true, data: stats };
  }

  @Get("analytics/events")
  @ApiOperation({ summary: "行为分析事件列表" })
  async getAnalyticsEvents(
    @Query("start") startStr: string,
    @Query("end") endStr: string,
    @Query("page") pageStr?: string,
    @Query("limit") limitStr?: string,
    @Query("eventName") eventName?: string,
  ) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const result = await this.analyticsService.getEvents({
      start,
      end,
      page,
      limit,
      ...(eventName && { eventName }),
    });
    return { success: true, ...result };
  }
}
