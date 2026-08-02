import math
from datetime import datetime, timezone
from typing import List, Tuple
import config as cfg


def get_cassandra_session():
    from cassandra.cluster import Cluster
    cluster = Cluster(
        contact_points=cfg.CASSANDRA_CONTACT_POINTS,
        local_dc=cfg.CASSANDRA_LOCAL_DC,
    )
    session = cluster.connect(cfg.CASSANDRA_KEYSPACE)
    return session, cluster


def load_engagement_and_posts(
    session,
    max_posts: int = 2000,
) -> List[Tuple[str, str, str, int, int]]:
    rows = session.execute(
        "SELECT post_id, like_count, comment_count FROM post_engagement_counts",
    )
    post_counts = []
    for row in rows:
        post_id = row.post_id
        like_count = int(row.like_count or 0)
        comment_count = int(row.comment_count or 0)
        post_counts.append((post_id, like_count, comment_count))
        if len(post_counts) >= max_posts:
            break
    result = []
    for post_id, like_count, comment_count in post_counts:
        row = session.execute(
            "SELECT user_id, created_at FROM post_by_id WHERE post_id = %s",
            (post_id,),
        ).one()
        if not row:
            continue
        author_id = row.user_id
        created_at = row.created_at
        created_at_str = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)
        result.append((post_id, author_id, created_at_str, like_count, comment_count))
    return result


def load_post_likes(
    session,
    max_rows: int = 500000,
) -> List[Tuple[str, str, str]]:
    rows = session.execute(
        "SELECT user_id, post_id, created_at FROM post_likes",
    )
    result = []
    for row in rows:
        user_id = row.user_id
        post_id = row.post_id
        created_at = row.created_at
        created_at_str = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)
        result.append((user_id, post_id, created_at_str))
        if len(result) >= max_rows:
            break
    return result


def hot_score(created_at_iso: str, like_count: int, comment_count: int) -> float:
    try:
        created = datetime.fromisoformat(created_at_iso.replace("Z", "+00:00"))
    except Exception:
        created = datetime.now(timezone.utc)
    now = datetime.now(created.tzinfo or timezone.utc)
    age_hours = (now - created).total_seconds() / 3600
    recency = math.exp(-age_hours * math.log(2) / 24)
    engagement = math.log(1 + like_count + comment_count)
    return recency + 2.0 * engagement
