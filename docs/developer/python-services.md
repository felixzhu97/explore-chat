# Python ML helpers (sibling repo)

Optional FastAPI helpers used by this Spring API over loopback live in
sibling **[explore-ml](https://github.com/felixzhu97/explore-ml)** under
`python_ml/{recommendation,vision,rag,media-gen}`.

Clients still call **Spring only**. Default ports are unchanged:

| Service        | Default port | Nest / Spring env          |
| -------------- | ------------ | -------------------------- |
| recommendation | 8000         | `RECOMMENDATION_API_URL`   |
| vision         | 8001         | `VISION_SERVICE_URL`       |
| rag            | 8002         | `RAG_SERVICE_URL`          |
| media-gen      | 3456         | `MEDIA_GENERATION_API_URL` |

## Canonical docs

- Layout & layering: [explore-ml python-services](https://github.com/felixzhu97/explore-ml/blob/main/docs/developer/python-services.md)
- AIP REST remaps: [explore-ml aip-rest](https://github.com/felixzhu97/explore-ml/blob/main/docs/developer/aip-rest.md)
- Local AIP guard in that repo: `bash scripts/check-aip-rest.sh`

## Start (from explore-ml)

```bash
cd ../explore-ml/python_ml/<name>   # sibling checkout
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## References

- https://github.com/felixzhu97/explore-ml
- https://fastapi.tiangolo.com/
- https://google.aip.dev/193
