"""HTTP routes for RAG (health + domain routers)."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from starlette.responses import Response

import service as rag_service
from api_crawler import router as crawler_router
from api_documents import router as documents_router
from api_query import router as query_router
from api_sync import router as sync_router
from domain.schemas.common import HealthStatus

router = APIRouter()
router.include_router(documents_router, prefix="/api/v1")
router.include_router(crawler_router, prefix="/api/v1")
router.include_router(sync_router, prefix="/api/v1")
router.include_router(query_router, prefix="/api/v1")


@router.get("/health", response_model=HealthStatus, tags=["Health"])
async def health_check():
    return await rag_service.health_status()


@router.get("/health/live", tags=["Health"])
async def liveness():
    return {"status": "alive"}


@router.get("/health/ready", tags=["Health"])
async def readiness():
    result = await rag_service.readiness()
    if not result.get("ok"):
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not ready", "reason": result.get("reason")},
        )
    return {"status": "ready"}


@router.get("/metrics", tags=["Monitoring"])
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/", tags=["Root"])
async def root():
    return {
        "service": "RAG Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
