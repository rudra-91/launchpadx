"""Tests for in-process YOLO service and config paths."""

from __future__ import annotations

import io
from pathlib import Path

import pytest
from PIL import Image

from app.core.config import _BACKEND_ROOT, _DEFAULT_YOLO_MODEL_PATH, get_settings
from app.core.responses import AppError
from app.schemas.inspection import YOLOPredictionResponse
from app.services import yolo_service
from app.services.inspection_service import extract_location_features
from app.services.xgboost_service import predict_road_risk
from app.schemas.inspection import AnalyzedImageOut


@pytest.fixture(autouse=True)
def _clear_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_yolo_default_path_is_under_backend_models():
    path = Path(_DEFAULT_YOLO_MODEL_PATH)
    assert path.name == "best.pt"
    assert path.parent.name == "models"
    assert path.parent.parent == _BACKEND_ROOT
    assert "INFRA-X-RoadAI" not in str(path)
    assert ":\\" not in _DEFAULT_YOLO_MODEL_PATH or "launchpadx" in _DEFAULT_YOLO_MODEL_PATH.lower()


def test_yolo_settings_path_portable():
    settings = get_settings()
    resolved = Path(settings.yolo_model_path)
    assert resolved.name == "best.pt"
    assert "yolo-service" not in settings.yolo_model_path.replace("\\", "/")
    assert not hasattr(settings, "yolo_service_url") or getattr(settings, "yolo_service_url", None) is None


def test_yolo_model_file_present():
    path = yolo_service.get_yolo_model_path()
    assert path.exists(), f"Expected model at {path}"


def test_yolo_load_and_predict_real_image():
    """Requires backend/models/best.pt and ultralytics/torch installed."""
    pytest.importorskip("ultralytics")
    pytest.importorskip("torch")

    yolo_service._model = None
    yolo_service._model_path_loaded = None

    model = yolo_service.load_yolo_model(force=True)
    assert model is not None
    assert yolo_service.is_yolo_model_loaded()

    # Minimal synthetic road-like RGB image (also accepts real bytes)
    img = Image.new("RGB", (640, 640), color=(80, 80, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    result = yolo_service.predict_image_bytes(buf.getvalue(), confidence=0.25)

    assert isinstance(result, YOLOPredictionResponse)
    assert result.image_width == 640
    assert result.image_height == 640
    assert isinstance(result.detections, list)
    for det in result.detections:
        assert det.damage_type in {"D00", "D10", "D20", "D40"} or det.damage_type.startswith("D")
        assert 0.0 <= det.confidence <= 1.0
        assert det.bbox.x2 >= det.bbox.x1
        assert det.bbox.y2 >= det.bbox.y1


def test_yolo_predict_empty_bytes_fails():
    with pytest.raises(AppError) as exc:
        yolo_service.predict_image_bytes(b"", confidence=0.25)
    assert exc.value.status_code == 400


def test_yolo_to_xgboost_feature_pipeline():
    """Features from detections feed XGBoost without HTTP."""
    from app.schemas.inspection import YOLOBoundingBox, YOLODetection

    analyzed = [
        AnalyzedImageOut(
            image_key="t_img_0",
            detections=[
                YOLODetection(
                    damage_type="D40",
                    damage_name="Pothole",
                    confidence=0.9,
                    bbox=YOLOBoundingBox(x1=10, y1=10, x2=110, y2=110),
                )
            ],
            image_width=1000,
            image_height=1000,
        )
    ]
    features = extract_location_features(analyzed)
    assert features["d40_count"] == 1.0
    assert features["total_detections"] == 1.0
    assert set(features.keys()) >= {
        "d00_count",
        "d10_count",
        "d20_count",
        "d40_count",
        "total_detections",
        "d00_area_ratio",
        "d10_area_ratio",
        "d20_area_ratio",
        "d40_area_ratio",
        "total_damage_area_ratio",
        "avg_bbox_area_ratio",
        "max_bbox_area_ratio",
    }
    pred = predict_road_risk(features)
    assert pred["label"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    assert pred["class"] in {0, 1, 2, 3}
    assert "XGBoost" in pred["model"]


def test_health_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_predictions_endpoint_still_protected_or_works():
    """Asset prediction route remains mounted (auth may reject without token)."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    res = client.post("/api/predictions/B17")
    # Without auth token should be 401/403, not 404
    assert res.status_code in {200, 401, 403, 422}
