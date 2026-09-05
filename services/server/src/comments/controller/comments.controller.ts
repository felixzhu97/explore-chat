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
import { CommentService } from "@/comments/service/comment.service";

@ApiTags("评论")
@Controller("posts/:postId/comments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "发表评论" })
  async create(
    @Param("postId") postId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { content: string; parentId?: string },
  ) {
    const data = await this.commentService.create(
      postId,
      user.id,
      body.content,
      body.parentId,
    );
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: "获取帖子评论列表" })
  async list(
    @Param("postId") postId: string,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    const list = await this.commentService.findByPostId(
      postId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return { success: true, data: list };
  }
}

@ApiTags("评论")
@Controller("comments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentDeleteController {
  constructor(private readonly commentService: CommentService) {}

  @Delete(":id")
  @ApiOperation({ summary: "删除评论" })
  async delete(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    await this.commentService.delete(id, user.id);
    return { success: true, message: "已删除" };
  }
}
