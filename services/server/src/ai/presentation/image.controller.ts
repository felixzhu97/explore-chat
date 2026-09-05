import { Controller, Post, Body, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { ImageService } from "@/ai/application/image.service";

@ApiTags("图片生成")
@Controller("image")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post("generate")
  @ApiOperation({ summary: "提交图片生成任务" })
  async generate(@Body() body: { prompt: string; negativePrompt?: string }) {
    const result = await this.imageService.generate({
      prompt: body.prompt,
      ...(body.negativePrompt != null && {
        negativePrompt: body.negativePrompt,
      }),
    });
    return { success: true, data: result };
  }

  @Get("generate/:jobId")
  @ApiOperation({ summary: "查询图片生成结果" })
  async getResult(@Param("jobId") jobId: string) {
    const result = await this.imageService.getResult(jobId);
    return { success: true, data: result };
  }
}
