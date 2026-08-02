from typing import List, Tuple, Dict
import numpy as np
from scipy.sparse import csr_matrix


def build_lightfm_suggestions(
    follows: List[Tuple[str, str]],
    user_ids: List[str],
    user_buckets: Dict[str, int],
    n_recommend: int = 50,
    epochs: int = 20,
) -> Dict[str, List[str]]:
    try:
        from lightfm import LightFM
    except ImportError:
        return {}
    follow_set = set(follows)
    n_users = len(user_ids)
    uid_to_idx = {u: i for i, u in enumerate(user_ids)}
    interactions = []
    for a, b in follow_set:
        if a in uid_to_idx and b in uid_to_idx:
            i, j = uid_to_idx[a], uid_to_idx[b]
            interactions.append((i, j, 1.0))
    if not interactions:
        return {u: [] for u in user_ids}
    ui = np.array(interactions, dtype=np.int32)
    if ui.size == 0:
        return {u: [] for u in user_ids}
    row = ui[:, 0]
    col = ui[:, 1]
    data = np.ones(len(interactions), dtype=np.float32)
    inter = csr_matrix((data, (row, col)), shape=(n_users, n_users))
    item_features = np.zeros((n_users, 5), dtype=np.float32)
    for i, uid in enumerate(user_ids):
        item_features[i, 0] = 1.0
        b = user_buckets.get(uid, 0)
        if 0 <= b < 4:
            item_features[i, 1 + b] = 1.0
    model = LightFM(loss="warp", no_components=64)
    model.fit(inter, item_features=csr_matrix(item_features), epochs=epochs, num_threads=2)
    out = {}
    for uid in user_ids:
        u_idx = uid_to_idx.get(uid)
        if u_idx is None:
            out[uid] = []
            continue
        known = set()
        for a, b in follow_set:
            if a == uid:
                known.add(uid_to_idx.get(b))
        known.discard(None)
        try:
            scores = model.predict(u_idx, np.arange(n_users), item_features=csr_matrix(item_features))
            for j in known:
                scores[j] = -1e9
            scores[u_idx] = -1e9
            top = np.argsort(-scores)[:n_recommend]
            out[uid] = [user_ids[j] for j in top if scores[j] > -1e8]
        except Exception:
            out[uid] = []
    return out
