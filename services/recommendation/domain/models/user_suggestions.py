from collections import defaultdict
from typing import List, Tuple
import pandas as pd


def fof_candidates(
    follows: List[Tuple[str, str]],
    exclude_self: bool = True,
) -> dict:
    follow_pairs = pd.DataFrame(follows, columns=["follower_id", "following_id"])
    follow_set = set(zip(follow_pairs["follower_id"], follow_pairs["following_id"]))
    by_follower = follow_pairs.groupby("follower_id")["following_id"].apply(list).to_dict()
    user_ids = set(follow_pairs["follower_id"]) | set(follow_pairs["following_id"])
    suggestions = {}
    for user_id in user_ids:
        following = set(by_follower.get(user_id, []))
        if exclude_self:
            following.add(user_id)
        cand_count = defaultdict(int)
        for fid in following:
            for fof in by_follower.get(fid, []):
                if fof not in following and (user_id, fof) not in follow_set:
                    cand_count[fof] += 1
        top = sorted(cand_count.items(), key=lambda x: -x[1])
        suggestions[user_id] = [uid for uid, _ in top]
    return suggestions


def merge_with_implicit(
    fof_suggestions: dict,
    user_item_matrix,
    user_ids: list,
    item_ids: list,
    n_recommend: int = 50,
) -> dict:
    try:
        import implicit
        from scipy.sparse import csr_matrix
        model = implicit.als.AlternatingLeastSquares(factors=64)
        model.fit(user_item_matrix)
        user_id_to_idx = {u: i for i, u in enumerate(user_ids)}
        idx_to_item = {i: u for i, u in enumerate(item_ids)}
        merged = {}
        for user_id, fof_list in fof_suggestions.items():
            ui = user_id_to_idx.get(user_id)
            if ui is None:
                merged[user_id] = fof_list[:n_recommend]
                continue
            try:
                recs = model.recommend(ui, user_item_matrix[ui], N=n_recommend, filter_already_liked_items=True)
            except Exception:
                merged[user_id] = fof_list[:n_recommend]
                continue
            rec_ids = [idx_to_item[r] for r, _ in recs if r in idx_to_item]
            seen = set(rec_ids)
            for c in fof_list:
                if c not in seen and len(rec_ids) < n_recommend:
                    rec_ids.append(c)
                    seen.add(c)
            merged[user_id] = rec_ids[:n_recommend]
        return merged
    except ImportError:
        return {u: lst[:n_recommend] for u, lst in fof_suggestions.items()}


def implicit_als_with_annoy(
    follows: list,
    user_ids: list,
    n_recommend: int = 50,
    n_trees: int = 50,
) -> dict:
    try:
        import implicit
        from implicit.ann.annoy import AnnoyModel
        from scipy.sparse import csr_matrix
        import numpy as np
    except ImportError:
        return {}
    uid_to_idx = {u: i for i, u in enumerate(user_ids)}
    n = len(user_ids)
    row, col, data = [], [], []
    for a, b in follows:
        i, j = uid_to_idx.get(a), uid_to_idx.get(b)
        if i is not None and j is not None:
            row.append(i)
            col.append(j)
            data.append(1.0)
    if not row:
        return {}
    mat = csr_matrix((data, (row, col)), shape=(n, n))
    base = implicit.als.AlternatingLeastSquares(factors=64)
    model = AnnoyModel(base, approximate_similar_items=True, approximate_recommend=True, n_trees=n_trees)
    model.fit(mat)
    out = {}
    for uid in user_ids:
        u_idx = uid_to_idx.get(uid)
        if u_idx is None:
            out[uid] = []
            continue
        try:
            ids, _ = model.recommend(u_idx, mat[u_idx], N=n_recommend, filter_already_liked_items=True)
            out[uid] = [user_ids[i] for i in ids if i != u_idx]
        except Exception:
            out[uid] = []
    return out
