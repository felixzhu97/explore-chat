"""RAG query API routes."""
import logging
import time
from typing import AsyncGenerator, Optional

import ollama
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI

import service as rag_service
from config import get_settings
from domain.core.embedding import EmbeddingService
from domain.core.qdrant_client import QdrantService
from domain.schemas.query import QueryRequest, QueryResponse, SourceDocument

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Query"])


def build_context_and_prompt(
    query: str,
    context_texts: list[str],
) -> tuple[str, str]:
    """Build context string and system prompt from retrieved documents."""
    context = "\n\n".join([
        f"[Source {i+1}]: {text[:500]}..." if len(text) > 500 else f"[Source {i+1}]: {text}"
        for i, text in enumerate(context_texts)
    ])

    system_prompt = f"""You are a helpful assistant that answers questions based on the provided context.
    
Context:
{context}

Instructions:
1. Answer the question based ONLY on the provided context.
2. If the context doesn't contain enough information to answer the question, say so.
3. Cite your sources using [Source N] notation when referencing specific information.
4. Be concise but thorough.
5. If you're uncertain, acknowledge the uncertainty.
"""
    return context, system_prompt


async def generate_answer(
    query: str,
    context_texts: list[str],
    provider: str,
    model: str,
    openai_client: Optional[AsyncOpenAI] = None,
) -> str:
    """Generate an answer using the LLM with retrieved context."""
    settings = get_settings()
    _, system_prompt = build_context_and_prompt(query, context_texts)

    if provider == "ollama":
        client = ollama.AsyncClient(host=settings.ollama_base_url)
        try:
            response = await client.chat(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                options={"timeout": settings.llm_timeout} if settings.llm_timeout else None,
            )
            return response["message"]["content"]
        except Exception as e:
            logger.error("Ollama chat failed: %s", e)
            raise HTTPException(status_code=503, detail="LLM service unavailable")
    else:
        try:
            response = await openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error("OpenAI chat failed: %s", e)
            raise HTTPException(status_code=503, detail="LLM service unavailable")


async def generate_answer_stream(
    query: str,
    context_texts: list[str],
    provider: str,
    model: str,
    openai_client: Optional[AsyncOpenAI] = None,
) -> AsyncGenerator[str, None]:
    """Generate an answer using the LLM with retrieved context (streaming)."""
    settings = get_settings()
    _, system_prompt = build_context_and_prompt(query, context_texts)

    if provider == "ollama":
        client = ollama.AsyncClient(host=settings.ollama_base_url)
        try:
            stream = await client.chat(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                stream=True,
                options={"timeout": settings.llm_timeout} if settings.llm_timeout else None,
            )
            async for chunk in stream:
                if chunk.get("message") and chunk["message"].get("content"):
                    yield f"data: {chunk['message']['content']}\n\n"
        except Exception as e:
            logger.error("Ollama streaming failed: %s", e)
            yield "data: Error: LLM service unavailable\n\n"

    else:
        try:
            stream = await openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                temperature=0.7,
                stream=True,
            )
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield f"data: {chunk.choices[0].delta.content}\n\n"
        except Exception as e:
            logger.error("OpenAI streaming failed: %s", e)
            yield "data: Error: LLM service unavailable\n\n"


async def search_collections(
    embeddings: EmbeddingService,
    qdrant: QdrantService,
    query_vector: list[float],
    collection: Optional[str],
    top_k: int,
) -> list[dict]:
    """Search across specified collections and return combined results."""
    collections_to_search = [collection] if collection else ["documents", "posts", "comments", "webpages"]
    all_results = []

    for coll in collections_to_search:
        try:
            results = await qdrant.search(
                collection=coll,
                query_vector=query_vector,
                top_k=top_k,
            )
            all_results.extend(results)
        except Exception as e:
            logger.warning("Failed to search collection %s: %s", coll, e)

    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results


@router.post("/documents:query", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    embeddings: EmbeddingService = Depends(rag_service.get_embeddings),
    qdrant: QdrantService = Depends(rag_service.get_qdrant),
):
    """Query the RAG system with a question."""
    start_time = time.time()
    settings = get_settings()

    try:
        query_vector = await embeddings.embed_single(request.query)
        all_results = await search_collections(
            embeddings, qdrant, query_vector, request.collection, request.top_k
        )
        top_results = all_results[:request.top_k]

        if not top_results:
            return QueryResponse(
                answer="No relevant documents found for your query.",
                sources=[],
                query=request.query,
                collection_used=request.collection,
                total_chunks_searched=0,
                generation_time_ms=int((time.time() - start_time) * 1000),
            )

        context_texts = [r["payload"]["text"] for r in top_results]
        answer = await generate_answer(
            query=request.query,
            context_texts=context_texts,
            provider=settings.llm_provider,
            model=settings.llm_model if settings.llm_provider == "ollama" else settings.openai_llm_model,
        )

        sources = []
        if request.include_sources:
            for result in top_results:
                sources.append(SourceDocument(
                    id=result["id"],
                    text=result["payload"].get("text", "")[:500],
                    score=result["score"],
                    metadata=result["payload"],
                ))

        generation_time = int((time.time() - start_time) * 1000)

        logger.info(
            "Query processed in %sms: %s sources retrieved",
            generation_time,
            len(top_results),
        )

        return QueryResponse(
            answer=answer,
            sources=sources,
            query=request.query,
            collection_used=request.collection,
            total_chunks_searched=len(all_results),
            generation_time_ms=generation_time,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Query failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents:streamQuery")
async def query_stream(
    request: QueryRequest,
    embeddings: EmbeddingService = Depends(rag_service.get_embeddings),
    qdrant: QdrantService = Depends(rag_service.get_qdrant),
):
    """Query the RAG system with streaming response."""
    start_time = time.time()
    settings = get_settings()

    try:
        query_vector = await embeddings.embed_single(request.query)
        all_results = await search_collections(
            embeddings, qdrant, query_vector, request.collection, request.top_k
        )
        top_results = all_results[:request.top_k]

        if not top_results:
            async def no_results_stream():
                yield "data: No relevant documents found for your query.\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                no_results_stream(),
                media_type="text/event-stream",
            )

        context_texts = [r["payload"]["text"] for r in top_results]
        openai_client = None
        if settings.llm_provider == "openai":
            openai_client = AsyncOpenAI(api_key=settings.openai_api_key)

        model = settings.llm_model if settings.llm_provider == "ollama" else settings.openai_llm_model

        async def generate():
            async for chunk in generate_answer_stream(
                query=request.query,
                context_texts=context_texts,
                provider=settings.llm_provider,
                model=model,
                openai_client=openai_client,
            ):
                yield chunk
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    except Exception as e:
        logger.error("Streaming query failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/collections")
async def list_collections(
    qdrant: QdrantService = Depends(rag_service.get_qdrant),
):
    """List all available collections."""
    try:
        collections = await qdrant.get_collections()
        collection_info = []

        for name in collections:
            info = await qdrant.get_collection_info(name)
            collection_info.append(info)

        return {
            "collections": collection_info,
        }

    except Exception as e:
        logger.error("Failed to list collections: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
