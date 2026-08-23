import logging
import os
from typing import Any
import joblib
import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)

FEATURE_COLS = [
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
]

LABEL_MAP = {
    0: "LOW",
    1: "MEDIUM",
    2: "HIGH",
    3: "CRITICAL",
}

_model = None


def load_xgboost_model(model_path: str | None = None) -> Any:
    """Load and cache the trained XGBoost model from the specified joblib path."""
    global _model
    if _model is not None:
        return _model

    settings = get_settings()
    path = model_path or settings.xgboost_model_path

    if not os.path.exists(path):
        logger.warning("XGBoost model file not found at %s. Using rule-based fallback.", path)
        return None

    try:
        _model = joblib.load(path)
        logger.info("Successfully loaded XGBoost model from %s", path)
        return _model
    except Exception as exc:
        logger.error("Failed to load XGBoost model from %s: %s", path, exc)
        return None


def predict_road_risk(features: dict[str, float], model_path: str | None = None) -> dict[str, Any]:
    """Predict road risk class using the trained XGBoost classifier.
    
    Accepts the exact 12 features:
      d00_count, d10_count, d20_count, d40_count, total_detections,
      d00_area_ratio, d10_area_ratio, d20_area_ratio, d40_area_ratio,
      total_damage_area_ratio, avg_bbox_area_ratio, max_bbox_area_ratio.
    """
    model = load_xgboost_model(model_path)
    feature_row = [float(features.get(col, 0.0)) for col in FEATURE_COLS]

    if model is None:
        # Transparent rule-based fallback if model file cannot be loaded
        score = (
            1.0 * feature_row[0] + 2.0 * feature_row[1] + 3.0 * feature_row[2] + 4.0 * feature_row[3] +
            50.0 * (1.0 * feature_row[5] + 2.0 * feature_row[6] + 3.0 * feature_row[7] + 4.0 * feature_row[8])
        )
        if score < 8.5:
            cls_idx = 0
        elif score < 19.0:
            cls_idx = 1
        elif score < 33.0:
            cls_idx = 2
        else:
            cls_idx = 3
        return {"class": cls_idx, "label": LABEL_MAP[cls_idx], "model": "XGBoost (Fallback)"}

    try:
        import pandas as pd
        X_df = pd.DataFrame([feature_row], columns=FEATURE_COLS)
        pred_class = int(model.predict(X_df)[0])
        return {"class": pred_class, "label": LABEL_MAP.get(pred_class, "UNKNOWN"), "model": "XGBoost"}
    except Exception as exc:
        logger.error("Error during XGBoost inference: %s", exc)
        return {"class": 0, "label": "LOW", "model": "XGBoost (Error Fallback)"}
