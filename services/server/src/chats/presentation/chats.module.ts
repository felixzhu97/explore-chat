import { Module } from "@nestjs/common";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "@/chats/application/chats.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
