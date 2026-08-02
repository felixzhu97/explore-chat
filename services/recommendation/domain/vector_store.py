from abc import ABC, abstractmethod
from typing import Dict, Iterable, List, Tuple, Optional

import math
import numpy as np


class VectorStore(ABC):
    @abstractmethod
    def upsert_user_vectors(self, vectors: Dict[str, List[float]]) -> None:
        raise NotImplementedError

    @abstractmethod
    def upsert_item_vectors(self, vectors: Dict[str, List[float]]) -> None:
        raise NotImplementedError

    @abstractmethod
    def query_similar_items(self, user_vector: List[float], top_k: int) -> List[Tuple[str, float]]:
        raise NotImplementedError


class RedisVectorStore(VectorStore):
    def __init__(self, client, user_key_prefix: str = "rec:user:vec:", item_key_prefix: str = "rec:item:vec:"):
        self.client = client
        self.user_key_prefix = user_key_prefix
        self.item_key_prefix = item_key_prefix

    def upsert_user_vectors(self, vectors: Dict[str, List[float]]) -> None:
        pipe = self.client.pipeline()
        for user_id, vec in vectors.items():
            key = f"{self.user_key_prefix}{user_id}"
            pipe.set(key, ",".join(str(x) for x in vec))
        pipe.execute()

    def upsert_item_vectors(self, vectors: Dict[str, List[float]]) -> None:
        pipe = self.client.pipeline()
        for item_id, vec in vectors.items():
            key = f"{self.item_key_prefix}{item_id}"
            pipe.set(key, ",".join(str(x) for x in vec))
        pipe.execute()

    def query_similar_items(self, user_vector: List[float], top_k: int) -> List[Tuple[str, float]]:
        keys = list(self.client.scan_iter(f"{self.item_key_prefix}*"))
        if not keys:
            return []
        scores = []
        uv = user_vector
        for key in keys:
            raw = self.client.get(key)
            if not raw:
                continue
            parts = raw.split(",")
            item_vec = [float(x) for x in parts if x]
            score = self._cosine_similarity(uv, item_vec)
            item_id = key.replace(self.item_key_prefix, "", 1)
            scores.append((item_id, score))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _cosine_similarity(self, a: Iterable[float], b: Iterable[float]) -> float:
        ax = list(a)
        bx = list(b)
        if not ax or not bx or len(ax) != len(bx):
            return 0.0
        dot = sum(x * y for x, y in zip(ax, bx))
        na = math.sqrt(sum(x * x for x in ax))
        nb = math.sqrt(sum(x * x for x in bx))
        if na == 0.0 or nb == 0.0:
            return 0.0
        return dot / (na * nb)


class FaissVectorStore(VectorStore):
    def __init__(self, dim: int, index_path: Optional[str] = None, ids_path: Optional[str] = None):
        import faiss

        self.faiss = faiss
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.id_map: List[str] = []
        if index_path and ids_path:
            self.index = faiss.read_index(index_path)
            with open(ids_path, "r", encoding="utf-8") as f:
                self.id_map = [line.strip() for line in f if line.strip()]

    def upsert_user_vectors(self, vectors: Dict[str, List[float]]) -> None:
        return

    def upsert_item_vectors(self, vectors: Dict[str, List[float]]) -> None:
        ids = []
        vecs = []
        for item_id, vec in vectors.items():
            if len(vec) != self.dim:
                continue
            ids.append(item_id)
            vecs.append(vec)
        if not vecs:
            return
        x = np.array(vecs, dtype="float32")
        self.index.add(x)
        self.id_map.extend(ids)

    def query_similar_items(self, user_vector: List[float], top_k: int) -> List[Tuple[str, float]]:
        if not self.id_map or self.index.ntotal == 0:
            return []
        if len(user_vector) != self.dim:
            return []
        x = np.array([user_vector], dtype="float32")
        scores, idx = self.index.search(x, top_k)
        result: List[Tuple[str, float]] = []
        for i, s in zip(idx[0], scores[0]):
            if i < 0 or i >= len(self.id_map):
                continue
            result.append((self.id_map[i], float(s)))
        return result

