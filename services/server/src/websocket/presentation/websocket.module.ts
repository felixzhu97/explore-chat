import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@/core/config/config.service";
import { ChatGateway } from "./chat.gateway";
import { DatabaseModule } from "@/core/database/database.module";
import { OfflineMessageQueueService } from "@/messages/service/offline-message-queue.service";
import { MessagesModule } from "@/messages/messages.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const config = ConfigService.loadConfig();
        return {
          secret: config.jwt.secret,
        };
      },
    }),
    DatabaseModule,
    forwardRef(() => MessagesModule),
  ],
  providers: [OfflineMessageQueueService, ChatGateway],
  exports: [OfflineMessageQueueService, ChatGateway],
})
export class WebSocketModule {}
