from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from domain.etl.cassandra_engagement import get_cassandra_session, load_post_likes


def load_user_post_engagement(
    max_rows: int = 1000000,
) -> Dict[Tuple[str, str], Dict[str, int]]:
    session, cluster = get_cassandra_session()
    try:
        rows = load_post_likes(session, max_rows=max_rows)
    finally:
        cluster.shutdown()
    counts: Dict[Tuple[str, str], Dict[str, int]] = defaultdict(lambda: {"like": 0})
    for user_id, post_id, _ in rows:
        key = (user_id, post_id)
        counts[key]["like"] += 1
    return counts


def build_user_recent_engagement_features(
    now: Optional[datetime] = None,
    max_rows: int = 1000000,
) -> Dict[Tuple[str, str], Dict[str, float]]:
    now_dt = now or datetime.now(timezone.utc)
    raw = load_user_post_engagement(max_rows=max_rows)
    features: Dict[Tuple[str, str], Dict[str, float]] = {}
    for key, vals in raw.items():
        like_count = float(vals.get("like", 0))
        features[key] = {
            "like_count": like_count,
        }
    return features

