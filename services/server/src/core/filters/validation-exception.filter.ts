import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { buildRpcStatus } from "@/core/aip/rpc-status";

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    if (String(host.getType()) === "graphql") {
      throw exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message ||
          exception.message;

    const text = Array.isArray(message) ? message.join(", ") : String(message);
    const details =
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      "message" in exceptionResponse &&
      Array.isArray((exceptionResponse as { message: unknown }).message)
        ? [
            {
              "@type": "google.rpc.BadRequest",
              fieldViolations: (
                exceptionResponse as { message: string[] }
              ).message.map((description) => ({ description })),
            },
          ]
        : undefined;

    response.status(400).json(buildRpcStatus(400, text, details));
  }
}
