"""RAG orchestration: startup init and health probes."""

from __future__ import annotations

import logging
from typing import Any

from core.embedding import get_embedding_service
from core.qdrant_client import get_qdrant_service
from schemas.common import HealthStatus

logger = logging.getLogger(__name__)


async def startup() -> None:
    """Initialize Qdrant collections and embedding client."""
    try:
        qdrant = get_qdrant_service()
        await qdrant.initialize_collections()
        logger.info("Qdrant collections initialized")
    except Exception as e:
        logger.warning("Qdrant initialization failed: %s", e)

    try:
        get_embedding_service()
        logger.info("Embedding service initialized")
    except Exception as e:
        logger.warning("Embedding service initialization failed: %s", e)


async def health_status() -> HealthStatus:
    qdrant_healthy = False
    embedding_healthy = False
    try:
        qdrant_healthy = await get_qdrant_service().health_check()
    except Exception:
        pass
    try:
        embedding_healthy = await get_embedding_service().health_check()
    except Exception:
        pass
    status_str = "healthy" if (qdrant_healthy and embedding_healthy) else "degraded"
    return HealthStatus(
        status=status_str,
        version="1.0.0",
        services={"qdrant": qdrant_healthy, "embeddings": embedding_healthy},
    )


async def readiness() -> dict[str, Any]:
    try:
        ok = await get_qdrant_service().health_check()
        if not ok:
            return {"ok": False, "reason": "Qdrant unavailable"}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "reason": str(e)}
