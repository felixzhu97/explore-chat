import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { StatusService } from "@/status/service/status.service";

@ApiTags("状态")
@Controller("status")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: "获取状态列表" })
  async getStatuses(@CurrentUser() user: any) {
    const statuses = await this.statusService.getStatuses(user.id);

    return {
      success: true,
      message: "获取状态列表成功",
      data: statuses,
    };
  }

  @Post()
  @ApiOperation({ summary: "发布状态" })
  async createStatus(
    @CurrentUser() user: any,
    @Body()
    createStatusDto: {
      type: "TEXT" | "IMAGE" | "VIDEO";
      content?: string;
      mediaUrl?: string;
      duration?: number;
    },
  ) {
    const status = await this.statusService.createStatus(
      user.id,
      createStatusDto,
    );

    return {
      success: true,
      message: "发布状态成功",
      data: status,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取状态详情" })
  async getStatus(@Param("id") id: string) {
    const status = await this.statusService.getStatusById(id);

    return {
      success: true,
      message: "获取状态详情成功",
      data: status,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除状态" })
  async deleteStatus(@CurrentUser() user: any, @Param("id") id: string) {
    await this.statusService.deleteStatus(id, user.id);

    return {
      success: true,
      message: "状态删除成功",
    };
  }

  @Post(":id/view")
  @ApiOperation({ summary: "标记状态为已查看" })
  async viewStatus(@CurrentUser() user: any, @Param("id") id: string) {
    const data = await this.statusService.viewStatus(id, user.id);

    return {
      success: true,
      data,
    };
  }
}
