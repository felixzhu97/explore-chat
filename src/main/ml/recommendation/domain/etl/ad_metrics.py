from typing import Dict, Tuple

import psycopg2

import config as cfg


def load_ad_events(max_rows: int = 1000000) -> Dict[Tuple[str, str, str], Dict[str, float]]:
    conn = psycopg2.connect(cfg.DATABASE_URL)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT event_name, properties, created_at
        FROM analytics_events
        WHERE event_name IN ('ad_impression', 'ad_click', 'ad_conversion')
        ORDER BY created_at DESC
        LIMIT %s
        """,
        (max_rows,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    agg: Dict[Tuple[str, str, str], Dict[str, float]] = {}
    for event_name, properties, created_at in rows:
        props = properties or {}
        if not isinstance(props, dict):
            continue
        account_id = str(props.get("adAccountId") or "")
        campaign_id = str(props.get("adCampaignId") or "")
        creative_id = str(props.get("adCreativeId") or "")
        if not account_id or not campaign_id:
            continue
        key = (account_id, campaign_id, creative_id)
        state = agg.get(key)
        if state is None:
            state = {
                "impressions": 0.0,
                "clicks": 0.0,
                "conversions": 0.0,
            }
            agg[key] = state
        if event_name == "ad_impression":
            state["impressions"] += 1.0
        elif event_name == "ad_click":
            state["clicks"] += 1.0
        elif event_name == "ad_conversion":
            state["conversions"] += 1.0
    return agg

