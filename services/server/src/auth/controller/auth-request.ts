import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from "class-validator";

export class RegisterRequest {
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;

  @IsString({ message: "密码必须是字符串" })
  @MinLength(6, { message: "密码长度至少6位" })
  password!: string;

  @IsString({ message: "用户名必须是字符串" })
  @MinLength(2, { message: "用户名长度至少2位" })
  username!: string;

  @IsOptional()
  @IsString({ message: "手机号必须是字符串" })
  @Matches(/^1[3-9]\d{9}$/, { message: "手机号格式不正确" })
  phone?: string;
}

export class LoginRequest {
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;

  @IsString({ message: "密码必须是字符串" })
  password!: string;
}

export class RefreshTokenRequest {
  @IsString({ message: "Refresh token必须是字符串" })
  refreshToken!: string;
}

export class UpdateProfileRequest {
  @IsOptional()
  @IsString({ message: "用户名必须是字符串" })
  @MinLength(2, { message: "用户名长度至少2位" })
  username?: string;

  @IsOptional()
  @IsString({ message: "手机号必须是字符串" })
  @Matches(/^1[3-9]\d{9}$/, { message: "手机号格式不正确" })
  phone?: string;

  @IsOptional()
  @IsString({ message: "状态必须是字符串" })
  status?: string;

  @IsOptional()
  @IsString({ message: "头像URL必须是字符串" })
  avatar?: string;
}

export class ChangePasswordRequest {
  @IsString({ message: "当前密码必须是字符串" })
  currentPassword!: string;

  @IsString({ message: "新密码必须是字符串" })
  @MinLength(6, { message: "新密码长度至少6位" })
  newPassword!: string;
}

export class ForgotPasswordRequest {
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;
}

export class ResetPasswordRequest {
  @IsString({ message: "Token必须是字符串" })
  token!: string;

  @IsString({ message: "新密码必须是字符串" })
  @MinLength(6, { message: "新密码长度至少6位" })
  newPassword!: string;
}
