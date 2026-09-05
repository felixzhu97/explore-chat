import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { CallsService } from "@/calls/service/calls.service";

@ApiTags("calls")
@Controller("calls")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @ApiOperation({ summary: "List calls" })
  async getCalls(@CurrentUser() user: { id: string }) {
    const calls = await this.callsService.getCalls(user.id);
    return { calls };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create call" })
  async createCall(
    @CurrentUser() user: { id: string },
    @Body()
    createCallDto: {
      type: "AUDIO" | "VIDEO";
      targetUserId?: string;
      chatId?: string;
    },
  ) {
    return this.callsService.createCall(user.id, createCallDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get call" })
  async getCall(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.callsService.getCallById(id, user.id);
  }

  @Post(":id\\:answer")
  @ApiOperation({ summary: "Answer call" })
  async answerCall(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    await this.callsService.answerCall(id, user.id);
    return {};
  }

  @Post(":id\\:reject")
  @ApiOperation({ summary: "Reject call" })
  async rejectCall(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    await this.callsService.rejectCall(id, user.id);
    return {};
  }

  @Post(":id\\:end")
  @ApiOperation({ summary: "End call" })
  async endCall(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.callsService.endCall(id, user.id);
  }
}
