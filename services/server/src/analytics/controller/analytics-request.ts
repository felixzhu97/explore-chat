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

export class EventContextRequest {
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

export class AnalyticsEventRequest {
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
  @Type(() => EventContextRequest)
  context?: EventContextRequest;
}

export class IngestAnalyticsEventsRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalyticsEventRequest)
  @ArrayMaxSize(100)
  events!: AnalyticsEventRequest[];
}
