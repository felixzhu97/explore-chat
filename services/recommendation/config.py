import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", os.getenv("RECOMMENDATION_PORT", "8100")))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://whatschat:whatschat123@localhost:5433/whatschat",
)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD") or None
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL") or os.getenv(
    "REDIS_URL", "redis://localhost:6379/0"
)
CASSANDRA_CONTACT_POINTS = (os.getenv("CASSANDRA_CONTACT_POINTS") or "localhost").split(
    ","
)
CASSANDRA_KEYSPACE = os.getenv("CASSANDRA_KEYSPACE", "whatschat")
CASSANDRA_LOCAL_DC = os.getenv("CASSANDRA_LOCAL_DC", "datacenter1")

SUGGESTION_REDIS_KEY_PREFIX = "recommendation:user:"
SUGGESTION_TTL_SECONDS = 3600
SUGGESTION_MAX_PER_USER = 50
FOF_FOLLOWING_LIMIT = 500
