import os
import tempfile
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

import config
import service

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "model": "resnet50"}


async def _load_image(request: Request, file: Optional[UploadFile]):
    content_type = request.headers.get("content-type", "") or ""
    if file and file.filename:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large")
        return service.open_image_bytes(content)
    if "application/json" in content_type:
        body = await request.json()
        image_url = body.get("image_url") if isinstance(body, dict) else None
        if not image_url:
            raise HTTPException(status_code=400, detail="Missing image_url")
        async with httpx.AsyncClient(timeout=config.REQUEST_TIMEOUT) as client:
            try:
                resp = await client.get(image_url)
                resp.raise_for_status()
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=400, detail=f"Failed to fetch image: {e}"
                )
        return service.open_image_bytes(resp.content)
    raise HTTPException(
        status_code=400,
        detail="Provide application/json with image_url or multipart file",
    )


@router.post("/api/v1/images:predict")
async def predict(request: Request, file: Optional[UploadFile] = File(None)):
    image = await _load_image(request, file)
    if image is None:
        return JSONResponse(content={"labels": []})
    try:
        labels = service.predict_image(image)
        return JSONResponse(content={"labels": labels})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/images:moderate")
async def moderate(request: Request, file: Optional[UploadFile] = File(None)):
    if not config.MODERATION_ENABLED:
        return JSONResponse(content={"safe": True, "categories": []})
    image = await _load_image(request, file)
    if image is None:
        return JSONResponse(content={"safe": True, "categories": []})
    try:
        result = service.moderate_image(image)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/v1/videos:moderate")
async def moderate_video_endpoint(
    request: Request, file: Optional[UploadFile] = File(None)
):
    if not config.MODERATION_ENABLED:
        return JSONResponse(content={"safe": True, "categories": []})
    video_path: Optional[str] = None
    content_type = request.headers.get("content-type", "") or ""
    if file and file.filename:
        content = await file.read()
        if len(content) > config.MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Video too large")
        suffix = Path(file.filename or "video").suffix or ".mp4"
        fd, video_path = tempfile.mkstemp(suffix=suffix)
        try:
            os.write(fd, content)
            os.close(fd)
            result = service.moderate_video(video_path)
            return JSONResponse(content=result)
        finally:
            if video_path and os.path.exists(video_path):
                os.unlink(video_path)
    elif "application/json" in content_type:
        body = await request.json()
        video_url = body.get("video_url") if isinstance(body, dict) else None
        if not video_url:
            raise HTTPException(status_code=400, detail="Missing video_url")
        async with httpx.AsyncClient(timeout=config.REQUEST_TIMEOUT * 2) as client:
            try:
                resp = await client.get(video_url)
                resp.raise_for_status()
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=400, detail=f"Failed to fetch video: {e}"
                )
        if len(resp.content) > config.MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Video too large")
        suffix = ".mp4"
        fd, video_path = tempfile.mkstemp(suffix=suffix)
        try:
            os.write(fd, resp.content)
            os.close(fd)
            result = service.moderate_video(video_path)
            return JSONResponse(content=result)
        finally:
            if video_path and os.path.exists(video_path):
                os.unlink(video_path)
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide application/json with video_url or multipart file",
        )
