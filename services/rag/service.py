"""RAG orchestration: startup init, health probes, and DI helpers."""

from __future__ import annotations

import logging
from typing import Any

from domain.core.chunker import TextChunker, get_chunker
from domain.core.document_processor import DocumentProcessor, get_document_processor
from domain.core.embedding import EmbeddingService, get_embedding_service
from domain.core.qdrant_client import QdrantService, get_qdrant_service
from domain.schemas.common import HealthStatus

logger = logging.getLogger(__name__)


async def get_qdrant() -> QdrantService:
    """Get Qdrant service instance."""
    return get_qdrant_service()


async def get_embeddings() -> EmbeddingService:
    """Get embedding service instance."""
    return get_embedding_service()


async def get_processor() -> DocumentProcessor:
    """Get document processor instance."""
    return get_document_processor()


async def get_text_chunker() -> TextChunker:
    """Get text chunker instance."""
    return get_chunker()


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
