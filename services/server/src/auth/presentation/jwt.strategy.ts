import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@/core/config/config.service";
import { PrismaService } from "@/core/database/prisma.service";
import { CacheService } from "@/core/cache/cache.service";

const JWT_USER_CACHE_TTL = 60;

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {
    const config = ConfigService.loadConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const cacheKey = `jwt:user:${payload.userId}`;
    try {
      const cached = await this.cache.get<Record<string, unknown>>(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore cache miss/failure
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        status: true,
        lastSeen: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }
    try {
      await this.cache.set(cacheKey, user, JWT_USER_CACHE_TTL);
    } catch {
      // ignore
    }
    return user;
  }
}
