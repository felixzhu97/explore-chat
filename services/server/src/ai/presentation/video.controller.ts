import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { VideoService } from "@/ai/application/video.service";

@ApiTags("视频生成")
@Controller("video")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post("generate")
  @ApiOperation({ summary: "提交视频生成任务" })
  async generate(@Body() body: { prompt: string; imageUrl?: string }) {
    const result = await this.videoService.generate({
      prompt: body.prompt,
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
    });
    return { success: true, data: result };
  }

  @Get("generate/:jobId")
  @ApiOperation({ summary: "查询视频生成结果" })
  async getResult(@Param("jobId") jobId: string) {
    const result = await this.videoService.getResult(jobId);
    return { success: true, data: result };
  }
}
