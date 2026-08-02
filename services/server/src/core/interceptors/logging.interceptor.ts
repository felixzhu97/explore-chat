import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import logger from "@/shared/utils/logger";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (String(context.getType()) === "graphql") {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    if (!request || typeof request !== "object") {
      return next.handle();
    }
    const method = (request as { method?: string }).method ?? "";
    const url = (request as { url?: string }).url ?? "";
    const ip = (request as { ip?: string }).ip ?? "";
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;

          logger.info(`${method} ${url} ${statusCode} - ${ip} - ${delay}ms`);
        },
        error: (error) => {
          const delay = Date.now() - now;
          logger.error(
            `${method} ${url} - ${ip} - ${delay}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
