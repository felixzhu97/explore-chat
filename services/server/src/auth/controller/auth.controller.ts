import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotImplementedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "@/auth/service/auth.service";
import { UpdateUserData, UsersService } from "@/users/service/users.service";
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/auth/controller/auth-request";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { Public } from "./public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register" })
  async register(@Body() registerDto: RegisterRequest) {
    const result = await this.authService.register(registerDto);
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        phone: result.user.phone,
        avatar: result.user.avatar,
        status: result.user.status,
      },
      token: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login" })
  async login(@Body() loginDto: LoginRequest) {
    const result = await this.authService.login(loginDto);
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        phone: result.user.phone,
        avatar: result.user.avatar,
        status: result.user.status,
      },
      token: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }

  @Public()
  @Post("refreshToken")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh tokens" })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenRequest) {
    const tokens = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /** @deprecated Prefer POST /auth/refreshToken */
  @Public()
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh tokens (legacy path)" })
  async refreshTokenLegacy(@Body() refreshTokenDto: RefreshTokenRequest) {
    return this.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout" })
  async logout() {
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user" })
  async getCurrentUser(@CurrentUser() user: unknown) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update profile" })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateProfileDto: UpdateProfileRequest,
  ) {
    const data: UpdateUserData = {};
    if (updateProfileDto.username !== undefined)
      data.username = updateProfileDto.username;
    if (updateProfileDto.phone !== undefined)
      data.phone = updateProfileDto.phone;
    if (updateProfileDto.status !== undefined)
      data.status = updateProfileDto.status;
    if (updateProfileDto.avatar !== undefined)
      data.avatar = updateProfileDto.avatar;

    const updatedUser = await this.usersService.updateUser(user.id, data);
    return { user: updatedUser };
  }

  @UseGuards(JwtAuthGuard)
  @Post("changePassword")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password" })
  async changePassword(
    @CurrentUser() _user: unknown,
    @Body() _changePasswordDto: ChangePasswordRequest,
  ) {
    throw new NotImplementedException("Change password is not implemented");
  }

  @Public()
  @Post("forgotPassword")
  @ApiOperation({ summary: "Forgot password" })
  async forgotPassword(@Body() _forgotPasswordDto: ForgotPasswordRequest) {
    throw new NotImplementedException("Forgot password is not implemented");
  }

  @Public()
  @Post("resetPassword")
  @ApiOperation({ summary: "Reset password" })
  async resetPassword(@Body() _resetPasswordDto: ResetPasswordRequest) {
    throw new NotImplementedException("Reset password is not implemented");
  }
}
