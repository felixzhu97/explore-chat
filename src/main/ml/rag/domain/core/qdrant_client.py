"""Qdrant vector database client."""
import json
import logging
from typing import Any, Optional
from contextlib import asynccontextmanager

import qdrant_client
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from config import get_settings

logger = logging.getLogger(__name__)


class QdrantService:
    """Service for interacting with Qdrant vector database."""

    COLLECTION_CONFIGS = {
        "documents": {
            "vector_size": 768,
            "distance": models.Distance.COSINE,
        },
        "posts": {
            "vector_size": 768,
            "distance": models.Distance.COSINE,
        },
        "comments": {
            "vector_size": 768,
            "distance": models.Distance.COSINE,
        },
        "webpages": {
            "vector_size": 768,
            "distance": models.Distance.COSINE,
        },
    }

    def __init__(self) -> None:
        settings = get_settings()
        url = (settings.qdrant_url or "").strip()
        if url:
            self._client = QdrantClient(
                url=url,
                timeout=settings.qdrant_timeout,
            )
            logger.info(f"Qdrant client initialized with URL: {url}")
        else:
            path = settings.qdrant_path
            self._client = QdrantClient(path=path)
            logger.info(f"Qdrant client initialized with local path: {path}")
        self._vector_size = settings.qdrant_vector_size

    @property
    def client(self) -> QdrantClient:
        """Get the Qdrant client instance."""
        return self._client

    async def initialize_collections(self) -> None:
        """Initialize all required collections if they don't exist."""
        for collection_name, config in self.COLLECTION_CONFIGS.items():
            await self._ensure_collection(collection_name, config)

    async def _ensure_collection(
        self, name: str, config: dict[str, Any]
    ) -> None:
        """Ensure a collection exists with the given configuration."""
        try:
            self._client.get_collection(collection_name=name)
            logger.info(f"Collection '{name}' already exists")
        except (UnexpectedResponse, Exception):
            logger.info(f"Creating collection '{name}'")
            self._client.create_collection(
                collection_name=name,
                vectors_config=models.VectorParams(
                    size=config["vector_size"],
                    distance=config["distance"],
                ),
                optimizers_config=models.OptimizersConfigDiff(
                    indexing_threshold=20000,
                    memmap_threshold=20000,
                ),
            )
            self._client.create_payload_index(
                collection_name=name,
                field_name="source_type",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            self._client.create_payload_index(
                collection_name=name,
                field_name="created_at",
                field_schema=models.PayloadSchemaType.DATETIME,
            )
            logger.info(f"Collection '{name}' created successfully")

    async def upsert(
        self,
        collection: str,
        points: list[dict[str, Any]],
        wait: bool = True,
    ) -> dict[str, Any]:
        """
        Insert or update points in a collection.

        Args:
            collection: Collection name
            points: List of points with id, vector, and payload
            wait: Whether to wait for the operation to complete

        Returns:
            Operation result
        """
        try:
            result = self._client.upsert(
                collection_name=collection,
                points=[
                    models.PointStruct(
                        id=point["id"],
                        vector=point["vector"],
                        payload=point.get("payload", {}),
                    )
                    for point in points
                ],
                wait=wait,
            )
            logger.info(
                f"Upserted {len(points)} points to collection '{collection}'"
            )
            return {"status": "completed", "points_count": len(points)}
        except Exception as e:
            logger.error(f"Failed to upsert points: {e}")
            raise

    async def search(
        self,
        collection: str,
        query_vector: list[float],
        top_k: int = 5,
        score_threshold: Optional[float] = None,
        query_filter: Optional[dict] = None,
    ) -> list[dict[str, Any]]:
        """
        Search for similar vectors in a collection.

        Args:
            collection: Collection name
            query_vector: Query vector
            top_k: Number of results to return
            score_threshold: Minimum similarity score
            query_filter: Filter conditions

        Returns:
            List of search results with scores
        """
        search_params = models.SearchParams(hnsw_ef=128, exact=False)

        filter_condition = None
        if query_filter:
            filter_condition = self._build_filter(query_filter)

        results = self._client.query_points(
            collection_name=collection,
            query=query_vector,
            limit=top_k,
            score_threshold=score_threshold,
            query_filter=filter_condition,
            search_params=search_params,
            with_payload=True,
            with_vectors=False,
        )

        return [
            {
                "id": str(result.id),
                "score": result.score,
                "payload": result.payload,
            }
            for result in results.points
        ]

    async def search_batch(
        self,
        collection: str,
        query_vectors: list[list[float]],
        top_k: int = 5,
        score_threshold: Optional[float] = None,
    ) -> list[list[dict[str, Any]]]:
        """
        Batch search for similar vectors.

        Args:
            collection: Collection name
            query_vectors: List of query vectors
            top_k: Number of results per query
            score_threshold: Minimum similarity score

        Returns:
            List of search results for each query
        """
        results = self._client.query_batch_points(
            collection_name=collection,
            requests=[
                models.QueryPoints(
                    query=vector,
                    limit=top_k,
                    score_threshold=score_threshold,
                    with_payload=True,
                )
                for vector in query_vectors
            ],
        )

        return [
            [
                {
                    "id": str(hit.id),
                    "score": hit.score,
                    "payload": hit.payload,
                }
                for hit in result.points
            ]
            for result in results
        ]

    async def delete_points(
        self,
        collection: str,
        point_ids: list[str],
        wait: bool = True,
    ) -> dict[str, Any]:
        """Delete points from a collection."""
        result = self._client.delete(
            collection_name=collection,
            points_selector=models.PointIdsList(points=point_ids),
            wait=wait,
        )
        logger.info(
            f"Deleted {len(point_ids)} points from collection '{collection}'"
        )
        return {"status": "completed", "deleted_count": len(point_ids)}

    async def delete_by_filter(
        self,
        collection: str,
        filter_conditions: dict,
        wait: bool = True,
    ) -> dict[str, Any]:
        """Delete points matching filter conditions."""
        filter_obj = self._build_filter(filter_conditions)
        result = self._client.delete(
            collection_name=collection,
            points_selector=models.FilterSelector(filter=filter_obj),
            wait=wait,
        )
        return {"status": "completed"}

    async def count(
        self,
        collection: str,
        filter_conditions: Optional[dict] = None,
    ) -> int:
        """Count points in a collection."""
        result = self._client.count(
            collection_name=collection,
            count_filter=self._build_filter(filter_conditions) if filter_conditions else None,
        )
        return result.count

    async def get_collections(self) -> list[str]:
        """Get list of all collection names."""
        collections = self._client.get_collections()
        return [col.name for col in collections.collections]

    async def get_collection_info(self, collection: str) -> dict[str, Any]:
        """Get information about a collection."""
        info = self._client.get_collection(collection_name=collection)
        
        # Handle different API versions and vector configs
        params = info.config.params
        vectors = getattr(params, 'vectors', None)
        
        if vectors is not None:
            # Single vector config (returns VectorParams directly)
            if hasattr(vectors, 'size'):
                vector_size = vectors.size
                distance = vectors.distance
            # Multiple vectors config (dict-like)
            elif isinstance(vectors, dict) and 'default' in vectors:
                vector_size = vectors['default'].size
                distance = vectors['default'].distance
            else:
                vector_size = None
                distance = None
        else:
            vector_size = None
            distance = None
        
        return {
            "name": collection,
            "vectors_count": getattr(info, 'indexed_vectors_count', getattr(info, 'vectors_count', 0)),
            "points_count": info.points_count,
            "status": info.status,
            "vector_size": vector_size,
            "distance": distance,
        }

    async def health_check(self) -> bool:
        """Check if Qdrant is healthy."""
        try:
            self._client.get_collections()
            return True
        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return False

    def _build_filter(self, conditions: dict) -> models.Filter:
        """Build a Qdrant filter from conditions dict."""
        must_conditions = []

        for key, value in conditions.items():
            if isinstance(value, list):
                must_conditions.append(
                    models.FieldCondition(
                        key=key,
                        match=models.MatchAny(any=value),
                    )
                )
            elif isinstance(value, dict):
                for op, val in value.items():
                    if op == "gte":
                        must_conditions.append(
                            models.FieldCondition(
                                key=key,
                                range=models.Range(gte=val),
                            )
                        )
                    elif op == "lte":
                        must_conditions.append(
                            models.FieldCondition(
                                key=key,
                                range=models.Range(lte=val),
                            )
                        )
                    elif op == "gt":
                        must_conditions.append(
                            models.FieldCondition(
                                key=key,
                                range=models.Range(gt=val),
                            )
                        )
                    elif op == "lt":
                        must_conditions.append(
                            models.FieldCondition(
                                key=key,
                                range=models.Range(lt=val),
                            )
                        )
            else:
                must_conditions.append(
                    models.FieldCondition(
                        key=key,
                        match=models.MatchValue(value=value),
                    )
                )

        return models.Filter(must=must_conditions) if must_conditions else None


# Singleton instance
_qdrant_service: Optional[QdrantService] = None


def get_qdrant_service() -> QdrantService:
    """Get or create Qdrant service instance."""
    global _qdrant_service
    if _qdrant_service is None:
        _qdrant_service = QdrantService()
    return _qdrant_service
