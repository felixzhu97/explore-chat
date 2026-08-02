from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader


class ReelsMultimodalDataset(Dataset):
    def __init__(
        self,
        samples: List[Tuple[str, str, List[float], List[float], float]],
    ):
        self.samples = samples
        users = sorted({u for u, _, _, _, _ in samples})
        reels = sorted({r for _, r, _, _, _ in samples})
        self.user_index: Dict[str, int] = {u: idx for idx, u in enumerate(users)}
        self.reel_index: Dict[str, int] = {r: idx for idx, r in enumerate(reels)}

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        user_id, reel_id, text_vec, vision_vec, label = self.samples[idx]
        u_idx = self.user_index[user_id]
        r_idx = self.reel_index[reel_id]
        text_tensor = torch.tensor(text_vec, dtype=torch.float32)
        vision_tensor = torch.tensor(vision_vec, dtype=torch.float32)
        label_tensor = torch.tensor(label, dtype=torch.float32)
        return (
            torch.tensor(u_idx, dtype=torch.long),
            torch.tensor(r_idx, dtype=torch.long),
            text_tensor,
            vision_tensor,
            label_tensor,
        )


class ReelsMultimodalModel(nn.Module):
    def __init__(
        self,
        num_users: int,
        num_reels: int,
        text_dim: int,
        vision_dim: int,
        embedding_dim: int = 64,
        hidden_dim: int = 128,
    ):
        super().__init__()
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.reel_embedding = nn.Embedding(num_reels, embedding_dim)
        fusion_dim = embedding_dim * 2 + text_dim + vision_dim
        self.mlp = nn.Sequential(
            nn.Linear(fusion_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid(),
        )

    def forward(
        self,
        user_indices: torch.Tensor,
        reel_indices: torch.Tensor,
        text_vectors: torch.Tensor,
        vision_vectors: torch.Tensor,
    ) -> torch.Tensor:
        u = self.user_embedding(user_indices)
        r = self.reel_embedding(reel_indices)
        x = torch.cat([u, r, text_vectors, vision_vectors], dim=-1)
        return self.mlp(x).squeeze(-1)


@dataclass
class ReelsTrainConfig:
    batch_size: int = 1024
    epochs: int = 3
    learning_rate: float = 1e-3
    device: str = "cuda" if torch.cuda.is_available() else "cpu"


def train_reels_multimodal(
    samples: List[Tuple[str, str, List[float], List[float], float]],
    text_dim: int,
    vision_dim: int,
    config: Optional[ReelsTrainConfig] = None,
) -> Tuple[ReelsMultimodalModel, Dict[str, int], Dict[str, int]]:
    cfg_local = config or ReelsTrainConfig()
    dataset = ReelsMultimodalDataset(samples)
    if len(dataset) == 0:
        raise ValueError("Empty reels dataset")
    loader = DataLoader(dataset, batch_size=cfg_local.batch_size, shuffle=True, num_workers=0, pin_memory=True)
    device = torch.device(cfg_local.device)
    model = ReelsMultimodalModel(
        num_users=len(dataset.user_index),
        num_reels=len(dataset.reel_index),
        text_dim=text_dim,
        vision_dim=vision_dim,
    ).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=cfg_local.learning_rate)
    criterion = nn.BCELoss()
    model.train()
    for epoch in range(cfg_local.epochs):
        total_loss = 0.0
        total_examples = 0
        for user_idx, reel_idx, text_vec, vision_vec, label in loader:
            user_idx = user_idx.to(device)
            reel_idx = reel_idx.to(device)
            text_vec = text_vec.to(device)
            vision_vec = vision_vec.to(device)
            label = label.to(device)
            optimizer.zero_grad()
            preds = model(user_idx, reel_idx, text_vec, vision_vec)
            loss = criterion(preds, label)
            loss.backward()
            optimizer.step()
            batch = label.size(0)
            total_loss += float(loss.item()) * batch
            total_examples += batch
        avg_loss = total_loss / max(1, total_examples)
        print(f"Reels epoch {epoch + 1}/{cfg_local.epochs} loss={avg_loss:.4f}")
    return model, dataset.user_index, dataset.reel_index

