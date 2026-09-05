import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from celery import Celery
import config as cfg

app = Celery(
    "recommendation",
    broker=cfg.CELERY_BROKER_URL,
    backend=cfg.CELERY_BROKER_URL,
    include=["tasks"],
)
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_default_retry_delay=60,
    task_max_retries=2,
    beat_schedule={
        "suggestions-every-6h": {
            "task": "tasks.run_suggestions",
            "schedule": 21600.0,
        },
        "explore-every-5min": {
            "task": "tasks.run_explore",
            "schedule": 300.0,
        },
    },
)
