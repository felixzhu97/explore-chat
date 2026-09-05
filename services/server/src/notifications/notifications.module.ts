import { Module } from "@nestjs/common";
import { NotificationsController } from "./controller/notifications.controller";
import { NotificationService } from "@/notifications/service/notification.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
