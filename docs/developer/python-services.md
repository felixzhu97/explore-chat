# Python ML helpers — identical minimal layout

WhatsFeed keeps four optional Python HTTP helpers. Clients call **Nest only**; Nest calls these over loopback.

Every helper uses the **same top-level directory** and the same two layers: `api` → `service` → `domain`.

## Forced layout

```
services/<name>/
├── README.md
├── .env.example
├── requirements.txt      # sole dependency list
├── main.py               # FastAPI assemble + uvicorn
├── config.py             # dotenv + os.getenv (ports)
├── api.py                # all HTTP (flat api_*.py allowed; no routes/ dir)
├── service.py            # orchestration only
├── domain/               # ML / ETL / schemas / utils
│   └── __init__.py
├── tests/                # at least test_health.py or existing suite
└── (recommendation only) celery_app.py, tasks.py, run_*.py
```

Optional: `Dockerfile`, runtime dirs (`output/`, `uploads/` — gitignored).

## Start

```bash
cd services/<name>
uvicorn main:app --host 0.0.0.0 --port $PORT
```

| Service        | Default port | Nest env                   |
| -------------- | ------------ | -------------------------- |
| recommendation | 8000         | `RECOMMENDATION_API_URL`   |
| vision         | 8001         | `VISION_SERVICE_URL`       |
| rag            | 8002         | `RAG_SERVICE_URL` (docs)   |
| media-gen      | 3456         | `MEDIA_GENERATION_API_URL` |

## Layering

- **api.py** — request/response only; call `service`
- **service.py** — orchestration; call `domain` / external I/O
- **domain/** — models, ETL, embeddings, parsers (never HTTP routers)

**Forbidden:** `routes/`, `src/`, `app/`, root-level `etl/` / `core/` / `schemas/` (those live under `domain/`), dual `pyproject.toml` + `requirements.txt`.

## References

- [FastAPI bigger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Uvicorn](https://docs.uvicorn.org/)
