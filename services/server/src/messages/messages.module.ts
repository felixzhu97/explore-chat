import { Module, forwardRef } from "@nestjs/common";
import { MessagesController } from "./controller/messages.controller";
import { MessagesService } from "@/messages/service/messages.service";
import { DatabaseModule } from "@/core/database/database.module";
import { WebSocketModule } from "@/websocket/websocket.module";
import { PrismaMessageRepository } from "@/messages/infra/prisma-message.repository";
import { PrismaChatRepository } from "@/chats/infra/prisma-chat.repository";

@Module({
  imports: [DatabaseModule, forwardRef(() => WebSocketModule)],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    PrismaMessageRepository,
    PrismaChatRepository,
    { provide: "MessageRepository", useExisting: PrismaMessageRepository },
    { provide: "ChatRepository", useExisting: PrismaChatRepository },
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
