from contextlib import asynccontextmanager

from fastapi import FastAPI

import config
import service
from api import router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    service.startup()
    yield


app = FastAPI(title="WhatsChat Vision", version="0.1.0", lifespan=lifespan)
app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=config.HOST, port=config.PORT)
