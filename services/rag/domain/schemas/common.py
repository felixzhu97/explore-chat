"""Pydantic schemas for common types."""
from datetime import datetime
from typing import Optional, Any, Literal

from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    """Base response schema."""

    success: bool = True
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema."""

    success: Literal[False] = False
    error: str
    detail: Optional[Any] = None


class PaginationParams(BaseModel):
    """Pagination parameters."""

    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)


class HealthStatus(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: dict[str, bool] = Field(default_factory=dict)


class DocumentMetadata(BaseModel):
    """Document metadata schema."""

    filename: Optional[str] = None
    source_url: Optional[str] = None
    source_type: str = "document"
    author_id: Optional[str] = None
    post_id: Optional[str] = None
    page: Optional[int] = None
    created_at: Optional[datetime] = None
    tags: list[str] = Field(default_factory=list)


class ChunkInfo(BaseModel):
    """Information about a document chunk."""

    chunk_id: str
    text: str
    metadata: DocumentMetadata
    token_count: int = 0


class SourceReference(BaseModel):
    """Reference to a source document."""

    id: str
    text: str
    score: float
    metadata: DocumentMetadata


class SyncResult(BaseModel):
    """Result of a sync operation."""

    total: int
    successful: int
    failed: int
    errors: list[str] = Field(default_factory=list)
    duration_ms: int = 0
