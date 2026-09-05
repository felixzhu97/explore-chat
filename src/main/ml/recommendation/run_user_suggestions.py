import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as cfg
from domain.etl.follows import load_follows, load_user_ids
from domain.etl.user_features import load_user_features
from domain.models.user_suggestions import fof_candidates, implicit_als_with_annoy
from domain.models.lightfm_suggestions import build_lightfm_suggestions
from domain.export.redis_export import write_user_suggestions


def main() -> int:
    limit = cfg.FOF_FOLLOWING_LIMIT
    follows = load_follows(limit_following_per_user=limit)
    if not follows:
        print("No follow data, skipping.")
        return 0
    fof = fof_candidates(follows, exclude_self=True)
    all_users = list(load_user_ids())
    if not all_users:
        write_user_suggestions(fof)
        print("Wrote FoF-only suggestions.")
        return 0
    user_buckets = dict(load_user_features())
    try:
        lightfm_recs = build_lightfm_suggestions(
            follows, all_users, user_buckets,
            n_recommend=cfg.SUGGESTION_MAX_PER_USER,
            epochs=20,
        )
    except Exception as e:
        print(f"LightFM failed ({e}), using FoF only.")
        lightfm_recs = {}
    try:
        implicit_recs = implicit_als_with_annoy(
            follows, all_users,
            n_recommend=cfg.SUGGESTION_MAX_PER_USER,
            n_trees=50,
        )
    except Exception as e:
        print(f"Implicit+Annoy failed ({e}), skipping.")
        implicit_recs = {}
    suggestions = {}
    for uid in all_users:
        seen = set()
        merged = []
        for c in lightfm_recs.get(uid, []):
            if c not in seen and c != uid:
                merged.append(c)
                seen.add(c)
        for c in implicit_recs.get(uid, []):
            if c not in seen and c != uid:
                merged.append(c)
                seen.add(c)
        for c in fof.get(uid, []):
            if c not in seen and c != uid:
                merged.append(c)
                seen.add(c)
        suggestions[uid] = merged[: cfg.SUGGESTION_MAX_PER_USER]
    write_user_suggestions(suggestions)
    print(f"Wrote suggestions for {len(suggestions)} users (LightFM + Implicit/Annoy + FoF).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
