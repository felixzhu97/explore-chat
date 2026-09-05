import { HttpStatus } from "@nestjs/common";
import type {
  RpcCode,
  RpcStatus,
  RpcStatusDetail,
} from "@whatschat/shared-types";

/**
 * Map HTTP status to google.rpc / AIP-193 code names.
 * @see https://google.aip.dev/193
 */
export function rpcCodeFromHttpStatus(status: number): RpcCode {
  switch (status) {
    case HttpStatus.OK:
      return "OK";
    case HttpStatus.BAD_REQUEST:
      return "INVALID_ARGUMENT";
    case HttpStatus.UNAUTHORIZED:
      return "UNAUTHENTICATED";
    case HttpStatus.FORBIDDEN:
      return "PERMISSION_DENIED";
    case HttpStatus.NOT_FOUND:
      return "NOT_FOUND";
    case HttpStatus.CONFLICT:
      return "ALREADY_EXISTS";
    case HttpStatus.PRECONDITION_FAILED:
      return "FAILED_PRECONDITION";
    case HttpStatus.TOO_MANY_REQUESTS:
      return "RESOURCE_EXHAUSTED";
    case HttpStatus.NOT_IMPLEMENTED:
      return "UNIMPLEMENTED";
    case HttpStatus.SERVICE_UNAVAILABLE:
      return "UNAVAILABLE";
    case HttpStatus.GATEWAY_TIMEOUT:
    case HttpStatus.REQUEST_TIMEOUT:
      return "DEADLINE_EXCEEDED";
    default:
      if (status >= 500) {
        return "INTERNAL";
      }
      return "UNKNOWN";
  }
}

export function buildRpcStatus(
  httpStatus: number,
  message: string,
  details?: RpcStatusDetail[],
): RpcStatus {
  return {
    code: rpcCodeFromHttpStatus(httpStatus),
    message,
    ...(details?.length ? { details } : {}),
  };
}
