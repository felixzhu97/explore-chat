import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "@/users/application/users.service";
import { DatabaseModule } from "@/core/database/database.module";
import { FollowModule } from "@/follow/presentation/follow.module";

@Module({
  imports: [DatabaseModule, FollowModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
