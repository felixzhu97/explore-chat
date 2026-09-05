import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ChatGateway } from "@/websocket/controller/chat.gateway";
import type { QueuedMessagePayload } from "@/messages/service/offline-message-queue.service";
import {
  clampPageSize,
  offsetFromPageToken,
  nextOffsetPageToken,
} from "@/core/aip/page-token";

@ApiTags("messages")
@Controller("chats/:chat/messages")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: "List messages in a chat" })
  async getMessages(
    @Param("chat") chatId: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
    @Query("search") search?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const page = Math.floor(offset / pageSize) + 1;
    const messages = await this.messagesService.getMessages(chatId, {
      page,
      limit: pageSize,
      ...(search && { search }),
    });

    const hasMore = messages.length >= pageSize;

    return {
      messages,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create message in a chat" })
  async createMessage(
    @CurrentUser() user: { id: string },
    @Param("chat") chatId: string,
    @Body() createMessageDto: CreateMessageRequest,
  ) {
    const message = await this.messagesService.createMessage({
      content: createMessageDto.content,
      type: createMessageDto.type,
      chatId,
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

    return message;
  }

  @Patch(":message")
  @ApiOperation({ summary: "Update message" })
  async updateMessage(
    @Param("message") messageId: string,
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
    return this.messagesService.updateMessage(messageId, updatePayload);
  }

  @Delete(":message")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete message" })
  async deleteMessage(@Param("message") messageId: string) {
    await this.messagesService.deleteMessage(messageId);
  }
}
