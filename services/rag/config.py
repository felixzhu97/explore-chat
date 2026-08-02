"""Configuration management for RAG service."""
import os
from pathlib import Path
from typing import Literal
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8002
    debug: bool = False
    workers: int = 4

    # Paths
    uploads_dir: Path = Path(__file__).parent / "uploads"

    # Qdrant settings
    qdrant_url: str = "http://localhost:6333"
    qdrant_timeout: int = 30
    qdrant_vector_size: int = 768

    # Embedding settings
    embedding_provider: Literal["ollama", "openai"] = "ollama"
    embedding_model: str = "nomic-embed-text"
    ollama_base_url: str = "http://localhost:11434"
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"

    # LLM settings (for RAG answer generation)
    llm_provider: Literal["ollama", "openai"] = "ollama"
    llm_model: str = "qwen3-coder:30b"
    openai_llm_model: str = "gpt-4-turbo-preview"
    llm_timeout: int = 120

    # Chunking settings
    chunk_size: int = 256
    chunk_overlap: int = 50

    # RAG settings
    default_top_k: int = 5
    rag_timeout: int = 30000

    # Redis settings
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl: int = 3600

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

    # Crawler settings
    crawler_timeout: int = 30
    crawler_max_depth: int = 2

    # Database sync settings
    database_url: str = ""

    def ensure_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        self.uploads_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
