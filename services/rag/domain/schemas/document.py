"""Schemas for document operations."""
from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    """Response after uploading a document."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    filename: str
    file_size: int
    content_type: str
    status: str = "processing"
    chunks_count: int = 0


class DocumentInfo(BaseModel):
    """Document information."""

    id: str
    filename: Optional[str] = None
    source_url: Optional[str] = None
    content_type: str
    file_size: int
    status: str
    chunks_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DocumentListResponse(BaseModel):
    """List of documents response."""

    documents: list[DocumentInfo]
    total: int
    skip: int
    limit: int


class DocumentDeleteResponse(BaseModel):
    """Delete document response."""

    id: str
    deleted: bool
    chunks_deleted: int


class ScrapeRequest(BaseModel):
    """Request to scrape a webpage."""

    url: str
    max_depth: int = Field(default=1, ge=1, le=3)
    include_subpages: bool = False


class ScrapeResponse(BaseModel):
    """Response after scraping a webpage."""

    id: str
    url: str
    title: str
    content_length: int
    chunks_count: int
    status: str


class CrawlRequest(BaseModel):
    """Request to crawl multiple URLs."""

    urls: list[str] = Field(min_length=1, max_length=50)
    max_depth: int = Field(default=1, ge=1, le=3)


class CrawlResponse(BaseModel):
    """Response after crawling multiple URLs."""

    total_urls: int
    successful: int
    failed: int
    results: list[ScrapeResponse]
