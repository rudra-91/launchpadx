from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ (launchpadx/backend) — portable on Windows and Linux
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_XGBOOST_MODEL_PATH = str(_BACKEND_ROOT / "models" / "xgboost_road_risk.joblib")
_DEFAULT_YOLO_MODEL_PATH = str(_BACKEND_ROOT / "models" / "best.pt")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    supabase_url: str = "https://mxuqgcmkxbfspzpopupx.supabase.co"
    supabase_publishable_key: str = "sb_publishable_KCIejuGIPP02CsrKkyu26g_LV8hEmnb"
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "infrax"
    frontend_url: str = "http://localhost:5173"
    # Asset /api/predictions stub only (mock|xgboost). Inspection pipeline always uses real YOLO+XGBoost.
    ml_provider: str = "real"
    ml_model_path: str | None = None
    # Override with env YOLO_MODEL_PATH; default backend/models/best.pt
    yolo_model_path: str = _DEFAULT_YOLO_MODEL_PATH
    # Override with env XGBOOST_MODEL_PATH; default backend/models/xgboost_road_risk.joblib
    xgboost_model_path: str = _DEFAULT_XGBOOST_MODEL_PATH


@lru_cache
def get_settings() -> Settings:
    return Settings()
