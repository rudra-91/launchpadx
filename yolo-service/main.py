import io
import os
from pathlib import Path
from typing import Dict, Optional

from PIL import Image
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# yolo-service/ root — portable on Windows and Linux
SERVICE_ROOT = Path(__file__).resolve().parent
_DEFAULT_MODEL_PATH = SERVICE_ROOT / "models" / "best.pt"
MODEL_PATH = Path(os.getenv("YOLO_MODEL_PATH", str(_DEFAULT_MODEL_PATH)))

# Class Mapping Configuration
CLASS_CONFIG: Dict[int, Dict[str, str]] = {
    0: {"type": "D00", "name": "Longitudinal Crack"},
    1: {"type": "D10", "name": "Transverse Crack"},
    2: {"type": "D20", "name": "Alligator Crack"},
    3: {"type": "D40", "name": "Pothole"},
}

# Global model reference
model: Optional[YOLO] = None

app = FastAPI(
    title="INFRA-X-RoadAI Detection API",
    description="FastAPI inference service for YOLOv8m 4-class road damage detection.",
    version="1.0.0",
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_model():
    global model
    print(f"Loading YOLOv8m model from: {MODEL_PATH}")
    if not MODEL_PATH.exists():
        print(f"ERROR: Model file does not exist at {MODEL_PATH}")
        model = None
        return
    try:
        model = YOLO(str(MODEL_PATH))
        print("Model loaded successfully!")
    except Exception as e:
        print(f"ERROR: Failed to load model: {e}")
        model = None


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "YOLOv8m",
        "model_loaded": model is not None,
    }


@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    conf: float = Query(default=0.25, ge=0.0, le=1.0),
):
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model is not loaded.",
        )

    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is required.",
        )

    try:
        contents = await image.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file uploaded.",
            )
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted image file.",
        )

    img_width, img_height = pil_image.size

    try:
        results = model.predict(source=pil_image, conf=conf, verbose=False)
        detections = []

        if results and len(results) > 0:
            boxes = results[0].boxes
            if boxes is not None:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    confidence = round(float(box.conf[0].item()), 4)

                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = [round(float(c), 2) for c in xyxy]

                    class_info = CLASS_CONFIG.get(cls_id, {"type": f"D{cls_id}", "name": "Unknown"})

                    detections.append(
                        {
                            "damage_type": class_info["type"],
                            "damage_name": class_info["name"],
                            "confidence": confidence,
                            "bbox": {
                                "x1": x1,
                                "y1": y1,
                                "x2": x2,
                                "y2": y2,
                            },
                        }
                    )

        return {
            "detections": detections,
            "image_width": img_width,
            "image_height": img_height,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference failed.",
        )
