import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator";

export class GetUsersDto {
  @IsOptional()
  @IsNumber({}, { message: "页码必须是数字" })
  @Min(1, { message: "页码必须大于0" })
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: "每页数量必须是数字" })
  @Min(1, { message: "每页数量必须大于0" })
  @Max(100, { message: "每页数量不能超过100" })
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: "搜索关键词必须是字符串" })
  search?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "用户名必须是字符串" })
  username?: string;

  @IsOptional()
  @IsString({ message: "手机号必须是字符串" })
  phone?: string;

  @IsOptional()
  @IsString({ message: "头像URL必须是字符串" })
  avatar?: string;

  @IsOptional()
  @IsString({ message: "状态必须是字符串" })
  status?: string;
}
