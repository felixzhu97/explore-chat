import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
try:
    import numpy  # noqa: F401
except ImportError:
    raise SystemExit("numpy is required. Install with: pip install 'numpy>=1.24.0,<3.0.0'")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
if "HF_ENDPOINT" not in os.environ:
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

from pathlib import Path

OUTPUT_BASE = Path(os.environ.get("MEDIA_OUTPUT_DIR", "output"))
IMAGE_OUTPUT = OUTPUT_BASE / "image"
VIDEO_OUTPUT = OUTPUT_BASE / "video"
VOICE_OUTPUT = OUTPUT_BASE / "voice"
for d in (IMAGE_OUTPUT, VIDEO_OUTPUT, VOICE_OUTPUT):
    d.mkdir(parents=True, exist_ok=True)

HOST = os.environ.get("MEDIA_GEN_HOST", "0.0.0.0")
PORT = int(os.environ.get("MEDIA_GEN_PORT", "3456"))
BASE_URL = os.environ.get("MEDIA_GEN_BASE_URL", f"http://localhost:{PORT}")
DEFAULT_VOICE = os.environ.get("EDGE_TTS_VOICE", "zh-CN-XiaoxiaoNeural")
