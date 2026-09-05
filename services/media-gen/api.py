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
    negative_prompt: Optional[str] = None


class VideoGenerateBody(BaseModel):
    prompt: str
    image_url: Optional[str] = None


class VoiceSynthesizeBody(BaseModel):
    text: str
    voice: Optional[str] = None


@router.post("/api/v1/images:generate")
def image_generate(body: ImageGenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with service.jobs_lock:
        service.image_jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(
        service.run_image_job,
        job_id,
        body.prompt,
        body.negative_prompt or "",
    )
    return {"job_id": job_id}


@router.get("/api/v1/imageJobs/{image_job}")
def image_get_result(image_job: str):
    with service.jobs_lock:
        job = service.image_jobs.get(image_job)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "name": f"imageJobs/{image_job}",
        "status": job["status"],
        **({"image_url": job["image_url"]} if job.get("image_url") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@router.get("/output/image/{job_id}.png")
def serve_image(job_id: str):
    path = config.IMAGE_OUTPUT / f"{job_id}.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="image/png")


@router.post("/api/v1/videos:generate")
def video_generate(body: VideoGenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with service.jobs_lock:
        service.video_jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(service.run_video_job, job_id, body.prompt)
    return {"job_id": job_id}


@router.get("/api/v1/videoJobs/{video_job}")
def video_get_result(video_job: str):
    with service.jobs_lock:
        job = service.video_jobs.get(video_job)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "name": f"videoJobs/{video_job}",
        "status": job["status"],
        **({"video_url": job["video_url"]} if job.get("video_url") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@router.get("/output/video/{job_id}.mp4")
def serve_video(job_id: str):
    path = config.VIDEO_OUTPUT / f"{job_id}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4")


@router.post("/api/v1/voices:synthesize")
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
    return {"audio_url": f"{config.BASE_URL}/output/voice/{job_id}.mp3"}


@router.get("/output/voice/{job_id}.mp3")
def serve_voice(job_id: str):
    path = config.VOICE_OUTPUT / f"{job_id}.mp3"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="audio/mpeg")
