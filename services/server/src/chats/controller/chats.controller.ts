import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/presentation/jwt-auth.guard";
import { CurrentUser } from "@/auth/presentation/current-user.decorator";
import { ChatsService } from "@/chats/service/chats.service";

@ApiTags("聊天")
@Controller("chats")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({ summary: "获取聊天列表" })
  async getChats(@CurrentUser() user: any) {
    const chats = await this.chatsService.getChats(user.id);

    return {
      success: true,
      message: "获取聊天列表成功",
      data: chats,
    };
  }

  @Post()
  @ApiOperation({ summary: "创建聊天" })
  async createChat(
    @CurrentUser() user: any,
    @Body()
    createChatDto: {
      type: "PRIVATE" | "GROUP";
      name?: string;
      avatar?: string;
      participantIds: string[];
    },
  ) {
    const chat = await this.chatsService.createChat(user.id, createChatDto);

    return {
      success: true,
      message: "创建聊天成功",
      data: chat,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取聊天详情" })
  async getChat(@CurrentUser() user: any, @Param("id") id: string) {
    const chat = await this.chatsService.getChatById(id, user.id);

    return {
      success: true,
      message: "获取聊天详情成功",
      data: chat,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "更新聊天信息" })
  async updateChat(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() updateData: { name?: string; avatar?: string },
  ) {
    const chat = await this.chatsService.updateChat(id, user.id, updateData);

    return {
      success: true,
      message: "更新聊天信息成功",
      data: chat,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除聊天" })
  async deleteChat(@CurrentUser() user: any, @Param("id") id: string) {
    await this.chatsService.deleteChat(id, user.id);

    return {
      success: true,
      message: "聊天删除成功",
    };
  }

  @Post(":id/archive")
  @ApiOperation({ summary: "归档聊天" })
  async archiveChat(@CurrentUser() user: any, @Param("id") id: string) {
    await this.chatsService.archiveChat(id, user.id);

    return {
      success: true,
      message: "聊天已归档",
    };
  }

  @Post(":id/mute")
  @ApiOperation({ summary: "静音聊天" })
  async muteChat(@CurrentUser() user: any, @Param("id") id: string) {
    await this.chatsService.muteChat(id, user.id);

    return {
      success: true,
      message: "聊天已静音",
    };
  }
}
