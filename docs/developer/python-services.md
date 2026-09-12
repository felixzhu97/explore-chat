# Python ML helpers (sibling repo)

Optional FastAPI helpers used by this Spring API over loopback live in
sibling **[explore-ml](https://github.com/felixzhu97/explore-ml)** under
`python_ml/{recommendation,vision,rag,image-playground,speech,video}`.

Clients still call **Spring only**. Default ports are unchanged:

| Service          | Default port | Nest / Spring env            |
| ---------------- | ------------ | ---------------------------- |
| recommendation   | 8000         | `RECOMMENDATION_API_URL`     |
| vision           | 8001         | `VISION_SERVICE_URL`         |
| rag              | 8002         | `RAG_SERVICE_URL`            |
| image-playground | 8003         | `IMAGE_PLAYGROUND_API_URL`   |
| speech           | 8004         | `SPEECH_API_URL`             |
| video            | 8005         | `VIDEO_API_URL`              |

## Canonical docs

- Layout & layering: [explore-ml python-services](https://github.com/felixzhu97/explore-ml/blob/main/docs/developer/python-services.md)

## Start (from explore-ml)

```bash
cd ../explore-ml/python_ml/<name>   # sibling checkout
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## References

- https://github.com/felixzhu97/explore-ml
- https://fastapi.tiangolo.com/
