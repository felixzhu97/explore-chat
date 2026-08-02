import json
import redis
import config as cfg

EXPLORE_HOT_KEY = "explore:hot"
EXPLORE_TTL = 300


def get_redis_client() -> redis.Redis:
    return redis.from_url(
        cfg.REDIS_URL,
        password=cfg.REDIS_PASSWORD,
        decode_responses=True,
    )


def write_explore_hot(entries: list) -> None:
    client = get_redis_client()
    value = json.dumps(entries)
    client.set(EXPLORE_HOT_KEY, value, ex=EXPLORE_TTL)
    client.close()
