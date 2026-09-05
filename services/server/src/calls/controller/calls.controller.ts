import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { CallsService } from "@/calls/service/calls.service";

@ApiTags("通话")
@Controller("calls")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @ApiOperation({ summary: "获取通话记录" })
  async getCalls(@CurrentUser() user: any) {
    const calls = await this.callsService.getCalls(user.id);

    return {
      success: true,
      message: "获取通话记录成功",
      data: calls,
    };
  }

  @Post()
  @ApiOperation({ summary: "发起通话" })
  async createCall(
    @CurrentUser() user: any,
    @Body()
    createCallDto: {
      type: "AUDIO" | "VIDEO";
      targetUserId?: string;
      chatId?: string;
    },
  ) {
    const call = await this.callsService.createCall(user.id, createCallDto);

    return {
      success: true,
      message: "发起通话成功",
      data: call,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取通话详情" })
  async getCall(@CurrentUser() user: any, @Param("id") id: string) {
    const call = await this.callsService.getCallById(id, user.id);

    return {
      success: true,
      message: "获取通话详情成功",
      data: call,
    };
  }

  @Put(":id/answer")
  @ApiOperation({ summary: "接听通话" })
  async answerCall(@CurrentUser() user: any, @Param("id") id: string) {
    await this.callsService.answerCall(id, user.id);

    return {
      success: true,
      message: "通话已接听",
    };
  }

  @Put(":id/reject")
  @ApiOperation({ summary: "拒绝通话" })
  async rejectCall(@CurrentUser() user: any, @Param("id") id: string) {
    await this.callsService.rejectCall(id, user.id);

    return {
      success: true,
      message: "通话已拒绝",
    };
  }

  @Put(":id/end")
  @ApiOperation({ summary: "结束通话" })
  async endCall(@CurrentUser() user: any, @Param("id") id: string) {
    const result = await this.callsService.endCall(id, user.id);

    return {
      success: true,
      message: "通话已结束",
      data: result,
    };
  }
}
