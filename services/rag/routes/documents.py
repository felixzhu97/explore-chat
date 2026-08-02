"""Document management API routes."""
import logging
import time
from typing import Annotated, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import JSONResponse

from deps import get_processor, get_embeddings, get_qdrant
from core.document_processor import DocumentProcessor
from core.embedding import EmbeddingService
from core.qdrant_client import QdrantService
from schemas.document import (
    DocumentUploadResponse,
    DocumentInfo,
    DocumentListResponse,
    DocumentDeleteResponse,
)
from schemas.common import PaginationParams

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: Annotated[UploadFile, File(description="Document to upload")],
    processor: DocumentProcessor = Depends(get_processor),
    embeddings: EmbeddingService = Depends(get_embeddings),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Upload and process a document.

    Supports: PDF, HTML, Markdown, DOCX, TXT
    """
    start_time = time.time()

    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    allowed_extensions = {".pdf", ".html", ".htm", ".md", ".txt", ".docx", ".doc"}
    ext = file.filename.lower().split(".")[-1]
    if f".{ext}" not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Read file content
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    max_size = 50 * 1024 * 1024  # 50MB
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    try:
        # Process the document
        result = await processor.process_uploaded_file(
            content,
            file.filename,
            file.content_type or "application/octet-stream",
        )

        # Generate embeddings and store in Qdrant
        from core.chunker import get_chunker
        chunker = get_chunker()

        # Re-parse to get chunks
        from utils.pdf_parser import parse_file
        parsed = parse_file(content, file.filename)

        if parsed["type"] == "pdf":
            pages = parsed.get("pages", [])
            text_parts = [
                {"text": p["text"], "page_number": p["page_number"]}
                for p in pages
            ]
        else:
            text_parts = [{"text": parsed.get("text", ""), "page_number": None}]

        metadata = {
            "filename": file.filename,
            "content_type": file.content_type or "application/octet-stream",
            "source_type": "document",
            "doc_id": result["id"],
            "created_at": result["metadata"].get("created_at", ""),
        }

        chunks = chunker.chunk_documents(text_parts, metadata, result["id"])

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
                        "filename": file.filename,
                        "source_type": "document",
                        "created_at": metadata["created_at"],
                        "page": chunk.metadata.get("page"),
                    },
                })

        # Store in Qdrant
        if points:
            await qdrant.upsert("documents", points)

        elapsed = (time.time() - start_time) * 1000

        logger.info(
            f"Document '{file.filename}' processed in {elapsed:.2f}ms: "
            f"{len(chunks)} chunks"
        )

        return DocumentUploadResponse(
            id=result["id"],
            filename=file.filename,
            file_size=len(content),
            content_type=file.content_type or "application/octet-stream",
            status="completed",
            chunks_count=len(chunks),
        )

    except Exception as e:
        logger.error(f"Failed to process document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    List all uploaded documents.
    """
    try:
        # Search for all documents to get unique doc_ids
        results = await qdrant.search(
            collection="documents",
            query_vector=[0] * 768,  # Dummy vector, we just want payload
            top_k=1000,
        )

        # Group by doc_id to count chunks
        doc_info: dict[str, dict] = {}
        for result in results:
            payload = result.get("payload", {})
            doc_id = payload.get("doc_id")
            if doc_id:
                if doc_id not in doc_info:
                    doc_info[doc_id] = {
                        "filename": payload.get("filename"),
                        "source_type": payload.get("source_type"),
                        "created_at": payload.get("created_at"),
                        "chunk_count": 0,
                    }
                doc_info[doc_id]["chunk_count"] += 1

        # Convert to list format
        documents = []
        for doc_id, info in doc_info.items():
            documents.append(DocumentInfo(
                id=doc_id,
                filename=info.get("filename"),
                content_type="",
                file_size=0,
                status="indexed",
                chunks_count=info["chunk_count"],
                created_at=None,
                updated_at=None,
            ))

        # Apply pagination
        total = len(documents)
        documents = documents[skip:skip + limit]

        return DocumentListResponse(
            documents=documents,
            total=total,
            skip=skip,
            limit=limit,
        )
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doc_id}", response_model=DocumentInfo)
async def get_document(
    doc_id: str,
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Get document details by ID.
    """
    try:
        # Search for chunks with this doc_id
        results = await qdrant.search(
            collection="documents",
            query_vector=[0] * 768,  # Dummy vector, we just want payload
            top_k=1000,
        )

        # Find chunks belonging to this document
        doc_chunks = [r for r in results if r["payload"].get("doc_id") == doc_id]

        if not doc_chunks:
            raise HTTPException(status_code=404, detail="Document not found")

        first_chunk = doc_chunks[0]

        return DocumentInfo(
            id=doc_id,
            filename=first_chunk["payload"].get("filename"),
            content_type=first_chunk["payload"].get("content_type", ""),
            file_size=0,
            status="indexed",
            chunks_count=len(doc_chunks),
            created_at=None,
            updated_at=None,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{doc_id}", response_model=DocumentDeleteResponse)
async def delete_document(
    doc_id: str,
    qdrant: QdrantService = Depends(get_qdrant),
):
    """
    Delete a document and all its chunks.
    """
    try:
        # Search for all chunks with this doc_id
        results = await qdrant.search(
            collection="documents",
            query_vector=[0] * 768,  # Dummy vector
            top_k=1000,
        )

        # Find chunks belonging to this document
        doc_chunks = [r for r in results if r["payload"].get("doc_id") == doc_id]

        if not doc_chunks:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete the chunks
        point_ids = [chunk["id"] for chunk in doc_chunks]
        await qdrant.delete_points("documents", point_ids)

        logger.info(f"Deleted document '{doc_id}' with {len(point_ids)} chunks")

        return DocumentDeleteResponse(
            id=doc_id,
            deleted=True,
            chunks_deleted=len(point_ids),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
