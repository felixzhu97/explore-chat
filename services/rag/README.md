# RAG Service

Layout (same as other Python helpers): `main.py` / `config.py` / `api.py` / `service.py` / `domain/` / `tests/`.
Start: `uvicorn main:app --host 0.0.0.0 --port 8120`.

Retrieval Augmented Generation (RAG) service for WhatsChat, providing semantic search and AI-powered question answering capabilities.

## Features

- **Document Processing**: Upload and index PDF, HTML, Markdown, DOCX, and TXT files
- **Web Crawling**: Scrape and index content from URLs
- **Database Sync**: Synchronize posts and comments from the main database
- **RAG Query**: Ask questions and get AI-generated answers with context from your data
- **Multi-source Search**: Query across documents, posts, comments, and webpages
- **Streaming Responses**: Get real-time streaming answers from the LLM

## Tech Stack

- **Framework**: FastAPI (Python 3.11+ recommended)
- **Vector Database**: Qdrant
- **Embedding Models**: Ollama (local) or OpenAI (cloud)
- **LLM**: Ollama (qwen3-coder:30b, deepseek-r1:70b, etc.) or OpenAI for answer generation
- **Document Parsing**: PyMuPDF, BeautifulSoup, python-docx

## Quick Start

### Prerequisites

1. **Ollama** (for local embeddings and LLM):

```bash
# Install Ollama
brew install ollama

# Pull required models
ollama pull nomic-embed-text
ollama pull qwen3-coder:30b  # or your preferred LLM

# Start Ollama service
ollama serve
```

2. **Qdrant** (vector database):

```bash
docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

3. **Redis** (optional, for caching):

```bash
docker run -d -p 6379:6379 redis:alpine
```

### Using Docker Compose

```bash
cd services/rag
docker-compose up -d
```

### Manual Setup

1. **Install dependencies**:

```bash
cd services/rag
pip install -r requirements.txt
```

2. **Configure environment**:

```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start the service**:

```bash
cd services/rag
uvicorn main:app --host 0.0.0.0 --port 8120
```

## Configuration

Configure via environment variables or `.env` file:

| Variable             | Description                   | Default                  |
| -------------------- | ----------------------------- | ------------------------ |
| `QDRANT_URL`         | Qdrant server URL             | `http://localhost:6333`  |
| `OLLAMA_BASE_URL`    | Ollama server URL             | `http://localhost:11434` |
| `OPENAI_API_KEY`     | OpenAI API key                | (empty)                  |
| `EMBEDDING_PROVIDER` | `ollama` or `openai`          | `ollama`                 |
| `LLM_PROVIDER`       | `ollama` or `openai`          | `ollama`                 |
| `EMBEDDING_MODEL`    | Ollama embedding model        | `nomic-embed-text`       |
| `LLM_MODEL`          | Ollama LLM model              | `qwen3-coder:30b`        |
| `LLM_TIMEOUT`        | LLM request timeout (seconds) | `120`                    |
| `CHUNK_SIZE`         | Text chunk size (tokens)      | `256`                    |
| `CHUNK_OVERLAP`      | Overlap between chunks        | `50`                     |

### Recommended Ollama Models

**Embedding Models:**

- `nomic-embed-text` (default, ~137M params)

**LLM Models:**

- `qwen3-coder:30b` (recommended, good for code and general tasks)
- `deepseek-r1:70b` (powerful, larger model)
- `qwen3.5:35b` (balanced performance)

> **Note**: Ensure your chunk size doesn't exceed the embedding model's context length (~2000 chars for nomic-embed-text).

## API Endpoints

### Documents

```
POST   /api/v1/documents/upload     Upload a document (multipart/form-data)
GET    /api/v1/documents           List all documents
GET    /api/v1/documents/{id}      Get document details
DELETE /api/v1/documents/{id}      Delete a document and its chunks
```

### Crawler

```
POST   /api/v1/crawler/scrape      Scrape and index a single URL
POST   /api/v1/crawler/crawl       Crawl and index multiple URLs
```

### Sync

```
POST   /api/v1/sync/posts          Sync posts from database
POST   /api/v1/sync/comments       Sync comments from database
POST   /api/v1/sync/all           Sync all content types
```

### Query

```
POST   /api/v1/query               RAG query (non-streaming)
POST   /api/v1/query/stream        RAG query (streaming, SSE)
GET    /api/v1/query/collections   List available collections and their info
```

### Health

```
GET    /health                     Health check
GET    /health/live                Liveness probe
GET    /health/ready               Readiness probe
```

## Usage Examples

### Upload a Document

```bash
curl -X POST "http://localhost:8120/api/v1/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

### Scrape a Webpage

```bash
curl -X POST "http://localhost:8120/api/v1/crawler/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Black_Myth_Wukong",
    "max_depth": 1,
    "include_subpages": false
  }'
```

### Query the RAG System

```bash
curl -X POST "http://localhost:8120/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic of the documents?",
    "collection": "documents",
    "top_k": 5,
    "include_sources": true
  }'
```

### Query Specific Collection

Available collections: `documents`, `posts`, `comments`, `webpages`

```bash
curl -X POST "http://localhost:8120/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What did users say about this post?",
    "collection": "comments",
    "top_k": 3,
    "include_sources": true
  }'
```

### Streaming Query

```bash
curl -X POST "http://localhost:8120/api/v1/query/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "query": "Summarize the key points",
    "collection": "webpages",
    "top_k": 5
  }'
```

### List Collections

```bash
curl -s "http://localhost:8120/api/v1/query/collections" | python3 -m json.tool
```

## API Documentation

Once running, visit:

- Swagger UI: http://localhost:8120/docs
- ReDoc: http://localhost:8120/redoc

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         RAG Service                          │
├─────────────────────────────────────────────────────────────┤
│  API Layer (FastAPI)                                         │
│  ├── /documents - Document upload and management            │
│  ├── /crawler   - Web scraping and crawling                │
│  ├── /sync      - Database synchronization                 │
│  └── /query     - RAG query with LLM generation           │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                              │
│  ├── DocumentProcessor (PDF, HTML, DOCX parsing)           │
│  ├── TextChunker (1500 char limit per chunk)               │
│  ├── EmbeddingService (Ollama/OpenAI)                      │
│  └── QdrantService (vector CRUD operations)                │
├─────────────────────────────────────────────────────────────┤
│  LLM Integration                                            │
│  └── generate_answer() with RAG context                   │
└─────────────────────────────────────────────────────────────┘
          │                    │                │
          ▼                    ▼                ▼
     ┌─────────┐         ┌─────────┐     ┌──────────┐
     │ Qdrant  │         │ Ollama  │     │ OpenAI   │
     │(vectors)│         │(local)  │     │ (cloud)  │
     └─────────┘         └─────────┘     └──────────┘
```

## Data Flow

```
User Input → API → Document Processing → Chunking → Embedding → Qdrant
                                                              │
User Query → API → Embed Query → Vector Search ←──────────────┘
                    │
                    ▼
              LLM Generation → Answer + Sources
```

## Development

### Run Tests

```bash
pytest tests/ -v
```

### Run with Hot Reload

```bash
uvicorn main:app --reload
```

### Environment Variables for Development

```bash
# Required services
export QDRANT_URL=http://localhost:6333
export OLLAMA_BASE_URL=http://localhost:11434
export REDIS_URL=redis://localhost:6379/0

# Optional: Use OpenAI
export OPENAI_API_KEY=sk-...
export EMBEDDING_PROVIDER=openai
export LLM_PROVIDER=openai
```

## License

MIT
