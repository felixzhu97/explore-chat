import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { ImageService } from "@/ai/service/image.service";

@ApiTags("image")
@Controller("image")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Submit image generation job" })
  async generate(@Body() body: { prompt: string; negativePrompt?: string }) {
    return this.imageService.generate({
      prompt: body.prompt,
      ...(body.negativePrompt != null && {
        negativePrompt: body.negativePrompt,
      }),
    });
  }

  @Get("generate/:jobId")
  @ApiOperation({ summary: "Get image generation result" })
  async getResult(@Param("jobId") jobId: string) {
    return this.imageService.getResult(jobId);
  }
}
