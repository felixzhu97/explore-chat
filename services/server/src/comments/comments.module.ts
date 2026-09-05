import { Module } from "@nestjs/common";
import {
  CommentsController,
  CommentDeleteController,
} from "./controller/comments.controller";
import { CommentService } from "@/comments/service/comment.service";
import { KafkaModule } from "@/core/messaging/kafka.module";
import { NotificationsModule } from "@/notifications/notifications.module";
import { WebSocketModule } from "@/websocket/websocket.module";
import { AiModule } from "@/ai/ai.module";

@Module({
  imports: [KafkaModule, NotificationsModule, WebSocketModule, AiModule],
  controllers: [CommentsController, CommentDeleteController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentsModule {}
