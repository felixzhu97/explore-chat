import uuid
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

import config
import service

router = APIRouter()


class ImageGenerateBody(BaseModel):
    prompt: str
    negativePrompt: Optional[str] = None


class VideoGenerateBody(BaseModel):
    prompt: str
    imageUrl: Optional[str] = None


class VoiceSynthesizeBody(BaseModel):
    text: str
    voice: Optional[str] = None


@router.post("/image/generate")
def image_generate(body: ImageGenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with service.jobs_lock:
        service.image_jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(
        service.run_image_job,
        job_id,
        body.prompt,
        body.negativePrompt or "",
    )
    return {"jobId": job_id}


@router.get("/image/generate/{job_id}")
def image_get_result(job_id: str):
    with service.jobs_lock:
        job = service.image_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "status": job["status"],
        **({"imageUrl": job["imageUrl"]} if job.get("imageUrl") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@router.get("/output/image/{job_id}.png")
def serve_image(job_id: str):
    path = config.IMAGE_OUTPUT / f"{job_id}.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="image/png")


@router.post("/video/generate")
def video_generate(body: VideoGenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with service.jobs_lock:
        service.video_jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(service.run_video_job, job_id, body.prompt)
    return {"jobId": job_id}


@router.get("/video/generate/{job_id}")
def video_get_result(job_id: str):
    with service.jobs_lock:
        job = service.video_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "status": job["status"],
        **({"videoUrl": job["videoUrl"]} if job.get("videoUrl") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@router.get("/output/video/{job_id}.mp4")
def serve_video(job_id: str):
    path = config.VIDEO_OUTPUT / f"{job_id}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4")


@router.post("/voice/synthesize")
async def voice_synthesize(body: VoiceSynthesizeBody):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    voice = (body.voice or config.DEFAULT_VOICE).strip()
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    out_path = config.VOICE_OUTPUT / f"{job_id}.mp3"
    try:
        await service.synthesize_voice(body.text.strip(), voice, job_id, out_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"audioUrl": f"{config.BASE_URL}/output/voice/{job_id}.mp3"}


@router.get("/output/voice/{job_id}.mp3")
def serve_voice(job_id: str):
    path = config.VOICE_OUTPUT / f"{job_id}.mp3"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="audio/mpeg")
