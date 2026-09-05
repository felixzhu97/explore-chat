import {
  Controller,
  Get,
  Post,
  Patch,
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
    @Query("limit") limit = "20",
    @Query("cursor") cursor?: string,
  ) {
    const data = await this.notificationService.list(
      user.id,
      parseInt(limit, 10),
      cursor,
    );
    return { success: true, data };
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification read" })
  async markRead(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.notificationService.markRead(user.id, id);
  }

  @Post("read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notifications read by ids" })
  async markReadMany(
    @CurrentUser() user: { id: string },
    @Body() body: { ids: string[] },
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    return this.notificationService.markReadMany(user.id, ids);
  }

  @Post("read-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all notifications read" })
  async markAllRead(@CurrentUser() user: { id: string }) {
    return this.notificationService.markAllRead(user.id);
  }
}
