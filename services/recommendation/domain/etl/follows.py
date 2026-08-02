import psycopg2
from typing import List, Tuple
import config as cfg


def load_follows(limit_following_per_user: int = 0) -> List[Tuple[str, str]]:
    conn = psycopg2.connect(cfg.DATABASE_URL)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT follower_id, following_id
        FROM user_follows
        ORDER BY follower_id, following_id
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    if limit_following_per_user <= 0:
        return [(r[0], r[1]) for r in rows]
    from collections import defaultdict
    by_follower = defaultdict(list)
    for a, b in rows:
        by_follower[a].append(b)
    out = []
    for a, followers in by_follower.items():
        for b in followers[:limit_following_per_user]:
            out.append((a, b))
    return out


def load_user_ids() -> set:
    conn = psycopg2.connect(cfg.DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT id FROM users")
    ids = {r[0] for r in cur.fetchall()}
    cur.close()
    conn.close()
    return ids
