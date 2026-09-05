import { Module, forwardRef } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "@/messages/application/messages.service";
import { DatabaseModule } from "@/core/database/database.module";
import { WebSocketModule } from "@/websocket/presentation/websocket.module";

@Module({
  imports: [DatabaseModule, forwardRef(() => WebSocketModule)],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
