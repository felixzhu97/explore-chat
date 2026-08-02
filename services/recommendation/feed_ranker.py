from typing import Dict, List, Optional, Tuple

import math
from datetime import datetime, timezone
import os

import torch
from torch import nn

from etl.cassandra_engagement import get_cassandra_session


class FeedRanker(nn.Module):
    def __init__(
        self,
        num_users: int,
        num_posts: int,
        feature_dim: int,
        embedding_dim: int = 64,
        hidden_dim: int = 128,
    ):
        super().__init__()
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.post_embedding = nn.Embedding(num_posts, embedding_dim)
        input_dim = embedding_dim * 2 + feature_dim
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid(),
        )

    def forward(self, user_indices: torch.Tensor, post_indices: torch.Tensor, features: torch.Tensor) -> torch.Tensor:
        u = self.user_embedding(user_indices)
        p = self.post_embedding(post_indices)
        x = torch.cat([u, p, features], dim=-1)
        return self.mlp(x).squeeze(-1)


class FeedRankingService:
    def __init__(self, model_path: str, device: Optional[str] = None) -> None:
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
        self.base_model_path = model_path
        self.models: Dict[str, FeedRanker] = {}
        self.user_index: Dict[str, int] = {}
        self.post_index: Dict[str, int] = {}
        self._session = None
        self._cluster = None
        self._load_model("default", model_path)

    def _load_model(self, key: str, path: str) -> None:
        checkpoint = torch.load(path, map_location=self.device)
        num_users = int(checkpoint["num_users"])
        num_posts = int(checkpoint["num_posts"])
        user_index = dict(checkpoint.get("user_index") or {})
        post_index = dict(checkpoint.get("post_index") or {})
        model = FeedRanker(num_users=num_users, num_posts=num_posts, feature_dim=3)
        model.load_state_dict(checkpoint["model_state"])
        model.to(self.device)
        model.eval()
        self.models[key] = model
        if key == "default":
            self.user_index = user_index
            self.post_index = post_index

    def _select_model_key(self, region: Optional[str], language: Optional[str], experiment_id: Optional[str], variant_id: Optional[str]) -> str:
        if experiment_id and variant_id:
            return f"{experiment_id}_{variant_id}"
        if region and language:
            return f"{region}_{language}"
        if region:
            return region
        if language:
            return language
        return "default"

    def _get_model(self, key: str) -> FeedRanker:
        if key in self.models:
            return self.models[key]
        suffix = key.replace(":", "_").replace("/", "_")
        candidate = f"models/feed_ranker_{suffix}.pt"
        if os.path.exists(candidate):
            self._load_model(key, candidate)
            return self.models[key]
        return self.models["default"]

    def _get_cassandra(self):
        if self._session is None or self._cluster is None:
            session, cluster = get_cassandra_session()
            self._session = session
            self._cluster = cluster
        return self._session

    def _load_post_features(self, post_ids: List[str]) -> Dict[str, Tuple[float, float, float]]:
        session = self._get_cassandra()
        if not session or not post_ids:
            return {}
        placeholders = ", ".join(["%s"] * len(post_ids))
        query = f"SELECT post_id, like_count, comment_count, created_at FROM post_engagement_counts WHERE post_id IN ({placeholders})"
        rows = session.execute(query, tuple(post_ids))
        now = datetime.now(timezone.utc)
        features = {}
        for row in rows:
            post_id = row.post_id
            like_count = float(row.like_count or 0)
            comment_count = float(row.comment_count or 0)
            created_at = row.created_at
            if hasattr(created_at, "isoformat"):
                created_dt = created_at
            else:
                try:
                    created_dt = datetime.fromisoformat(str(created_at).replace("Z", "+00:00"))
                except Exception:
                    created_dt = now
            age_hours = max(0.0, (now - created_dt).total_seconds() / 3600.0)
            features[post_id] = (like_count, comment_count, age_hours)
        return features

    def rank(
        self,
        user_id: str,
        candidate_ids: List[str],
        region: Optional[str] = None,
        language: Optional[str] = None,
        experiment_id: Optional[str] = None,
        variant_id: Optional[str] = None,
    ) -> List[Tuple[str, float]]:
        if not candidate_ids:
            return []
        key = self._select_model_key(region, language, experiment_id, variant_id)
        model = self._get_model(key)
        user_idx = self.user_index.get(user_id, 0)
        post_features = self._load_post_features(candidate_ids)
        user_indices = []
        post_indices = []
        feature_rows = []
        id_list = []
        for post_id in candidate_ids:
            post_idx = self.post_index.get(post_id)
            if post_idx is None:
                continue
            like_count, comment_count, age_hours = post_features.get(post_id, (0.0, 0.0, 0.0))
            feature_rows.append(
                [
                    math.log1p(like_count),
                    math.log1p(comment_count),
                    age_hours,
                ]
            )
            user_indices.append(user_idx)
            post_indices.append(post_idx)
            id_list.append(post_id)
        if not id_list:
            return []
        user_tensor = torch.tensor(user_indices, dtype=torch.long, device=self.device)
        post_tensor = torch.tensor(post_indices, dtype=torch.long, device=self.device)
        feature_tensor = torch.tensor(feature_rows, dtype=torch.float32, device=self.device)
        with torch.no_grad():
            scores = model(user_tensor, post_tensor, feature_tensor)
        result = list(zip(id_list, scores.detach().cpu().tolist()))
        result.sort(key=lambda x: x[1], reverse=True)
        return result


