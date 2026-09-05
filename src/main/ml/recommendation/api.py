"""HTTP routes for recommendation ranking/recall (AIP REST)."""

from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

import service as rec_service

router = APIRouter()


class RankRequest(BaseModel):
    user_id: str
    candidate_ids: List[str]
    limit: Optional[int] = 50
    region: Optional[str] = None
    language: Optional[str] = None
    experiment_id: Optional[str] = None
    variant_id: Optional[str] = None


class RankedItem(BaseModel):
    id: str
    score: float


class RankResponse(BaseModel):
    items: List[RankedItem]


class RecallRequest(BaseModel):
    user_id: str
    limit: Optional[int] = 100


class RecallResponse(BaseModel):
    items: List[RankedItem]


@router.get("/health")
def health():
    return {"status": "ok", "service": "recommendation"}


def _rank(body: RankRequest) -> RankResponse:
    ranked = rec_service.rank_candidates(
        body.user_id,
        body.candidate_ids,
        limit=body.limit or 50,
        region=body.region,
        language=body.language,
        experiment_id=body.experiment_id,
        variant_id=body.variant_id,
    )
    return RankResponse(items=[RankedItem(id=i, score=s) for i, s in ranked])


@router.post("/api/v1/feeds:rank", response_model=RankResponse)
async def rank_feed(body: RankRequest) -> RankResponse:
    return _rank(body)


@router.post("/api/v1/explores:rank", response_model=RankResponse)
async def rank_explore(body: RankRequest) -> RankResponse:
    return _rank(body)


@router.post("/api/v1/reels:rank", response_model=RankResponse)
async def rank_reels(body: RankRequest) -> RankResponse:
    return _rank(body)


@router.post("/api/v1/feeds:recall", response_model=RecallResponse)
async def recall_feed(body: RecallRequest) -> RecallResponse:
    items = rec_service.recall_from_store(body.user_id, body.limit or 100)
    return RecallResponse(items=[RankedItem(id=i, score=s) for i, s in items])
