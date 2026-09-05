package com.chat.common.exception;

import java.util.List;
import java.util.Map;

/** AIP-193 Status JSON body. */
public record RpcStatus(String code, String message, List<Map<String, Object>> details) {

  public static RpcStatus of(RpcCode code, String message) {
    return new RpcStatus(code.name(), message, List.of());
  }

  public static RpcStatus of(RpcCode code, String message, List<Map<String, Object>> details) {
    return new RpcStatus(code.name(), message, details == null ? List.of() : details);
  }
}
