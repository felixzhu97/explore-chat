# Python ML helpers — simple layout

WhatsFeed keeps four optional Python HTTP helpers. Clients call **Nest only**; Nest calls these over loopback.

## Shared layout (every service)

```
services/<name>/
├── main.py       # FastAPI app + uvicorn entry
├── config.py     # env / default port
├── api.py        # HTTP routes (thin)
├── service.py    # orchestration / ML calls
├── requirements.txt
├── README.md
└── .env.example
```

Optional extras (recommendation): `etl/`, `models/`, `features/`, `celery_app.py`, `tasks.py`.

## Start command

From the service directory:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
# or: python main.py
```

| Service        | Default port | Nest env                   |
| -------------- | ------------ | -------------------------- |
| recommendation | 8000         | `RECOMMENDATION_API_URL`   |
| vision         | 8001         | `VISION_SERVICE_URL`       |
| rag            | 8002         | `RAG_SERVICE_URL` (docs)   |
| media-gen      | 3456         | `MEDIA_GENERATION_API_URL` |

## Layering rule

- **api.py** — parse request, call `service`, return response. No model loading.
- **service.py** — business / ML / I/O.
- Do not add deeper `app/api/routes/...` trees unless a service truly needs them; prefer this flat split.

## References

- [FastAPI bigger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Uvicorn](https://docs.uvicorn.org/)
