import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import logger from "@/shared/utils/logger";

const MAX_ERROR_LOG = 400;

function truncateForLog(s: string): string {
  if (s.length <= MAX_ERROR_LOG) return s;
  return s.slice(0, MAX_ERROR_LOG) + "…";
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (String(host.getType()) === "graphql") {
      throw exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "服务器内部错误";

    const errMsg = exception instanceof Error ? exception.message : "未知错误";
    logger.error(`错误: ${truncateForLog(errMsg)}`);
    if (exception instanceof Error && exception.stack) {
      logger.error(`堆栈: ${truncateForLog(exception.stack)}`);
    }
    if (request && typeof request === "object" && "url" in request) {
      logger.error(`请求URL: ${(request as { url?: string }).url}`);
      logger.error(`请求方法: ${(request as { method?: string }).method}`);
      logger.error(`请求IP: ${(request as { ip?: string }).ip}`);
    }

    // Prisma错误处理
    if (exception && typeof exception === "object" && "name" in exception) {
      const errorName = (exception as any).name;
      if (errorName === "PrismaClientKnownRequestError") {
        const prismaError = exception as any;
        let errorMessage = "数据库操作失败";
        let errorCode = "DATABASE_ERROR";

        switch (prismaError.code) {
          case "P2002":
            errorMessage = "数据已存在";
            errorCode = "DUPLICATE_ENTRY";
            break;
          case "P2025":
            errorMessage = "记录未找到";
            errorCode = "RECORD_NOT_FOUND";
            break;
          case "P2003":
            errorMessage = "外键约束失败";
            errorCode = "FOREIGN_KEY_CONSTRAINT";
            break;
        }

        response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
          code: errorCode,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // JWT错误处理
    if (exception && typeof exception === "object" && "name" in exception) {
      const errorName = (exception as any).name;
      if (errorName === "JsonWebTokenError") {
        response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: "无效的令牌",
          code: "INVALID_TOKEN",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (errorName === "TokenExpiredError") {
        response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: "令牌已过期",
          code: "TOKEN_EXPIRED",
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    const isDevelopment = process.env["NODE_ENV"] === "development";
    const responseMessage =
      typeof message === "string"
        ? message
        : (message as { message?: string }).message || "服务器内部错误";
    const responseError =
      isDevelopment && exception instanceof Error && exception.stack
        ? truncateForLog(exception.stack)
        : undefined;

    response.status(status).json({
      success: false,
      message: truncateForLog(responseMessage),
      error: responseError,
      timestamp: new Date().toISOString(),
    });
  }
}
