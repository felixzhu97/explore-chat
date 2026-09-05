import { Module } from "@nestjs/common";
import { ChatsController } from "./controller/chats.controller";
import { ChatsService } from "@/chats/service/chats.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
