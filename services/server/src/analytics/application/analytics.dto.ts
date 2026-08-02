import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from "class-validator";
import { Type } from "class-transformer";

export class EventContextDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  platform?: string;
}

export class AnalyticsEventDto {
  @IsString()
  eventName!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EventContextDto)
  context?: EventContextDto;
}

export class IngestAnalyticsEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalyticsEventDto)
  @ArrayMaxSize(100)
  events!: AnalyticsEventDto[];
}
