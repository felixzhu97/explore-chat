"""Recommendation FastAPI entrypoint — uvicorn main:app."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

import config as cfg
import service as rec_service
from api import router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if rec_service.app_state.ranker:
        print("Ranker loaded successfully")
    yield
    rec_service.app_state.clear()


app = FastAPI(title="Recommendation API", lifespan=lifespan)
app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=cfg.HOST,
        port=cfg.PORT,
        reload=False,
    )
