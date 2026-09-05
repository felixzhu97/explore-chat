import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
  Max,
} from "class-validator";
import type { MessageType } from "@whatschat/shared-types";

export class CreateMessageRequest {
  @IsString({ message: "内容必须是字符串" })
  content!: string;

  @IsEnum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "LOCATION", "CONTACT"], {
    message: "消息类型无效",
  })
  type!: MessageType;

  @IsString({ message: "聊天ID必须是字符串" })
  chatId!: string;

  @IsOptional()
  @IsObject({ message: "元数据必须是对象" })
  metadata?: any;

  @IsOptional()
  @IsString({ message: "媒体URL必须是字符串" })
  mediaUrl?: string;

  @IsOptional()
  @IsString({ message: "回复的消息ID必须是字符串" })
  replyToMessageId?: string;

  @IsOptional()
  @IsString({ message: "客户端消息ID必须是字符串" })
  clientMsgId?: string;
}

export class GetMessagesRequest {
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

export class UpdateMessageRequest {
  @IsOptional()
  @IsString({ message: "内容必须是字符串" })
  content?: string;
}
