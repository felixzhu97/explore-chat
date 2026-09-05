import { Module } from "@nestjs/common";
import { UsersController } from "./controller/users.controller";
import { UsersService } from "@/users/service/users.service";
import { DatabaseModule } from "@/core/database/database.module";
import { FollowModule } from "@/follow/presentation/follow.module";
import { PrismaUserRepository } from "@/users/infra/prisma-user.repository";

@Module({
  imports: [DatabaseModule, FollowModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaUserRepository,
    { provide: "UserRepository", useExisting: PrismaUserRepository },
  ],
  exports: [UsersService, PrismaUserRepository, "UserRepository"],
})
export class UsersModule {}
