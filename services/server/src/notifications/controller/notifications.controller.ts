import {
  Controller,
  Get,
  Post,
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
import { NotificationService } from "@/notifications/service/notification.service";
import {
  clampPageSize,
  cursorFromPageToken,
  nextCursorPageToken,
} from "@/core/aip/page-token";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "List notifications" })
  async list(
    @CurrentUser() user: { id: string },
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const cursor = cursorFromPageToken(pageToken);
    const { items, nextCursor } = await this.notificationService.list(
      user.id,
      pageSize,
      cursor,
    );
    return {
      notifications: items,
      next_page_token: nextCursorPageToken(nextCursor),
    };
  }

  @Post(":id\\:read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification read" })
  async markRead(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    await this.notificationService.markRead(user.id, id);
    return {};
  }

  @Post("read\\:batch")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notifications read by ids" })
  async markReadMany(
    @CurrentUser() user: { id: string },
    @Body() body: { ids: string[] },
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const modifiedCount = await this.notificationService.markReadMany(
      user.id,
      ids,
    );
    return { modified_count: modifiedCount };
  }

  @Post("read\\:all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all notifications read" })
  async markAllRead(@CurrentUser() user: { id: string }) {
    const modifiedCount = await this.notificationService.markAllRead(user.id);
    return { modified_count: modifiedCount };
  }
}
