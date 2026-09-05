"""Opaque AIP-158 page_token helpers (offset encoding).

@see https://google.aip.dev/158
"""

from __future__ import annotations

import base64
import json
from typing import Any, Optional

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def clamp_page_size(
    page_size: Optional[int], fallback: int = DEFAULT_PAGE_SIZE
) -> int:
    if page_size is None or page_size < 1:
        return fallback
    return min(int(page_size), MAX_PAGE_SIZE)


def encode_page_token(payload: dict[str, Any]) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_page_token(token: Optional[str]) -> Optional[dict[str, Any]]:
    if not token:
        return None
    try:
        padded = token + "=" * (-len(token) % 4)
        raw = base64.urlsafe_b64decode(padded.encode("ascii"))
        parsed = json.loads(raw.decode("utf-8"))
        if not isinstance(parsed, dict) or "kind" not in parsed:
            return None
        return parsed
    except (ValueError, json.JSONDecodeError):
        return None


def offset_from_page_token(page_token: Optional[str], page_size: int) -> int:
    payload = decode_page_token(page_token)
    if not payload:
        return 0
    if payload.get("kind") == "offset":
        return max(0, int(payload.get("offset", 0)))
    if payload.get("kind") == "page":
        page = int(payload.get("page", 1))
        return max(0, (page - 1) * page_size)
    return 0


def next_offset_page_token(
    offset: int, page_size: int, has_more: bool
) -> Optional[str]:
    if not has_more:
        return None
    return encode_page_token({"kind": "offset", "offset": offset + page_size})
