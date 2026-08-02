import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "@/follow/application/follow.service";

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
