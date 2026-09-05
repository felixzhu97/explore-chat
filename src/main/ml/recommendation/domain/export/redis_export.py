import json
import redis
from typing import List
import config as cfg


def get_redis_client() -> redis.Redis:
    return redis.from_url(
        cfg.REDIS_URL,
        password=cfg.REDIS_PASSWORD,
        decode_responses=True,
    )


def write_user_suggestions(suggestions: dict, ttl_seconds: int = 0) -> None:
    client = get_redis_client()
    ttl = ttl_seconds or cfg.SUGGESTION_TTL_SECONDS
    max_per = cfg.SUGGESTION_MAX_PER_USER
    prefix = cfg.SUGGESTION_REDIS_KEY_PREFIX
    pipe = client.pipeline()
    for user_id, rec_list in suggestions.items():
        key = f"{prefix}{user_id}"
        value = json.dumps(rec_list[:max_per])
        pipe.set(key, value, ex=ttl)
    pipe.execute()
    client.close()
