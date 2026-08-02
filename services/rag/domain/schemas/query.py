"""Schemas for RAG query operations."""
from typing import Optional
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """RAG query request."""

    query: str = Field(min_length=1, max_length=2000)
    collection: Optional[str] = Field(
        default=None,
        description="Collection to search in. If None, searches all collections.",
    )
    top_k: int = Field(default=5, ge=1, le=20)
    include_sources: bool = Field(
        default=True,
        description="Whether to include source documents in the response.",
    )
    filter_metadata: Optional[dict] = Field(
        default=None,
        description="Metadata filters for the query.",
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperature for LLM response generation.",
    )
    stream: bool = Field(
        default=False,
        description="Whether to stream the response.",
    )


class SourceDocument(BaseModel):
    """Source document in query response."""

    id: str
    text: str
    score: float
    metadata: dict


class QueryResponse(BaseModel):
    """RAG query response."""

    answer: str
    sources: list[SourceDocument]
    query: str
    collection_used: Optional[str] = None
    total_chunks_searched: int = 0
    generation_time_ms: int = 0


class StreamingQueryResponse(BaseModel):
    """Streaming RAG query response chunk."""

    type: str
    content: str
    done: bool = False


class SyncPostsRequest(BaseModel):
    """Request to sync posts from database."""

    post_ids: Optional[list[str]] = Field(
        default=None,
        description="Specific post IDs to sync. If None, sync all recent posts.",
    )
    limit: int = Field(default=1000, ge=1, le=10000)
    since_hours: Optional[int] = Field(
        default=None,
        description="Sync posts from the last N hours.",
    )


class SyncCommentsRequest(BaseModel):
    """Request to sync comments from database."""

    comment_ids: Optional[list[str]] = Field(
        default=None,
        description="Specific comment IDs to sync.",
    )
    limit: int = Field(default=1000, ge=1, le=10000)
    post_ids: Optional[list[str]] = Field(
        default=None,
        description="Sync comments only for specific posts.",
    )


class SyncResult(BaseModel):
    """Result of a sync operation."""

    total: int
    successful: int
    failed: int
    skipped: int = 0
    errors: list[str] = Field(default_factory=list)
    duration_ms: int = 0
