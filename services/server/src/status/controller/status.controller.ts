import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { StatusService } from "@/status/service/status.service";

@ApiTags("status")
@Controller("status")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: "List statuses" })
  async getStatuses(@CurrentUser() user: { id: string }) {
    const statuses = await this.statusService.getStatuses(user.id);
    return { statuses };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create status" })
  async createStatus(
    @CurrentUser() user: { id: string },
    @Body()
    createStatusDto: {
      type: "TEXT" | "IMAGE" | "VIDEO";
      content?: string;
      mediaUrl?: string;
      duration?: number;
    },
  ) {
    return this.statusService.createStatus(user.id, createStatusDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get status" })
  async getStatus(@Param("id") id: string) {
    return this.statusService.getStatusById(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete status" })
  async deleteStatus(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    await this.statusService.deleteStatus(id, user.id);
  }

  @Post(":id\\:view")
  @ApiOperation({ summary: "Mark status viewed" })
  async viewStatus(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    return this.statusService.viewStatus(id, user.id);
  }
}
