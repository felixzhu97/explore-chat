"""Database sync API routes."""
import logging
import time
import httpx
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends

from deps import get_processor, get_embeddings, get_qdrant
from core.document_processor import DocumentProcessor
from core.embedding import EmbeddingService
from core.qdrant_client import QdrantService
from schemas.query import (
    SyncPostsRequest,
    SyncCommentsRequest,
    SyncResult,
)
from config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sync", tags=["Sync"])


@router.post("/posts", response_model=SyncResult)
async def sync_posts(
    request: Optional[SyncPostsRequest] = None,
    processor: DocumentProcessor = Depends(get_processor),
    embeddings: EmbeddingService = Depends(get_embeddings),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Sync posts from the database to the vector store.
    """
    start_time = time.time()
    request = request or SyncPostsRequest()
    settings = get_settings()

    total = 0
    successful = 0
    failed = 0
    errors = []

    try:
        # Build query parameters
        params = {"limit": request.limit}
        if request.post_ids:
            params["ids"] = ",".join(request.post_ids)
        if request.since_hours:
            since = datetime.utcnow() - timedelta(hours=request.since_hours)
            params["since"] = since.isoformat()

        # Fetch posts from the database service
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(
                f"{settings.database_url}/posts",
                params=params,
            )
            response.raise_for_status()
            posts = response.json()

        total = len(posts)

        # Process posts in batches
        batch_size = 10
        for i in range(0, len(posts), batch_size):
            batch = posts[i:i + batch_size]

            for post in batch:
                try:
                    content = post.get("content", "")
                    if not content:
                        continue

                    doc_id = f"post_{post['id']}"
                    metadata = {
                        "source_type": "post",
                        "source_id": post["id"],
                        "author_id": post.get("author_id", ""),
                        "created_at": post.get("created_at", ""),
                        "doc_id": doc_id,
                    }

                    chunks = processor._chunker.chunk_text(content, metadata, doc_id)

                    if not chunks:
                        continue

                    # Generate embeddings
                    texts = [chunk.text for chunk in chunks]
                    vectors = await embeddings.embed(texts)

                    # Prepare points for Qdrant
                    points = [
                        {
                            "id": chunk.id,
                            "vector": vector,
                            "payload": {
                                "text": chunk.text,
                                "doc_id": doc_id,
                                "source_type": "post",
                                "source_id": post["id"],
                                "author_id": post.get("author_id", ""),
                                "created_at": post.get("created_at", ""),
                            },
                        }
                        for chunk, vector in zip(chunks, vectors)
                    ]

                    # Store in Qdrant
                    await qdrant.upsert("posts", points)
                    successful += 1

                except Exception as e:
                    failed += 1
                    errors.append(f"Post {post.get('id')}: {str(e)}")
                    logger.error(f"Failed to sync post {post.get('id')}: {e}")

        elapsed = int((time.time() - start_time) * 1000)

        logger.info(
            f"Synced posts: {successful}/{total} successful in {elapsed}ms"
        )

        return SyncResult(
            total=total,
            successful=successful,
            failed=failed,
            errors=errors,
            duration_ms=elapsed,
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to fetch posts: {e}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch posts from database: {e}",
        )
    except Exception as e:
        logger.error(f"Failed to sync posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comments", response_model=SyncResult)
async def sync_comments(
    request: Optional[SyncCommentsRequest] = None,
    processor: DocumentProcessor = Depends(get_processor),
    embeddings: EmbeddingService = Depends(get_embeddings),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Sync comments from the database to the vector store.
    """
    start_time = time.time()
    request = request or SyncCommentsRequest()
    settings = get_settings()

    total = 0
    successful = 0
    failed = 0
    skipped = 0
    errors = []

    try:
        # Build query parameters
        params = {"limit": request.limit}
        if request.comment_ids:
            params["ids"] = ",".join(request.comment_ids)
        if request.post_ids:
            params["post_ids"] = ",".join(request.post_ids)

        # Fetch comments from the database service
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(
                f"{settings.database_url}/comments",
                params=params,
            )
            response.raise_for_status()
            comments = response.json()

        total = len(comments)

        # Process comments in batches
        batch_size = 10
        for i in range(0, len(comments), batch_size):
            batch = comments[i:i + batch_size]

            for comment in batch:
                try:
                    content = comment.get("content", "")
                    if not content:
                        skipped += 1
                        continue

                    doc_id = f"comment_{comment['id']}"
                    metadata = {
                        "source_type": "comment",
                        "source_id": comment["id"],
                        "post_id": comment.get("post_id", ""),
                        "author_id": comment.get("author_id", ""),
                        "created_at": comment.get("created_at", ""),
                        "doc_id": doc_id,
                    }

                    chunks = processor._chunker.chunk_text(content, metadata, doc_id)

                    if not chunks:
                        skipped += 1
                        continue

                    # Generate embeddings
                    texts = [chunk.text for chunk in chunks]
                    vectors = await embeddings.embed(texts)

                    # Prepare points for Qdrant
                    points = [
                        {
                            "id": chunk.id,
                            "vector": vector,
                            "payload": {
                                "text": chunk.text,
                                "doc_id": doc_id,
                                "source_type": "comment",
                                "source_id": comment["id"],
                                "post_id": comment.get("post_id", ""),
                                "author_id": comment.get("author_id", ""),
                                "created_at": comment.get("created_at", ""),
                            },
                        }
                        for chunk, vector in zip(chunks, vectors)
                    ]

                    # Store in Qdrant
                    await qdrant.upsert("comments", points)
                    successful += 1

                except Exception as e:
                    failed += 1
                    errors.append(f"Comment {comment.get('id')}: {str(e)}")
                    logger.error(f"Failed to sync comment {comment.get('id')}: {e}")

        elapsed = int((time.time() - start_time) * 1000)

        logger.info(
            f"Synced comments: {successful}/{total} successful, {skipped} skipped"
        )

        return SyncResult(
            total=total,
            successful=successful,
            failed=failed,
            skipped=skipped,
            errors=errors,
            duration_ms=elapsed,
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to fetch comments: {e}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch comments from database: {e}",
        )
    except Exception as e:
        logger.error(f"Failed to sync comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/all", response_model=dict)
async def sync_all(
    processor: DocumentProcessor = Depends(get_processor),
    embeddings: EmbeddingService = Depends(get_embeddings),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Sync all content types (posts, comments, documents).
    """
    # Import routers to access the endpoint functions
    from routes.crawler import router as crawler_router

    # For now, we'll just sync posts and comments
    # In a full implementation, you'd call the other sync endpoints

    posts_result = await sync_posts(
        SyncPostsRequest(limit=1000),
        processor,
        embeddings,
        qdrant,
    )

    comments_result = await sync_comments(
        SyncCommentsRequest(limit=1000),
        processor,
        embeddings,
        qdrant,
    )

    return {
        "posts": posts_result.model_dump(),
        "comments": comments_result.model_dump(),
        "status": "completed",
    }
