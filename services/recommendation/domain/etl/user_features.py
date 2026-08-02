import psycopg2
from typing import List, Tuple
from datetime import datetime
import numpy as np
import config as cfg


def load_user_features() -> List[Tuple[str, int]]:
    conn = psycopg2.connect(cfg.DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT id, created_at FROM users")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    out = []
    for uid, created in rows:
        if created and hasattr(created, "month"):
            bucket = created.month % 4
        else:
            try:
                dt = datetime.fromisoformat(str(created).replace("Z", "+00:00")) if created else None
                bucket = (dt.month % 4) if dt else 0
            except Exception:
                bucket = 0
        out.append((uid, bucket))
    return out


def build_item_features_matrix(
    user_ids: List[str],
    user_buckets: dict,
    n_buckets: int = 4,
) -> np.ndarray:
    n = len(user_ids)
    feats = np.zeros((n, n_buckets + 1), dtype=np.float32)
    for i, uid in enumerate(user_ids):
        feats[i, 0] = 1.0
        b = user_buckets.get(uid, 0)
        if 0 <= b < n_buckets:
            feats[i, 1 + b] = 1.0
    return feats
