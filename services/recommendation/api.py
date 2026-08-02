"""HTTP routes for recommendation ranking/recall."""

from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

import service as rec_service

router = APIRouter()


class RankRequest(BaseModel):
    userId: str
    candidateIds: List[str]
    limit: Optional[int] = 50
    region: Optional[str] = None
    language: Optional[str] = None
    experimentId: Optional[str] = None
    variantId: Optional[str] = None


class RankedItem(BaseModel):
    id: str
    score: float


class RankResponse(BaseModel):
    items: List[RankedItem]


class RecallRequest(BaseModel):
    userId: str
    limit: Optional[int] = 100


class RecallResponse(BaseModel):
    items: List[RankedItem]


@router.get("/health")
def health():
    return {"status": "ok", "service": "recommendation"}


@router.post("/v1/feed/rank", response_model=RankResponse)
async def rank_feed(body: RankRequest) -> RankResponse:
    ranked = rec_service.rank_candidates(
        body.userId,
        body.candidateIds,
        limit=body.limit or 50,
        region=body.region,
        language=body.language,
        experiment_id=body.experimentId,
        variant_id=body.variantId,
    )
    return RankResponse(items=[RankedItem(id=i, score=s) for i, s in ranked])


@router.post("/v1/explore/rank", response_model=RankResponse)
async def rank_explore(body: RankRequest) -> RankResponse:
    return await rank_feed(body)


@router.post("/v1/reels/rank", response_model=RankResponse)
async def rank_reels(body: RankRequest) -> RankResponse:
    return await rank_feed(body)


@router.post("/v1/feed/recall", response_model=RecallResponse)
async def recall_feed(body: RecallRequest) -> RecallResponse:
    items = rec_service.recall_from_store(body.userId, body.limit or 100)
    return RecallResponse(items=[RankedItem(id=i, score=s) for i, s in items])
