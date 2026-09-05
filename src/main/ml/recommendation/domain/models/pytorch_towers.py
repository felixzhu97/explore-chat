from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader

from domain.etl.cassandra_engagement import get_cassandra_session, load_post_likes
from domain.vector_store import RedisVectorStore
import config as cfg
import redis


class UserItemDataset(Dataset):
    def __init__(self, interactions: List[Tuple[str, str, str]]):
        users = sorted({u for u, _, _ in interactions})
        items = sorted({i for _, i, _ in interactions})
        self.user_index: Dict[str, int] = {u: idx for idx, u in enumerate(users)}
        self.item_index: Dict[str, int] = {i: idx for idx, i in enumerate(items)}
        self.samples: List[Tuple[int, int]] = []
        for user_id, item_id, _ in interactions:
            u = self.user_index.get(user_id)
            v = self.item_index.get(item_id)
            if u is None or v is None:
                continue
            self.samples.append((u, v))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        u_idx, v_idx = self.samples[idx]
        return torch.tensor(u_idx, dtype=torch.long), torch.tensor(v_idx, dtype=torch.long)


class UserItemTowers(nn.Module):
    def __init__(
        self,
        num_users: int,
        num_items: int,
        embedding_dim: int = 64,
    ):
        super().__init__()
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)

    def forward(self, user_indices: torch.Tensor, item_indices: torch.Tensor) -> torch.Tensor:
        u = self.user_embedding(user_indices)
        v = self.item_embedding(item_indices)
        return torch.sum(u * v, dim=-1)


@dataclass
class TowerTrainConfig:
    batch_size: int = 2048
    epochs: int = 2
    learning_rate: float = 5e-4
    max_interactions: int = 500000
    embedding_dim: int = 64
    device: str = "cuda" if torch.cuda.is_available() else "cpu"


def load_interactions(max_rows: int) -> List[Tuple[str, str, str]]:
    session, cluster = get_cassandra_session()
    try:
        rows = load_post_likes(session, max_rows=max_rows)
    finally:
        cluster.shutdown()
    return rows


def get_redis_client() -> redis.Redis:
    return redis.from_url(cfg.REDIS_URL, password=cfg.REDIS_PASSWORD, decode_responses=True)


def train_towers_and_export_vectors(config: Optional[TowerTrainConfig] = None) -> None:
    cfg_local = config or TowerTrainConfig()
    interactions = load_interactions(cfg_local.max_interactions)
    if not interactions:
        print("No interactions for towers, skipping.")
        return
    dataset = UserItemDataset(interactions)
    num_users = len(dataset.user_index)
    num_items = len(dataset.item_index)
    if num_users == 0 or num_items == 0:
        print("Empty towers dataset, skipping.")
        return
    loader = DataLoader(dataset, batch_size=cfg_local.batch_size, shuffle=True, num_workers=0, pin_memory=True)
    device = torch.device(cfg_local.device)
    model = UserItemTowers(num_users=num_users, num_items=num_items, embedding_dim=cfg_local.embedding_dim).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=cfg_local.learning_rate)
    criterion = nn.BCEWithLogitsLoss()
    model.train()
    for epoch in range(cfg_local.epochs):
        total_loss = 0.0
        total_examples = 0
        for user_indices, item_indices in loader:
            user_indices = user_indices.to(device)
            item_indices = item_indices.to(device)
            labels = torch.ones(user_indices.size(0), dtype=torch.float32, device=device)
            optimizer.zero_grad()
            logits = model(user_indices, item_indices)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            batch_size = labels.size(0)
            total_loss += float(loss.item()) * batch_size
            total_examples += batch_size
        avg_loss = total_loss / max(1, total_examples)
        print(f"Towers epoch {epoch + 1}/{cfg_local.epochs} loss={avg_loss:.4f}")
    model.eval()
    with torch.no_grad():
        user_vectors = model.user_embedding.weight.detach().cpu().tolist()
        item_vectors = model.item_embedding.weight.detach().cpu().tolist()
    inv_user = {idx: user_id for user_id, idx in dataset.user_index.items()}
    inv_item = {idx: item_id for item_id, idx in dataset.item_index.items()}
    user_map: Dict[str, List[float]] = {}
    item_map: Dict[str, List[float]] = {}
    for idx, vec in enumerate(user_vectors):
        user_id = inv_user.get(idx)
        if user_id is not None:
            user_map[user_id] = vec
    for idx, vec in enumerate(item_vectors):
        item_id = inv_item.get(idx)
        if item_id is not None:
            item_map[item_id] = vec
    client = get_redis_client()
    store = RedisVectorStore(client, user_key_prefix="rec:user:vec:", item_key_prefix="rec:post:vec:")
    store.upsert_user_vectors(user_map)
    store.upsert_item_vectors(item_map)
    client.close()
    print(f"Exported {len(user_map)} user vectors and {len(item_map)} item vectors to Redis.")


def main() -> int:
    train_towers_and_export_vectors()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

