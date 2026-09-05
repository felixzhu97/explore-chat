import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import logger from "@/shared/utils/logger";
import { buildRpcStatus } from "@/core/aip/rpc-status";
import type { RpcStatusDetail } from "@whatschat/shared-types";

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
        : "Internal server error";

    const errMsg =
      exception instanceof Error ? exception.message : "Unknown error";
    logger.error(`错误: ${truncateForLog(errMsg)}`);
    if (exception instanceof Error && exception.stack) {
      logger.error(`堆栈: ${truncateForLog(exception.stack)}`);
    }
    if (request && typeof request === "object" && "url" in request) {
      logger.error(`请求URL: ${(request as { url?: string }).url}`);
      logger.error(`请求方法: ${(request as { method?: string }).method}`);
      logger.error(`请求IP: ${(request as { ip?: string }).ip}`);
    }

    if (exception && typeof exception === "object" && "name" in exception) {
      const errorName = (exception as { name?: string }).name;
      if (errorName === "PrismaClientKnownRequestError") {
        const prismaError = exception as { code?: string };
        let errorMessage = "Database operation failed";
        let httpStatus = HttpStatus.BAD_REQUEST;
        let details: RpcStatusDetail[] | undefined;

        switch (prismaError.code) {
          case "P2002":
            errorMessage = "Resource already exists";
            httpStatus = HttpStatus.CONFLICT;
            details = [
              { "@type": "google.rpc.ErrorInfo", reason: "ALREADY_EXISTS" },
            ];
            break;
          case "P2025":
            errorMessage = "Resource not found";
            httpStatus = HttpStatus.NOT_FOUND;
            details = [
              { "@type": "google.rpc.ErrorInfo", reason: "NOT_FOUND" },
            ];
            break;
          case "P2003":
            errorMessage = "Foreign key constraint failed";
            details = [
              {
                "@type": "google.rpc.ErrorInfo",
                reason: "FOREIGN_KEY_CONSTRAINT",
              },
            ];
            break;
        }

        response
          .status(httpStatus)
          .json(buildRpcStatus(httpStatus, errorMessage, details));
        return;
      }

      if (errorName === "JsonWebTokenError") {
        response
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            buildRpcStatus(HttpStatus.UNAUTHORIZED, "Invalid token", [
              { "@type": "google.rpc.ErrorInfo", reason: "INVALID_TOKEN" },
            ]),
          );
        return;
      }

      if (errorName === "TokenExpiredError") {
        response
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            buildRpcStatus(HttpStatus.UNAUTHORIZED, "Token expired", [
              { "@type": "google.rpc.ErrorInfo", reason: "TOKEN_EXPIRED" },
            ]),
          );
        return;
      }
    }

    const isDevelopment = process.env["NODE_ENV"] === "development";
    const responseMessage =
      typeof message === "string"
        ? message
        : (message as { message?: string }).message || "Internal server error";

    const details: RpcStatusDetail[] | undefined =
      isDevelopment && exception instanceof Error && exception.stack
        ? [
            {
              "@type": "google.rpc.DebugInfo",
              detail: truncateForLog(exception.stack),
            },
          ]
        : undefined;

    response
      .status(status)
      .json(
        buildRpcStatus(
          status,
          truncateForLog(String(responseMessage)),
          details,
        ),
      );
  }
}
