import os
from pathlib import Path

HOST = os.environ.get("VISION_HOST", "0.0.0.0")
PORT = int(os.environ.get("VISION_PORT", "8110"))
LABELS_PATH = Path(__file__).resolve().parent / "domain" / "imagenet_labels.json"
TOP_K = int(os.environ.get("VISION_TOP_K", "10"))
REQUEST_TIMEOUT = float(os.environ.get("VISION_REQUEST_TIMEOUT", "15.0"))
MAX_IMAGE_SIZE = int(os.environ.get("VISION_MAX_IMAGE_SIZE", "800"))
MODERATION_ENABLED = os.environ.get("VISION_MODERATION_ENABLED", "true").lower() == "true"
MODERATION_THRESHOLD = float(os.environ.get("VISION_MODERATION_THRESHOLD", "0.15"))
PROHIBITED_INDICES = {414, 764, 765}
NSFW_ENABLED = os.environ.get("VISION_NSFW_ENABLED", "true").lower() == "true"
NSFW_THRESHOLD = float(os.environ.get("VISION_NSFW_THRESHOLD", "0.35"))
NSFW_EXPLICIT_CLASSES = frozenset({
    "FEMALE_GENITALIA_EXPOSED",
    "FEMALE_BREAST_EXPOSED",
    "MALE_GENITALIA_EXPOSED",
    "MALE_BREAST_EXPOSED",
    "BUTTOCKS_EXPOSED",
    "ANUS_EXPOSED",
})
MAX_VIDEO_FRAMES = int(os.environ.get("VISION_MAX_VIDEO_FRAMES", "30"))
VIDEO_FRAME_INTERVAL_SEC = float(os.environ.get("VISION_VIDEO_FRAME_INTERVAL_SEC", "2.0"))
MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024
