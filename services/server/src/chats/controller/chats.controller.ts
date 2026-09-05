import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ChatsService } from "@/chats/service/chats.service";

@ApiTags("chats")
@Controller("chats")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({ summary: "List chats" })
  async getChats(@CurrentUser() user: { id: string }) {
    const chats = await this.chatsService.getChats(user.id);
    return { chats };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create chat" })
  async createChat(
    @CurrentUser() user: { id: string },
    @Body()
    createChatDto: {
      type: "PRIVATE" | "GROUP";
      name?: string;
      avatar?: string;
      participantIds: string[];
    },
  ) {
    return this.chatsService.createChat(user.id, createChatDto);
  }

  @Get(":chat")
  @ApiOperation({ summary: "Get chat" })
  async getChat(
    @CurrentUser() user: { id: string },
    @Param("chat") id: string,
  ) {
    return this.chatsService.getChatById(id, user.id);
  }

  @Patch(":chat")
  @ApiOperation({ summary: "Update chat" })
  async updateChat(
    @CurrentUser() user: { id: string },
    @Param("chat") id: string,
    @Body() updateData: { name?: string; avatar?: string },
  ) {
    return this.chatsService.updateChat(id, user.id, updateData);
  }

  @Delete(":chat")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete chat" })
  async deleteChat(
    @CurrentUser() user: { id: string },
    @Param("chat") id: string,
  ) {
    await this.chatsService.deleteChat(id, user.id);
  }

  @Post(":chat\\:archive")
  @ApiOperation({ summary: "Archive chat" })
  async archiveChat(
    @CurrentUser() user: { id: string },
    @Param("chat") id: string,
  ) {
    await this.chatsService.archiveChat(id, user.id);
    return {};
  }

  @Post(":chat\\:mute")
  @ApiOperation({ summary: "Mute chat" })
  async muteChat(
    @CurrentUser() user: { id: string },
    @Param("chat") id: string,
  ) {
    await this.chatsService.muteChat(id, user.id);
    return {};
  }
}
