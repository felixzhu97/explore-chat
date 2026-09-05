package com.chat.common.exception;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/** Emit AIP-193 RpcStatus bodies for HTTP errors. */
@RestControllerAdvice
public class AipExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<RpcStatus> handleStatus(ResponseStatusException ex) {
    HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
    String message = ex.getReason() == null ? status.getReasonPhrase() : ex.getReason();
    return ResponseEntity.status(status).body(RpcStatuses.status(status, message));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<RpcStatus> handleValidation(MethodArgumentNotValidException ex) {
    List<Map<String, Object>> details =
        ex.getBindingResult().getFieldErrors().stream().map(this::fieldDetail).toList();
    return ResponseEntity.badRequest()
        .body(RpcStatus.of(RpcCode.INVALID_ARGUMENT, "Validation failed", details));
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<RpcStatus> handleBadCredentials(BadCredentialsException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(RpcStatuses.status(HttpStatus.UNAUTHORIZED, ex.getMessage()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<RpcStatus> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(RpcStatuses.status(HttpStatus.FORBIDDEN, ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<RpcStatus> handleOther(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(RpcStatuses.status(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"));
  }

  private Map<String, Object> fieldDetail(FieldError error) {
    return Map.of(
        "@type", "BadRequest",
        "field", error.getField(),
        "description", error.getDefaultMessage() == null ? "" : error.getDefaultMessage());
  }
}
