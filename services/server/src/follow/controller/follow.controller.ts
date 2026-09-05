import {
  Controller,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { FollowService } from "@/follow/service/follow.service";

@ApiTags("follow")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(":user\\:follow")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Follow user" })
  async follow(
    @CurrentUser() user: { id: string },
    @Param("user") userId: string,
  ) {
    return this.followService.follow(user.id, userId);
  }

  @Post(":user\\:unfollow")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unfollow user" })
  async unfollow(
    @CurrentUser() user: { id: string },
    @Param("user") userId: string,
  ) {
    return this.followService.unfollow(user.id, userId);
  }
}
