import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "@/auth/application/auth.service";
import {
  UpdateUserData,
  UsersService,
} from "@/users/application/users.service";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@/auth/application/auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { Public } from "./public.decorator";

@ApiTags("认证")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "用户注册" })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: "用户注册成功",
      data: {
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
      },
    };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "用户登录" })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: "登录成功",
      data: {
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
      },
    };
  }

  @Public()
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "刷新令牌" })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      success: true,
      message: "Token刷新成功",
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "用户登出" })
  async logout() {
    return {
      success: true,
      message: "退出登录成功",
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前用户信息" })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      success: true,
      message: "获取用户信息成功",
      data: {
        user,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新用户资料" })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateProfileDto: UpdateProfileDto,
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
    return {
      success: true,
      message: "更新用户资料成功",
      data: {
        user: updatedUser,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put("change-password")
  @ApiBearerAuth()
  @ApiOperation({ summary: "修改密码" })
  async changePassword(
    @CurrentUser() _user: any,
    @Body() _changePasswordDto: ChangePasswordDto,
  ) {
    // TODO: 实现修改密码逻辑
    return {
      success: false,
      message: "未实现",
      code: "NOT_IMPLEMENTED",
    };
  }

  @Public()
  @Post("forgot-password")
  @ApiOperation({ summary: "忘记密码" })
  async forgotPassword(@Body() _forgotPasswordDto: ForgotPasswordDto) {
    // TODO: 实现忘记密码逻辑
    return {
      success: false,
      message: "未实现",
      code: "NOT_IMPLEMENTED",
    };
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({ summary: "重置密码" })
  async resetPassword(@Body() _resetPasswordDto: ResetPasswordDto) {
    // TODO: 实现重置密码逻辑
    return {
      success: false,
      message: "未实现",
      code: "NOT_IMPLEMENTED",
    };
  }
}
