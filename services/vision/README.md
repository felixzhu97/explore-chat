# Vision service — image labeling and content moderation (ResNet50 + NudeNet)

Layout (same as other Python helpers): `main.py` / `config.py` / `api.py` / `service.py` / `domain/` / `tests/`.

Port **8001**. Endpoints: `/health`, `/predict`, `/moderate`, `/moderate-video`.

## Setup

```bash
cd services/vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Or: `uvicorn main:app --host 0.0.0.0 --port 8001`

Copy `.env.example` to `.env` and adjust as needed. Server expects `VISION_SERVICE_URL=http://localhost:8001`.

## Docker

```bash
docker build -t whatsfeed-vision .
docker run -p 8001:8001 whatsfeed-vision
```
