from dataclasses import dataclass
from typing import List, Tuple, Dict
import math
import random
from datetime import datetime, timezone

import numpy as np
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader

from domain.etl.cassandra_engagement import get_cassandra_session, load_post_likes, load_engagement_and_posts


def parse_iso_to_datetime(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return datetime.now(timezone.utc)


class UserPostInteractionDataset(Dataset):
    def __init__(
        self,
        interactions: List[Tuple[str, str, str]],
        post_stats: Dict[str, Tuple[int, int, float]],
        negative_ratio: int = 3,
    ):
        users = sorted({u for u, _, _ in interactions})
        posts = sorted({p for _, p, _ in interactions})
        self.user_index = {u: i for i, u in enumerate(users)}
        self.post_index = {p: i for i, p in enumerate(posts)}
        self.post_ids = posts
        self.samples = []
        for user_id, post_id, created_at in interactions:
            if user_id not in self.user_index or post_id not in self.post_index:
                continue
            label = 1.0
            like_count, comment_count, age_hours = post_stats.get(post_id, (0, 0, 0.0))
            self.samples.append((user_id, post_id, created_at, like_count, comment_count, age_hours, label))
        rng = random.Random(42)
        for user_id, post_id, created_at, like_count, comment_count, age_hours, _ in list(self.samples):
            for _ in range(negative_ratio):
                neg_post = rng.choice(self.post_ids)
                if neg_post == post_id:
                    continue
                n_like, n_comment, n_age = post_stats.get(neg_post, (0, 0, 0.0))
                self.samples.append((user_id, neg_post, created_at, n_like, n_comment, n_age, 0.0))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        user_id, post_id, created_at, like_count, comment_count, age_hours, label = self.samples[idx]
        u_idx = self.user_index[user_id]
        p_idx = self.post_index[post_id]
        features = np.array(
            [
                math.log1p(float(like_count)),
                math.log1p(float(comment_count)),
                float(age_hours),
            ],
            dtype=np.float32,
        )
        return (
            torch.tensor(u_idx, dtype=torch.long),
            torch.tensor(p_idx, dtype=torch.long),
            torch.from_numpy(features),
            torch.tensor(label, dtype=torch.float32),
        )


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


@dataclass
class TrainConfig:
    batch_size: int = 1024
    epochs: int = 3
    learning_rate: float = 1e-3
    negative_ratio: int = 3
    max_interactions: int = 500000
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    output_path: str = "models/feed_ranker.pt"


def build_post_stats() -> Dict[str, Tuple[int, int, float]]:
    session, cluster = get_cassandra_session()
    try:
        rows = load_engagement_and_posts(session, max_posts=500000)
    finally:
        cluster.shutdown()
    now = datetime.now(timezone.utc)
    stats = {}
    for post_id, _, created_at_str, like_count, comment_count in rows:
        created = parse_iso_to_datetime(created_at_str)
        age_hours = max(0.0, (now - created).total_seconds() / 3600.0)
        stats[post_id] = (like_count, comment_count, age_hours)
    return stats


def load_interactions(max_rows: int) -> List[Tuple[str, str, str]]:
    session, cluster = get_cassandra_session()
    try:
        rows = load_post_likes(session, max_rows=max_rows)
    finally:
        cluster.shutdown()
    return rows


def train_feed_ranker(config: TrainConfig) -> None:
    interactions = load_interactions(config.max_interactions)
    if not interactions:
        print("No interactions, skipping feed ranker training.")
        return
    post_stats = build_post_stats()
    dataset = UserPostInteractionDataset(
        interactions=interactions,
        post_stats=post_stats,
        negative_ratio=config.negative_ratio,
    )
    num_users = len(dataset.user_index)
    num_posts = len(dataset.post_index)
    if num_users == 0 or num_posts == 0:
        print("Empty user or post set, skipping training.")
        return
    loader = DataLoader(
        dataset,
        batch_size=config.batch_size,
        shuffle=True,
        num_workers=0,
        pin_memory=True,
    )
    device = torch.device(config.device)
    model = FeedRanker(
        num_users=num_users,
        num_posts=num_posts,
        feature_dim=3,
    ).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=config.learning_rate)
    criterion = nn.BCELoss()
    model.train()
    for epoch in range(config.epochs):
        total_loss = 0.0
        total_examples = 0
        for user_indices, post_indices, features, labels in loader:
            user_indices = user_indices.to(device)
            post_indices = post_indices.to(device)
            features = features.to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            preds = model(user_indices, post_indices, features)
            loss = criterion(preds, labels)
            loss.backward()
            optimizer.step()
            batch_size = labels.size(0)
            total_loss += float(loss.item()) * batch_size
            total_examples += batch_size
        avg_loss = total_loss / max(1, total_examples)
        print(f"Epoch {epoch + 1}/{config.epochs} loss={avg_loss:.4f}")
    torch.save(
        {
            "model_state": model.state_dict(),
            "num_users": num_users,
            "num_posts": num_posts,
            "user_index": dataset.user_index,
            "post_index": dataset.post_index,
        },
        config.output_path,
    )
    print(f"Saved feed ranker model to {config.output_path}")


def main() -> int:
    config = TrainConfig()
    train_feed_ranker(config)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

