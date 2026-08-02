import { Module } from "@nestjs/common";
import {
  CommentsController,
  CommentDeleteController,
} from "./comments.controller";
import { CommentService } from "@/comments/application/comment.service";
import { KafkaModule } from "@/core/messaging/kafka.module";
import { NotificationsModule } from "@/notifications/presentation/notifications.module";
import { WebSocketModule } from "@/websocket/presentation/websocket.module";
import { AiModule } from "@/ai/presentation/ai.module";

@Module({
  imports: [KafkaModule, NotificationsModule, WebSocketModule, AiModule],
  controllers: [CommentsController, CommentDeleteController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentsModule {}
