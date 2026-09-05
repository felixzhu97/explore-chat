import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { MediaService } from "@/media/service/media.service";
import { ConfigService } from "@/core/config/config.service";

@ApiTags("Media")
@Controller("media")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: ConfigService.loadConfig().storage.local.maxFileSize,
      },
    }),
  )
  @ApiOperation({ summary: "Upload media file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: { type: "string", format: "binary" },
        folder: { type: "string", example: "posts" },
      },
    },
  })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("folder") folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException("Missing file");
    }
    const targetFolder =
      folder && /^[a-zA-Z0-9/_-]{1,64}$/.test(folder) ? folder : "posts";
    const data = await this.mediaService.uploadMedia(file, targetFolder);
    return { success: true, data };
  }
}
