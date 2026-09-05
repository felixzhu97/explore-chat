"""AIP-193 / google.rpc.Status JSON helpers.

@see https://google.aip.dev/193
@see https://cloud.google.com/apis/design/errors
"""

from __future__ import annotations

from typing import Any, Optional

RpcCode = str

_STATUS_MAP: dict[int, RpcCode] = {
    200: "OK",
    400: "INVALID_ARGUMENT",
    401: "UNAUTHENTICATED",
    403: "PERMISSION_DENIED",
    404: "NOT_FOUND",
    409: "ALREADY_EXISTS",
    412: "FAILED_PRECONDITION",
    429: "RESOURCE_EXHAUSTED",
    501: "UNIMPLEMENTED",
    503: "UNAVAILABLE",
    504: "DEADLINE_EXCEEDED",
    408: "DEADLINE_EXCEEDED",
}


def rpc_code_from_http_status(status: int) -> RpcCode:
    if status in _STATUS_MAP:
        return _STATUS_MAP[status]
    if status >= 500:
        return "INTERNAL"
    return "UNKNOWN"


def build_rpc_status(
    http_status: int,
    message: str,
    details: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "code": rpc_code_from_http_status(http_status),
        "message": message,
    }
    if details:
        body["details"] = details
    return body
