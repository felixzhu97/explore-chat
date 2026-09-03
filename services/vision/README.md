# Vision service — image labeling and content moderation (ResNet50 + NudeNet)

Layout (same as other Python helpers): `main.py` / `config.py` / `api.py` / `service.py` / `domain/` / `tests/`.

Port **8110**. Endpoints: `/health`, `/predict`, `/moderate`, `/moderate-video`.

## Setup

```bash
cd services/vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Or: `uvicorn main:app --host 0.0.0.0 --port 8110`

Copy `.env.example` to `.env` and adjust as needed. Server expects `VISION_SERVICE_URL=http://localhost:8110`.

## Docker

```bash
docker build -t whatsfeed-vision .
docker run -p 8110:8110 whatsfeed-vision
```
