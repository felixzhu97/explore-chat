import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";

/**
 * Pass-through interceptor: AIP REST returns the resource body directly
 * (no `{ success, data }` envelope). GraphQL is unchanged.
 * @see https://google.aip.dev/131
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (String(context.getType()) === "graphql") {
      return next.handle();
    }
    return next.handle();
  }
}
