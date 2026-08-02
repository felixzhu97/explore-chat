# Recommendation Service (Python)

Offline and online recommendation stack for WhatsChat:

- Batch jobs for follow suggestions, explore hot list, and vector embeddings (LightFM + implicit + PyTorch towers)
- PyTorch ranking models for Feed/Explore/Reels (user/post embeddings + engagement features)
- FastAPI online service for recall/rank, called by the NestJS API server

## Setup

```bash
cd services/recommendation
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
```

Configure `.env` with the same `DATABASE_URL`, `REDIS_URL`, and `CASSANDRA_*` as the server.

## Batch jobs (CLI)

User suggestions (LightFM with user features + implicit ALS + FoF), write to Redis `recommendation:user:{userId}`:

```bash
python run_user_suggestions.py
# or
python run_jobs.py --job suggestions
```

Explore hot list (Cassandra engagement + hot score -> Redis `explore:hot`):

```bash
python run_jobs.py --job explore
```

Feed ranking model (PyTorch, trained from Cassandra `post_likes` + `post_engagement_counts`, outputs `models/feed_ranker.pt`):

```bash
python run_jobs.py --job feed_rank
```

Vector towers for recall (user/post embeddings -> RedisVectorStore `rec:user:vec:{id}`, `rec:post:vec:{id}`):

```bash
python -m models.pytorch_towers
```

## Online ranking service (FastAPI)

Run the FastAPI service (used by NestJS `RecommendationService`):

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
# or: python main.py
```

By default it listens on `http://localhost:8000` and exposes:

- `POST /v1/feed/rank` – rank feed candidates for a user
- `POST /v1/explore/rank` – rank explore candidates (on top of `explore:hot`)
- `POST /v1/reels/rank` – rank Reels candidates
- `POST /v1/feed/recall` – vector-based recall using `RedisVectorStore` or `FaissVectorStore`

Environment variables:

- `RECOMMENDATION_API_URL` (server `.env`) – NestJS → FastAPI base URL (default `http://localhost:8000`)
- `VECTOR_BACKEND` – `redis` (default) or `faiss`
- `FAISS_DIM`, `FAISS_INDEX_PATH`, `FAISS_IDS_PATH` – optional Faiss index configuration

## Celery (optional)

Optional: run batch jobs on a schedule via Celery with Redis as broker.

Start worker (run tasks):

```bash
celery -A celery_app worker -l info
```

Start beat (schedule: suggestions every 6h, explore every 5min):

```bash
celery -A celery_app beat -l info
```

Or run worker and beat in one process (dev only):

```bash
celery -A celery_app worker -l info -B
```

Trigger tasks manually (for example from Python or another app):

```python
from tasks import run_suggestions, run_explore

run_suggestions.delay()
run_explore.delay()
```

Set `CELERY_BROKER_URL` in `.env` (defaults to `REDIS_URL`).
