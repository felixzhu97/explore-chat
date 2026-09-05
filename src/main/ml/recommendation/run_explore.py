import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as cfg
from domain.etl.cassandra_engagement import (
    get_cassandra_session,
    load_engagement_and_posts,
    hot_score,
)
from domain.export.explore_export import write_explore_hot


def main() -> int:
    try:
        session, cluster = get_cassandra_session()
    except Exception as e:
        print(f"Cassandra connect failed: {e}")
        return 1
    try:
        data = load_engagement_and_posts(session, max_posts=1000)
    finally:
        cluster.shutdown()
    if not data:
        print("No engagement data, skipping explore.")
        return 0
    scored = [
        (hot_score(created_at, like_count, comment_count), post_id, author_id, created_at)
        for post_id, author_id, created_at, like_count, comment_count in data
    ]
    scored.sort(key=lambda x: -x[0])
    top = scored[:500]
    entries = [
        {"postId": post_id, "authorId": author_id, "createdAt": created_at}
        for _, post_id, author_id, created_at in top
    ]
    write_explore_hot(entries)
    print(f"Wrote {len(entries)} explore hot entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
