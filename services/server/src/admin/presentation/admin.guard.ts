import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@/core/config/config.service";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      throw new ForbiddenException("未登录");
    }

    const config = ConfigService.loadConfig();
    const adminEmails = config.admin?.emails || [];

    if (adminEmails.length === 0) {
      throw new ForbiddenException("未配置管理员");
    }

    if (!adminEmails.includes(user.email)) {
      throw new ForbiddenException("无管理员权限");
    }

    return true;
  }
}
