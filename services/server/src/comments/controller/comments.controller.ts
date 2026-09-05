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
import {
  clampPageSize,
  offsetFromPageToken,
  nextOffsetPageToken,
} from "@/core/aip/page-token";

@ApiTags("comments")
@Controller("posts/:post/comments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create comment" })
  async create(
    @Param("post") postId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { content: string; parentId?: string },
  ) {
    return this.commentService.create(
      postId,
      user.id,
      body.content,
      body.parentId,
    );
  }

  @Get()
  @ApiOperation({ summary: "List comments on a post" })
  async list(
    @Param("post") postId: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const comments = await this.commentService.findByPostId(
      postId,
      page,
      pageSize,
    );
    const hasMore = comments.length >= pageSize;
    return {
      comments,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Delete(":comment")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete comment" })
  async delete(
    @CurrentUser() user: { id: string },
    @Param("comment") id: string,
  ) {
    await this.commentService.delete(id, user.id);
  }
}

/** Top-level delete kept for clients that only know comment id. */
@ApiTags("comments")
@Controller("comments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentDeleteController {
  constructor(private readonly commentService: CommentService) {}

  @Delete(":comment")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete comment by id" })
  async delete(
    @CurrentUser() user: { id: string },
    @Param("comment") id: string,
  ) {
    await this.commentService.delete(id, user.id);
  }
}
