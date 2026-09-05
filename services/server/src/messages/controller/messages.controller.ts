import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { MessagesService } from "@/messages/service/messages.service";
import { CreateMessageRequest } from "@/messages/controller/message-request";
import { ChatGateway } from "@/websocket/presentation/chat.gateway";
import type { QueuedMessagePayload } from "@/messages/service/offline-message-queue.service";

@ApiTags("消息")
@Controller("messages")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get(":chatId")
  @ApiOperation({ summary: "获取聊天消息" })
  async getMessages(
    @Param("chatId") chatId: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("search") search?: string,
  ) {
    const messages = await this.messagesService.getMessages(chatId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      ...(search && { search }),
    });

    return {
      success: true,
      data: messages,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "发送消息" })
  async createMessage(
    @CurrentUser() user: any,
    @Body() createMessageDto: CreateMessageRequest,
  ) {
    const message = await this.messagesService.createMessage({
      content: createMessageDto.content,
      type: createMessageDto.type,
      chatId: createMessageDto.chatId,
      senderId: user.id,
      ...(createMessageDto.clientMsgId != null && {
        clientMsgId: createMessageDto.clientMsgId,
      }),
      ...(createMessageDto.mediaUrl != null && {
        mediaUrl: createMessageDto.mediaUrl,
      }),
      ...(createMessageDto.replyToMessageId != null && {
        replyToMessageId: createMessageDto.replyToMessageId,
      }),
    });

    const { deliveredOnline } = await this.chatGateway.deliverToParticipants(
      message as QueuedMessagePayload,
      message.chatId,
      message.senderId,
    );

    if (deliveredOnline) {
      this.chatGateway.emitDelivered(message.senderId, {
        messageId: message.id,
        chatId: message.chatId,
        ...(typeof (message as { clientMsgId?: string }).clientMsgId ===
          "string" && {
          clientMsgId: (message as { clientMsgId: string }).clientMsgId,
        }),
      });
    }

    return {
      success: true,
      message: "消息发送成功",
      data: message,
    };
  }

  @Put(":messageId")
  @ApiOperation({ summary: "更新消息" })
  async updateMessage(
    @Param("messageId") messageId: string,
    @Body() updateData: { content?: string; type?: string },
  ) {
    const updatePayload: Partial<{
      content: string;
      type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
    }> = {};
    if (updateData.content !== undefined) {
      updatePayload.content = updateData.content;
    }
    if (updateData.type !== undefined) {
      updatePayload.type = updateData.type as
        | "TEXT"
        | "IMAGE"
        | "VIDEO"
        | "AUDIO"
        | "FILE";
    }
    const message = await this.messagesService.updateMessage(
      messageId,
      updatePayload,
    );

    return {
      success: true,
      message: "消息更新成功",
      data: message,
    };
  }

  @Delete(":messageId")
  @ApiOperation({ summary: "删除消息" })
  async deleteMessage(@Param("messageId") messageId: string) {
    await this.messagesService.deleteMessage(messageId);

    return {
      success: true,
      message: "消息删除成功",
    };
  }
}
