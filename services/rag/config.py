"""Configuration management for RAG service."""
import os
from functools import lru_cache
from pathlib import Path
from types import SimpleNamespace

from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8120"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
WORKERS = int(os.getenv("WORKERS", "4"))

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", str(Path(__file__).parent / "uploads")))

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_TIMEOUT = int(os.getenv("QDRANT_TIMEOUT", "30"))
QDRANT_VECTOR_SIZE = int(os.getenv("QDRANT_VECTOR_SIZE", "768"))

EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "ollama")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")
LLM_MODEL = os.getenv("LLM_MODEL", "qwen3-coder:30b")
OPENAI_LLM_MODEL = os.getenv("OPENAI_LLM_MODEL", "gpt-4-turbo-preview")
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "120"))

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "256"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

DEFAULT_TOP_K = int(os.getenv("DEFAULT_TOP_K", "5"))
RAG_TIMEOUT = int(os.getenv("RAG_TIMEOUT", "30000"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))

RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

CRAWLER_TIMEOUT = int(os.getenv("CRAWLER_TIMEOUT", "30"))
CRAWLER_MAX_DEPTH = int(os.getenv("CRAWLER_MAX_DEPTH", "2"))

DATABASE_URL = os.getenv("DATABASE_URL", "")


def ensure_directories() -> None:
    """Create necessary directories if they don't exist."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> SimpleNamespace:
    """Get cached settings instance."""
    return SimpleNamespace(
        host=HOST,
        port=PORT,
        debug=DEBUG,
        workers=WORKERS,
        uploads_dir=UPLOADS_DIR,
        qdrant_url=QDRANT_URL,
        qdrant_timeout=QDRANT_TIMEOUT,
        qdrant_vector_size=QDRANT_VECTOR_SIZE,
        embedding_provider=EMBEDDING_PROVIDER,
        embedding_model=EMBEDDING_MODEL,
        ollama_base_url=OLLAMA_BASE_URL,
        openai_api_key=OPENAI_API_KEY,
        openai_embedding_model=OPENAI_EMBEDDING_MODEL,
        llm_provider=LLM_PROVIDER,
        llm_model=LLM_MODEL,
        openai_llm_model=OPENAI_LLM_MODEL,
        llm_timeout=LLM_TIMEOUT,
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        default_top_k=DEFAULT_TOP_K,
        rag_timeout=RAG_TIMEOUT,
        redis_url=REDIS_URL,
        cache_ttl=CACHE_TTL,
        rate_limit_requests=RATE_LIMIT_REQUESTS,
        rate_limit_window=RATE_LIMIT_WINDOW,
        crawler_timeout=CRAWLER_TIMEOUT,
        crawler_max_depth=CRAWLER_MAX_DEPTH,
        database_url=DATABASE_URL,
        ensure_directories=ensure_directories,
    )
