import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
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
import { UsersService } from "@/users/application/users.service";
import { FollowService } from "@/follow/application/follow.service";
import {
  clampPageSize,
  offsetFromPageToken,
  nextOffsetPageToken,
  pageStateFromPageToken,
  nextPageStateToken,
} from "@/core/aip/page-token";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followService: FollowService,
  ) {}

  @Get("suggestions")
  @ApiOperation({ summary: "List suggested users to follow" })
  async getSuggestions(
    @CurrentUser() user: { id: string },
    @Query("page_size") pageSize?: string,
  ) {
    const users = await this.followService.getSuggestions(
      user.id,
      clampPageSize(pageSize ? parseInt(pageSize, 10) : undefined, 10),
    );
    return { users };
  }

  @Get()
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
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
      total_size: result.pagination.total,
    };
  }

  @Get(":user/followers")
  @ApiOperation({ summary: "List followers" })
  async getFollowers(
    @CurrentUser() user: { id: string },
    @Param("user") id: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const result = await this.followService.getFollowers(
      id,
      pageSize,
      pageStateFromPageToken(pageToken),
      user.id,
    );
    return {
      users: result.list,
      total_size: result.total,
      next_page_token: nextPageStateToken(result.pageState),
    };
  }

  @Get(":user/following")
  @ApiOperation({ summary: "List following" })
  async getFollowing(
    @CurrentUser() user: { id: string },
    @Param("user") id: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const result = await this.followService.getFollowing(
      id,
      pageSize,
      pageStateFromPageToken(pageToken),
      user.id,
    );
    return {
      users: result.list,
      total_size: result.total,
      next_page_token: nextPageStateToken(result.pageState),
    };
  }

  @Get(":user")
  @ApiOperation({ summary: "Get user" })
  async getUser(@Param("user") id: string) {
    const profile = await this.usersService.getUserById(id);
    const [followersCount, followingCount] = await Promise.all([
      this.followService.getFollowersCount(id),
      this.followService.getFollowingCount(id),
    ]);

    return { ...profile, followersCount, followingCount };
  }

  @Patch(":user")
  @ApiOperation({ summary: "Update user" })
  async updateUser(
    @Param("user") id: string,
    @Body()
    updateData: {
      username?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      status?: string;
    },
  ) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(":user")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user" })
  async deleteUser(@Param("user") id: string) {
    await this.usersService.deleteUser(id);
  }

  @Post("following:check")
  @ApiOperation({ summary: "Batch check following state" })
  async checkFollowing(
    @CurrentUser() user: { id: string },
    @Body() body: { userIds?: string[] },
  ) {
    const ids = Array.isArray(body?.userIds) ? body.userIds : [];
    const set = await this.followService.checkFollowing(user.id, ids);
    return {
      results: ids.map((id) => ({ userId: id, isFollowing: set.has(id) })),
    };
  }

  @Post(":user\\:block")
  @ApiOperation({ summary: "Block user" })
  async blockUser(
    @CurrentUser() user: { id: string },
    @Param("user") blockedId: string,
  ) {
    await this.usersService.blockUser(user.id, blockedId);
    return {};
  }

  @Post(":user\\:unblock")
  @ApiOperation({ summary: "Unblock user" })
  async unblockUser(
    @CurrentUser() user: { id: string },
    @Param("user") blockedId: string,
  ) {
    await this.usersService.unblockUser(user.id, blockedId);
    return {};
  }
}
