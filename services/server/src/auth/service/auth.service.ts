import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {
  IAuthService,
  RegisterData,
  LoginData,
  AuthTokens,
} from "@/auth/domain/auth.service.interface";
import { UserRepository } from "@/users/domain/repository/user.repository";
import { User } from "@/users/domain/model/user";
import { ConfigService } from "@/core/config/config.service";
import { PrismaService } from "@/core/database/prisma.service";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async register(
    data: RegisterData,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        username: data.username || data.email,
        email: data.email,
        password: hashedPassword,
        ...(data.phone && { phone: data.phone }),
      },
    });

    await this.elasticsearch.indexUser({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
    });

    const domainUser = User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.username,
    );

    return { user: domainUser, tokens };
  }

  async login(data: LoginData): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user (need password, so use Prisma directly)
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      data.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const domainUser = User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.username,
    );

    return { user: domainUser, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const config = ConfigService.loadConfig();
      const decoded = this.jwtService.verify(refreshToken, {
        secret: config.jwt.refreshSecret,
      }) as any;

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return await this.generateTokens(user.id, user.email, user.username);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async validateToken(
    token: string,
  ): Promise<{ userId: string; email: string; username: string }> {
    try {
      const config = ConfigService.loadConfig();
      const decoded = this.jwtService.verify(token, {
        secret: config.jwt.secret,
      }) as any;

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException("User does not exist");
      }

      return {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  async hashPassword(password: string): Promise<string> {
    const config = ConfigService.loadConfig();
    return bcrypt.hash(password, config.security.bcrypt.saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateTokens(
    userId: string,
    email: string,
    username: string,
  ): Promise<AuthTokens> {
    const config = ConfigService.loadConfig();
    const payload = { userId, email, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: config.jwt.secret,
        expiresIn: config.jwt.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: config.jwt.refreshSecret,
        expiresIn: config.jwt.refreshExpiresIn,
      }),
    ]);

    // Calculate expiration time (seconds)
    const expiresIn = this.parseExpiresIn(config.jwt.expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match || !match[1]) return 7 * 24 * 60 * 60; // Default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }
}
