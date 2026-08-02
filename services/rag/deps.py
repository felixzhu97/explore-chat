"""API dependency injection."""
import logging
from typing import AsyncGenerator

from core.qdrant_client import QdrantService, get_qdrant_service
from core.embedding import EmbeddingService, get_embedding_service
from core.document_processor import DocumentProcessor, get_document_processor
from core.chunker import TextChunker, get_chunker

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
