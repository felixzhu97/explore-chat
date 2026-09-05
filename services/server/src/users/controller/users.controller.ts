import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { UsersService } from "@/users/service/users.service";
import { FollowService } from "@/follow/service/follow.service";

@ApiTags("用户")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followService: FollowService,
  ) {}

  @Get("suggestions")
  @ApiOperation({ summary: "获取推荐关注用户" })
  async getSuggestions(
    @CurrentUser() user: { id: string },
    @Query("limit") limit?: string,
  ) {
    const data = await this.followService.getSuggestions(
      user.id,
      limit ? Math.min(parseInt(limit, 10) || 10, 50) : 10,
    );
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: "获取用户列表" })
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
      message: "获取用户列表成功",
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(":id/followers")
  @ApiOperation({ summary: "获取粉丝列表" })
  async getFollowers(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Query("limit") limit?: string,
    @Query("pageState") pageState?: string,
  ) {
    const result = await this.followService.getFollowers(
      id,
      limit ? parseInt(limit, 10) || 20 : 20,
      pageState,
      user.id,
    );
    return {
      success: true,
      data: result.list,
      total: result.total,
      pageState: result.pageState,
    };
  }

  @Get(":id/following")
  @ApiOperation({ summary: "获取关注列表" })
  async getFollowing(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Query("limit") limit?: string,
    @Query("pageState") pageState?: string,
  ) {
    const result = await this.followService.getFollowing(
      id,
      limit ? parseInt(limit, 10) || 20 : 20,
      pageState,
      user.id,
    );
    return {
      success: true,
      data: result.list,
      total: result.total,
      pageState: result.pageState,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取用户详情" })
  async getUser(@Param("id") id: string) {
    const user = await this.usersService.getUserById(id);
    const [followersCount, followingCount] = await Promise.all([
      this.followService.getFollowersCount(id),
      this.followService.getFollowingCount(id),
    ]);

    return {
      success: true,
      message: "获取用户详情成功",
      data: { ...user, followersCount, followingCount },
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "更新用户信息" })
  async updateUser(
    @Param("id") id: string,
    @Body()
    updateData: {
      username?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      status?: string;
    },
  ) {
    const user = await this.usersService.updateUser(id, updateData);

    return {
      success: true,
      message: "更新用户信息成功",
      data: user,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);

    return {
      success: true,
      message: "用户删除成功",
    };
  }

  @Post("following/check")
  @ApiOperation({ summary: "批量检查关注状态" })
  async checkFollowing(
    @CurrentUser() user: { id: string },
    @Body() body: { userIds?: string[] },
  ) {
    const ids = Array.isArray(body?.userIds) ? body.userIds : [];
    const set = await this.followService.checkFollowing(user.id, ids);
    const data = ids.map((id) => ({ userId: id, isFollowing: set.has(id) }));
    return { success: true, data };
  }

  @Post(":id/block")
  @ApiOperation({ summary: "阻止用户" })
  async blockUser(@CurrentUser() user: any, @Param("id") blockedId: string) {
    await this.usersService.blockUser(user.id, blockedId);

    return {
      success: true,
      message: "用户已被阻止",
    };
  }

  @Delete(":id/block")
  @ApiOperation({ summary: "取消阻止用户" })
  async unblockUser(@CurrentUser() user: any, @Param("id") blockedId: string) {
    await this.usersService.unblockUser(user.id, blockedId);

    return {
      success: true,
      message: "已取消阻止用户",
    };
  }
}
