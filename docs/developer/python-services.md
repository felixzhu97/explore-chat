# Python ML helpers (sibling repo)

Optional FastAPI modules used by this Spring API over loopback live in
sibling **[explore-ml](https://github.com/felixzhu97/explore-ml)** under
`python_ml/{recommendation,vision,rag,image_playground,speech,video}`.
They are served by **one app on port 8000**.

Clients still call **Spring only**. The API reads one base URL:

| Spring property          | Env                  | Default                 |
| ------------------------ | -------------------- | ----------------------- |
| `chat.upstreams.explore-ml` | `EXPLORE_ML_API_URL` | `http://localhost:8000` |

Every module answers under that URL with its `/api/v1` method (for
example `feeds:rank`, `images:predict`, `images:generate`,
`voices:synthesize`, `videos:generate`). `GET /health` reports each
module.

## Canonical docs

- Layout & layering: [explore-ml python-services](https://github.com/felixzhu97/explore-ml/blob/main/docs/developer/python-services.md)

## Start (from explore-ml)

```bash
cd ../explore-ml/python_ml   # sibling checkout
uvicorn main:app --host 0.0.0.0 --port 8000
```

## References

- https://github.com/felixzhu97/explore-ml
- https://fastapi.tiangolo.com/
