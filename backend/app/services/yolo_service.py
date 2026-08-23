"""In-process YOLOv8 road-damage inference (no external HTTP service)."""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Any

from PIL import Image

from app.core.config import get_settings
from app.core.responses import AppError
from app.schemas.inspection import (
    YOLOBoundingBox,
    YOLODetection,
    YOLOPredictionResponse,
)

logger = logging.getLogger(__name__)

CLASS_CONFIG: dict[int, dict[str, str]] = {
    0: {"type": "D00", "name": "Longitudinal Crack"},
    1: {"type": "D10", "name": "Transverse Crack"},
    2: {"type": "D20", "name": "Alligator Crack"},
    3: {"type": "D40", "name": "Pothole"},
}

_model: Any = None
_model_path_loaded: str | None = None


def get_yolo_model_path() -> Path:
    """Resolve YOLO weights path (YOLO_MODEL_PATH env or backend/models/best.pt)."""
    settings = get_settings()
    return Path(settings.yolo_model_path)


def is_yolo_model_loaded() -> bool:
    return _model is not None


def load_yolo_model(force: bool = False) -> Any:
    """Load and cache the Ultralytics YOLO model once."""
    global _model, _model_path_loaded

    path = get_yolo_model_path()
    path_str = str(path.resolve()) if path.exists() else str(path)

    if _model is not None and not force and _model_path_loaded == path_str:
        return _model

    if not path.exists():
        logger.error("YOLO model file not found at %s", path_str)
        _model = None
        _model_path_loaded = None
        raise AppError(
            "YOLO_MODEL_MISSING",
            f"YOLO model file not found at {path_str}. Place best.pt under backend/models/ "
            "or set YOLO_MODEL_PATH.",
            status_code=503,
        )

    try:
        from ultralytics import YOLO
        import torch
        import torchvision

        logger.info(
            "PyTorch %s, torchvision %s",
            torch.__version__,
            torchvision.__version__,
        )
        logger.info("Loading YOLOv8m model from: %s", path_str)
        _model = YOLO(path_str)
        _model_path_loaded = path_str
        logger.info("YOLO model loaded successfully")
        return _model
    except AppError:
        raise
    except Exception as exc:
        logger.exception("Failed to load YOLO model from %s", path_str)
        _model = None
        _model_path_loaded = None
        raise AppError(
            "YOLO_MODEL_LOAD_ERROR",
            f"Failed to load YOLO model: {exc}",
            status_code=503,
        ) from exc


def predict_image_bytes(
    file_bytes: bytes,
    *,
    confidence: float = 0.25,
) -> YOLOPredictionResponse:
    """Run YOLO inference on raw image bytes. Returns the same schema as the old HTTP service."""
    if not file_bytes:
        raise AppError("INVALID_INPUT", "Empty image file uploaded.", status_code=400)

    model = load_yolo_model()

    try:
        pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception as exc:
        raise AppError(
            "INVALID_INPUT",
            "Invalid or corrupted image file.",
            status_code=400,
        ) from exc

    img_width, img_height = pil_image.size

    try:
        results = model.predict(source=pil_image, conf=confidence, verbose=False)
        detections: list[YOLODetection] = []

        if results and len(results) > 0:
            boxes = results[0].boxes
            if boxes is not None:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf_val = round(float(box.conf[0].item()), 4)
                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = [round(float(c), 2) for c in xyxy]
                    class_info = CLASS_CONFIG.get(
                        cls_id, {"type": f"D{cls_id}", "name": "Unknown"}
                    )
                    detections.append(
                        YOLODetection(
                            damage_type=class_info["type"],
                            damage_name=class_info["name"],
                            confidence=conf_val,
                            bbox=YOLOBoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                        )
                    )

        return YOLOPredictionResponse(
            detections=detections,
            image_width=img_width,
            image_height=img_height,
        )
    except AppError:
        raise
    except Exception as exc:
        logger.exception("YOLO inference failed")
        raise AppError(
            "YOLO_INFERENCE_ERROR",
            f"YOLO inference failed: {exc}",
            status_code=500,
        ) from exc


async def predict_image(
    file_bytes: bytes,
    filename: str = "image.jpg",
    content_type: str = "image/jpeg",
    confidence: float = 0.25,
) -> YOLOPredictionResponse:
    """Async-compatible entry used by the inspection pipeline (same signature as old YOLOClient)."""
    _ = filename, content_type
    return predict_image_bytes(file_bytes, confidence=confidence)
