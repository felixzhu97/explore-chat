from typing import Dict, List, Optional, Tuple

import psycopg2
import json

import config as cfg


def load_reels_events(
    event_names: Optional[List[str]] = None,
    max_rows: int = 1000000,
) -> List[Tuple[str, str, float, float]]:
    names = event_names or ["reels_view", "reels_complete"]
    conn = psycopg2.connect(cfg.DATABASE_URL)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT event_name, user_id, properties, created_at
        FROM analytics_events
        WHERE event_name = ANY(%s)
        ORDER BY created_at DESC
        LIMIT %s
        """,
        (names, max_rows),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    out: List[Tuple[str, str, float, float]] = []
    for event_name, user_id, properties, created_at in rows:
        user = str(user_id) if user_id is not None else ""
        props = properties or {}
        if isinstance(props, str):
            try:
                props = json.loads(props)
            except Exception:
                props = {}
        reel_id = str(props.get("reelId") or "")
        if not user or not reel_id:
            continue
        watch_ms = float(props.get("watchTimeMs") or 0.0)
        duration_ms = float(props.get("durationMs") or 0.0)
        out.append((user, reel_id, watch_ms, duration_ms))
    return out


def build_reels_engagement_features(
    max_rows: int = 1000000,
) -> Dict[Tuple[str, str], Dict[str, float]]:
    events = load_reels_events(max_rows=max_rows)
    agg: Dict[Tuple[str, str], Dict[str, float]] = {}
    for user_id, reel_id, watch_ms, duration_ms in events:
        key = (user_id, reel_id)
        state = agg.get(key)
        if state is None:
            state = {
                "views": 0.0,
                "completes": 0.0,
                "total_watch_ms": 0.0,
                "total_duration_ms": 0.0,
            }
            agg[key] = state
        state["views"] += 1.0
        state["total_watch_ms"] += watch_ms
        state["total_duration_ms"] += duration_ms
        if duration_ms > 0.0 and watch_ms >= duration_ms * 0.9:
            state["completes"] += 1.0
    for key, state in agg.items():
        views = state["views"]
        completes = state["completes"]
        total_watch = state["total_watch_ms"]
        total_duration = state["total_duration_ms"]
        state["complete_rate"] = completes / views if views > 0.0 else 0.0
        state["avg_watch_ratio"] = (total_watch / total_duration) if total_duration > 0.0 else 0.0
    return agg

