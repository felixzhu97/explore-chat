import { Controller, Post, Delete, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { FollowService } from "@/follow/application/follow.service";

@ApiTags("关注")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(":userId/follow")
  @ApiOperation({ summary: "关注用户" })
  async follow(
    @CurrentUser() user: { id: string },
    @Param("userId") userId: string,
  ) {
    const data = await this.followService.follow(user.id, userId);
    return { success: true, data };
  }

  @Delete(":userId/follow")
  @ApiOperation({ summary: "取消关注" })
  async unfollow(
    @CurrentUser() user: { id: string },
    @Param("userId") userId: string,
  ) {
    const data = await this.followService.unfollow(user.id, userId);
    return { success: true, data };
  }
}
