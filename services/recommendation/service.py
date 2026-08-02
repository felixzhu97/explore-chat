"""Recommendation orchestration: rankers, vector stores, recall."""

from __future__ import annotations

import os
from typing import List, Optional, Tuple

import redis

import config as cfg
from feed_ranker import FeedRankingService
from vector_store import FaissVectorStore, RedisVectorStore


class VectorStoreFactory:
    @staticmethod
    def create_redis_store() -> RedisVectorStore:
        client = redis.from_url(
            cfg.REDIS_URL, password=cfg.REDIS_PASSWORD, decode_responses=True
        )
        return RedisVectorStore(
            client,
            user_key_prefix="rec:user:vec:",
            item_key_prefix="rec:post:vec:",
        )

    @staticmethod
    def create_faiss_store() -> FaissVectorStore:
        dim = int(os.getenv("FAISS_DIM", "64"))
        return FaissVectorStore(
            dim=dim,
            index_path=os.getenv("FAISS_INDEX_PATH"),
            ids_path=os.getenv("FAISS_IDS_PATH"),
        )

    @staticmethod
    def get_vector_store():
        backend = os.getenv("VECTOR_BACKEND", "redis").lower()
        if backend == "faiss":
            return VectorStoreFactory.create_faiss_store()
        return VectorStoreFactory.create_redis_store()


class RankerFactory:
    @staticmethod
    def create_ranker() -> Optional[FeedRankingService]:
        root = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(root, "models", "feed_ranker.pt")
        if not os.path.isfile(model_path):
            return None
        return FeedRankingService(model_path=model_path)


class AppState:
    def __init__(self) -> None:
        self._ranker: Optional[FeedRankingService] = None
        self._redis_store: Optional[RedisVectorStore] = None
        self._faiss_store: Optional[FaissVectorStore] = None

    @property
    def ranker(self) -> Optional[FeedRankingService]:
        if self._ranker is None:
            self._ranker = RankerFactory.create_ranker()
        return self._ranker

    def get_vector_store(self):
        backend = os.getenv("VECTOR_BACKEND", "redis").lower()
        if backend == "faiss":
            if self._faiss_store is None:
                self._faiss_store = VectorStoreFactory.create_faiss_store()
            return self._faiss_store
        if self._redis_store is None:
            self._redis_store = VectorStoreFactory.create_redis_store()
        return self._redis_store

    def clear(self) -> None:
        self._ranker = None
        self._redis_store = None
        self._faiss_store = None


app_state = AppState()


def rank_candidates(
    user_id: str,
    candidate_ids: List[str],
    *,
    limit: int = 50,
    region: Optional[str] = None,
    language: Optional[str] = None,
    experiment_id: Optional[str] = None,
    variant_id: Optional[str] = None,
) -> List[Tuple[str, float]]:
    if not candidate_ids:
        return []
    ranker = app_state.ranker
    if ranker is None:
        return [(cid, 1.0) for cid in candidate_ids[:limit]]
    ranked = ranker.rank(
        user_id,
        candidate_ids,
        region=region,
        language=language,
        experiment_id=experiment_id,
        variant_id=variant_id,
    )
    return ranked[:limit]


def recall_from_store(user_id: str, top_k: int) -> List[Tuple[str, float]]:
    store = app_state.get_vector_store()
    if not isinstance(store, RedisVectorStore):
        return []
    user_key = f"{store.user_key_prefix}{user_id}"
    raw = store.client.get(user_key)
    if not raw:
        return []
    vec = [float(x) for x in raw.split(",") if x]
    return store.query_similar_items(vec, top_k)
