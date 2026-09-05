package com.chat.common.exception;

import org.springframework.http.HttpStatus;

/** Map HTTP status to AIP-193 RpcCode. */
public final class RpcStatuses {

  private RpcStatuses() {}

  public static RpcCode fromHttpStatus(HttpStatus status) {
    return switch (status) {
      case OK -> RpcCode.OK;
      case BAD_REQUEST -> RpcCode.INVALID_ARGUMENT;
      case UNAUTHORIZED -> RpcCode.UNAUTHENTICATED;
      case FORBIDDEN -> RpcCode.PERMISSION_DENIED;
      case NOT_FOUND -> RpcCode.NOT_FOUND;
      case CONFLICT -> RpcCode.ALREADY_EXISTS;
      case PRECONDITION_FAILED -> RpcCode.FAILED_PRECONDITION;
      case TOO_MANY_REQUESTS -> RpcCode.RESOURCE_EXHAUSTED;
      case NOT_IMPLEMENTED -> RpcCode.UNIMPLEMENTED;
      case SERVICE_UNAVAILABLE -> RpcCode.UNAVAILABLE;
      case GATEWAY_TIMEOUT, REQUEST_TIMEOUT -> RpcCode.DEADLINE_EXCEEDED;
      default -> status.is5xxServerError() ? RpcCode.INTERNAL : RpcCode.UNKNOWN;
    };
  }

  public static RpcStatus status(HttpStatus http, String message) {
    return RpcStatus.of(fromHttpStatus(http), message);
  }
}
