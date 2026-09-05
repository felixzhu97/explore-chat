import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@/core/config/config.service";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "@/auth/service/auth.service";
import { JwtStrategy } from "./controller/jwt.strategy";
import { DatabaseModule } from "@/core/database/database.module";
import { UsersModule } from "@/users/users.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: () => {
        const config = ConfigService.loadConfig();
        return {
          secret: config.jwt.secret,
          signOptions: {
            expiresIn: config.jwt.expiresIn,
          },
        };
      },
    }),
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: "IAuthService",
      useClass: AuthService,
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
