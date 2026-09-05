import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { VideoService } from "@/ai/service/video.service";

@ApiTags("video")
@Controller("video")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Submit video generation job" })
  async generate(@Body() body: { prompt: string; imageUrl?: string }) {
    return this.videoService.generate({
      prompt: body.prompt,
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
    });
  }

  @Get("generate/:jobId")
  @ApiOperation({ summary: "Get video generation result" })
  async getResult(@Param("jobId") jobId: string) {
    return this.videoService.getResult(jobId);
  }
}
