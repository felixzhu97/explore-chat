import io
import json
import logging
import os
import tempfile
from typing import Any, Optional

import config
import torch
import torchvision.transforms as T
from PIL import Image, UnidentifiedImageError
from torchvision.models import ResNet50_Weights, resnet50

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("vision")

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL = None
LABELS: list[str] = []
NSFW_DETECTOR = None

transform = T.Compose([
    T.Resize((256, 256)),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def _is_explicit_class(cls_name: str) -> bool:
    if not cls_name or "EXPOSED" not in cls_name.upper():
        return False
    u = cls_name.upper()
    return any(x in u for x in ("GENITALIA", "BREAST", "BUTTOCKS", "ANUS"))


def load_labels():
    global LABELS
    if config.LABELS_PATH.exists():
        with open(config.LABELS_PATH, "r", encoding="utf-8") as f:
            LABELS = json.load(f)
    else:
        LABELS = [f"class_{i}" for i in range(1000)]


def load_model():
    global MODEL
    weights = ResNet50_Weights.IMAGENET1K_V2
    MODEL = resnet50(weights=weights)
    MODEL.eval()
    MODEL.to(DEVICE)


def load_nsfw_detector():
    global NSFW_DETECTOR
    if not config.NSFW_ENABLED:
        log.info("NSFW detection disabled by config")
        return
    try:
        from nudenet import NudeDetector

        NSFW_DETECTOR = NudeDetector()
        log.info("NSFW detector loaded (nudenet)")
    except Exception as e:
        log.warning("NSFW detector failed to load: %s", e)
        NSFW_DETECTOR = None


def startup():
    load_labels()
    load_model()
    load_nsfw_detector()


def open_image_bytes(content: bytes) -> Optional[Image.Image]:
    try:
        img = Image.open(io.BytesIO(content))
        return img.convert("RGB")
    except (UnidentifiedImageError, OSError):
        return None


def predict_image(image: Image.Image) -> list[str]:
    if image.mode != "RGB":
        image = image.convert("RGB")
    w, h = image.size
    if max(w, h) > config.MAX_IMAGE_SIZE:
        ratio = config.MAX_IMAGE_SIZE / max(w, h)
        image = image.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    tensor = transform(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out = MODEL(tensor)
    probs = torch.softmax(out[0], dim=0)
    top_probs, top_indices = torch.topk(probs, min(config.TOP_K, len(LABELS)))
    result = []
    seen = set()
    for idx in top_indices.cpu().tolist():
        label = LABELS[idx].strip().lower().replace(" ", "_") if idx < len(LABELS) else f"class_{idx}"
        if label not in seen:
            seen.add(label)
            result.append(label)
    return result[: config.TOP_K]


def _normalize_image_for_moderate(image: Image.Image) -> torch.Tensor:
    if image.mode != "RGB":
        image = image.convert("RGB")
    w, h = image.size
    if max(w, h) > config.MAX_IMAGE_SIZE:
        ratio = config.MAX_IMAGE_SIZE / max(w, h)
        image = image.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    return transform(image).unsqueeze(0).to(DEVICE)


def _nsfw_score(image: Image.Image) -> float:
    if NSFW_DETECTOR is None:
        return 0.0
    fd, path = None, None
    try:
        buf = io.BytesIO()
        image.save(buf, format="JPEG", quality=90)
        raw = buf.getvalue()
        fd, path = tempfile.mkstemp(suffix=".jpg")
        os.write(fd, raw)
        os.close(fd)
        fd = None
        detections = NSFW_DETECTOR.detect(path)
        max_score = 0.0
        for d in detections or []:
            cls_name = (d.get("class") or d.get("label") or "").strip()
            if not cls_name:
                continue
            s = float(d.get("score") or 0)
            if s < config.NSFW_THRESHOLD:
                continue
            if cls_name in config.NSFW_EXPLICIT_CLASSES or _is_explicit_class(cls_name):
                if s > max_score:
                    max_score = s
        if detections and max_score == 0.0:
            classes_seen = {(d.get("class") or d.get("label") or "").strip() for d in detections}
            log.debug("NSFW detections had no explicit class match: %s", classes_seen)
        return max_score
    except Exception as e:
        log.warning("NSFW detect error: %s", e)
    finally:
        if fd is not None:
            try:
                os.close(fd)
            except Exception:
                pass
        if path and os.path.exists(path):
            try:
                os.unlink(path)
            except Exception:
                pass
    return 0.0


def moderate_image(image: Image.Image) -> dict[str, Any]:
    tensor = _normalize_image_for_moderate(image)
    with torch.no_grad():
        out = MODEL(tensor)
    probs = torch.softmax(out[0], dim=0)
    categories: list[dict[str, Any]] = []
    for idx in config.PROHIBITED_INDICES:
        if idx < len(probs):
            score = float(probs[idx].cpu().item())
            if score >= config.MODERATION_THRESHOLD:
                categories.append({"label": "prohibited", "score": round(score, 4)})
    nude_score = _nsfw_score(image) if config.NSFW_ENABLED else 0.0
    if nude_score >= config.NSFW_THRESHOLD:
        categories.append({"label": "nude", "score": round(nude_score, 4)})
    if not categories:
        return {"safe": True, "categories": []}
    best_by_label: dict[str, float] = {}
    for c in categories:
        label = c["label"]
        score = c["score"]
        if label not in best_by_label or score > best_by_label[label]:
            best_by_label[label] = score
    unique = [{"label": k, "score": v} for k, v in best_by_label.items()]
    log.info("moderation reject: %s", unique)
    return {"safe": False, "categories": unique}


def _extract_frames_from_video(video_path: str) -> list[Image.Image]:
    try:
        import cv2
    except ImportError:
        log.warning("opencv not available, video frame extraction skipped")
        return []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []
    fps = cap.get(cv2.CAP_PROP_FPS) or 1.0
    interval_frames = max(1, int(fps * config.VIDEO_FRAME_INTERVAL_SEC))
    frames: list[Image.Image] = []
    frame_idx = 0
    while len(frames) < config.MAX_VIDEO_FRAMES:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % interval_frames == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb))
        frame_idx += 1
    cap.release()
    return frames


def moderate_video(video_path: str) -> dict[str, Any]:
    frames = _extract_frames_from_video(video_path)
    if not frames:
        return {"safe": True, "categories": []}
    all_categories: dict[str, float] = {}
    for frame in frames:
        result = moderate_image(frame)
        if not result.get("safe", True):
            for c in result.get("categories", []):
                label = c.get("label", "")
                score = c.get("score", 0.0)
                if label and (label not in all_categories or score > all_categories[label]):
                    all_categories[label] = score
    if not all_categories:
        return {"safe": True, "categories": []}
    return {"safe": False, "categories": [{"label": k, "score": v} for k, v in all_categories.items()]}
