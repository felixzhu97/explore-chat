"""Web crawler API routes."""
import logging
import time
import asyncio
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends

from deps import get_processor, get_embeddings, get_qdrant
from core.document_processor import DocumentProcessor
from core.embedding import EmbeddingService
from core.qdrant_client import QdrantService
from core.chunker import get_chunker
from schemas.document import (
    ScrapeRequest,
    ScrapeResponse,
    CrawlRequest,
    CrawlResponse,
)
from schemas.common import BaseResponse
from config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crawler", tags=["Crawler"])


async def fetch_url(url: str, timeout: int = 30) -> dict:
    """Fetch and parse a URL."""
    settings = get_settings()

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; RAGBot/1.0)",
            },
            follow_redirects=True,
        )
        response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type and "text/plain" not in content_type:
            raise ValueError(f"Content type not supported: {content_type}")

        return {
            "url": str(response.url),
            "content": response.text,
            "title": response.url.path,
            "status_code": response.status_code,
        }


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_url(
    request: ScrapeRequest,
    processor: DocumentProcessor = Depends(get_processor),
    embeddings: EmbeddingService = Depends(get_embeddings),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Scrape a single URL and index its content.
    """
    start_time = time.time()
    settings = get_settings()

    try:
        # Fetch the URL
        fetch_result = await fetch_url(
            request.url,
            timeout=settings.crawler_timeout,
        )

        # Process the webpage
        result = await processor.process_webpage(
            url=fetch_result["url"],
            content=fetch_result["content"],
            title=fetch_result["title"],
        )

        # Generate embeddings and store
        chunker = get_chunker()
        metadata = {
            "source_url": fetch_result["url"],
            "title": fetch_result["title"],
            "source_type": "webpage",
            "doc_id": result["id"],
            "created_at": "",
        }

        from utils.pdf_parser import HTMLParser
        parsed = HTMLParser.parse(fetch_result["content"])

        # Limit text length to avoid context overflow
        max_text_length = 100000  # ~100k chars should be safe for most models
        text = parsed["text"]
        if len(text) > max_text_length:
            logger.warning(f"Text too long ({len(text)} chars), truncating to {max_text_length}")
            text = text[:max_text_length]

        chunks = chunker.chunk_text(text, metadata, result["id"])

        # Generate embeddings in batches
        batch_size = 10
        points = []

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            texts = [chunk.text for chunk in batch]
            vectors = await embeddings.embed(texts)

            for chunk, vector in zip(batch, vectors):
                points.append({
                    "id": chunk.id,
                    "vector": vector,
                    "payload": {
                        "text": chunk.text,
                        "doc_id": result["id"],
                        "source_url": fetch_result["url"],
                        "source_type": "webpage",
                        "created_at": "",
                    },
                })

        # Store in Qdrant
        if points:
            await qdrant.upsert("webpages", points)

        elapsed = (time.time() - start_time) * 1000

        logger.info(
            f"Scraped '{fetch_result['url']}' in {elapsed:.2f}ms: "
            f"{len(chunks)} chunks"
        )

        return ScrapeResponse(
            id=result["id"],
            url=fetch_result["url"],
            title=fetch_result["title"],
            content_length=len(parsed["text"]),
            chunks_count=len(chunks),
            status="completed",
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error scraping {request.url}: {e}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch URL: {e}",
        )
    except Exception as e:
        logger.error(f"Failed to scrape {request.url}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/crawl", response_model=CrawlResponse)
async def crawl_urls(
    request: CrawlRequest,
    processor: DocumentProcessor = Depends(get_processor),
    embeddings: EmbeddingService = Depends(get_embeddings),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Crawl multiple URLs in parallel.
    """
    start_time = time.time()
    results = []
    successful = 0
    failed = 0
    settings = get_settings()

    async def process_url(url: str) -> ScrapeResponse:
        try:
            fetch_result = await fetch_url(url, timeout=settings.crawler_timeout)

            result = await processor.process_webpage(
                url=fetch_result["url"],
                content=fetch_result["content"],
                title=fetch_result["title"],
            )

            # Generate embeddings and store
            chunker = get_chunker()
            from utils.pdf_parser import HTMLParser
            parsed = HTMLParser.parse(fetch_result["content"])

            # Limit text length to avoid context overflow
            max_text_length = 100000
            text = parsed["text"]
            if len(text) > max_text_length:
                logger.warning(f"Text too long ({len(text)} chars), truncating to {max_text_length}")
                text = text[:max_text_length]

            metadata = {
                "source_url": fetch_result["url"],
                "source_type": "webpage",
                "doc_id": result["id"],
                "created_at": "",
            }

            chunks = chunker.chunk_text(text, metadata, result["id"])

            batch_size = 10
            points = []

            for i in range(0, len(chunks), batch_size):
                batch = chunks[i:i + batch_size]
                texts = [chunk.text for chunk in batch]
                vectors = await embeddings.embed(texts)

                for chunk, vector in zip(batch, vectors):
                    points.append({
                        "id": chunk.id,
                        "vector": vector,
                        "payload": {
                            "text": chunk.text,
                            "doc_id": result["id"],
                            "source_url": fetch_result["url"],
                            "source_type": "webpage",
                        },
                    })

            if points:
                await qdrant.upsert("webpages", points)

            return ScrapeResponse(
                id=result["id"],
                url=fetch_result["url"],
                title=fetch_result["title"],
                content_length=len(parsed["text"]),
                chunks_count=len(chunks),
                status="completed",
            )

        except Exception as e:
            logger.error(f"Failed to crawl {url}: {e}")
            return ScrapeResponse(
                id="",
                url=url,
                title="",
                content_length=0,
                chunks_count=0,
                status=f"error: {str(e)}",
            )

    # Process URLs with limited concurrency
    semaphore = asyncio.Semaphore(5)

    async def process_with_semaphore(url: str) -> ScrapeResponse:
        async with semaphore:
            return await process_url(url)

    tasks = [process_with_semaphore(url) for url in request.urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    processed_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            processed_results.append(ScrapeResponse(
                id="",
                url=request.urls[i],
                title="",
                content_length=0,
                chunks_count=0,
                status=f"error: {str(result)}",
            ))
            failed += 1
        else:
            processed_results.append(result)
            if result.status == "completed":
                successful += 1
            else:
                failed += 1

    elapsed = (time.time() - start_time) * 1000

    logger.info(
        f"Crawled {len(request.urls)} URLs in {elapsed:.2f}ms: "
        f"{successful} successful, {failed} failed"
    )

    return CrawlResponse(
        total_urls=len(request.urls),
        successful=successful,
        failed=failed,
        results=processed_results,
    )
