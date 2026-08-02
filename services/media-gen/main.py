from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
import service
from api import router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not service.skip_video_local():
        service.get_video_pipeline()
    yield


app = FastAPI(title="Media Gen API (Image + Video + Voice)", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=config.HOST, port=config.PORT)
