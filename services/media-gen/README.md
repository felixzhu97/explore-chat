# Media Gen (Image + Video + Voice)

Layout (same as other Python helpers): `main.py` / `config.py` / `api.py` / `service.py` / `domain/` / `tests/`.

Single service for image generation (Stable Diffusion), video generation (CogVideoX), and voice synthesis (edge-tts). Port: 3456.

## Setup

```bash
cd services/media-gen
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 3456
# or: python main.py
```

## Env (optional)

- `MEDIA_GEN_PORT` (default: 3456)
- `MEDIA_GEN_BASE_URL` (default: `http://localhost:{PORT}`)
- `MEDIA_OUTPUT_DIR` (default: `output`, with subdirs image/, video/, voice/)
- `MEDIA_GEN_DEVICE` (default: auto; set `cpu` to force CPU)
- `SD_MODEL` (image model, default: runwayml/stable-diffusion-v1-5)
- `COGVIDEOX_MODEL` (video model, default: THUDM/CogVideoX-2b)
- `EDGE_TTS_VOICE` (default: zh-CN-XiaoxiaoNeural)
- `MEDIA_VIDEO_FORCE_LOCAL` (set `1` to try local video on macOS)

## API (AIP REST)

- **Image**: `POST /api/v1/images:generate` → `{ job_id }`; `GET /api/v1/imageJobs/{image_job}` → `{ status, image_url? }`; `GET /output/image/{job_id}.png`
- **Video**: `POST /api/v1/videos:generate` → `{ job_id }`; `GET /api/v1/videoJobs/{video_job}` → `{ status, video_url? }`; `GET /output/video/{job_id}.mp4`
- **Voice**: `POST /api/v1/voices:synthesize` body `{ text }` → `{ audio_url }`; `GET /output/voice/{job_id}.mp3`

Server: set `MEDIA_GENERATION_API_URL=http://localhost:3456` in application.yml `chat.upstreams.media-gen`.
