from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ (launchpadx/backend) — works on Windows and Linux
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_XGBOOST_MODEL_PATH = str(_BACKEND_ROOT / "models" / "xgboost_road_risk.joblib")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    supabase_url: str = "https://mxuqgcmkxbfspzpopupx.supabase.co"
    supabase_publishable_key: str = "sb_publishable_KCIejuGIPP02CsrKkyu26g_LV8hEmnb"
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "infrax"
    frontend_url: str = "http://localhost:5173"
    ml_provider: str = "mock"
    ml_model_path: str | None = None
    yolo_service_url: str = "http://127.0.0.1:8001"
    # Override with env YOLO_SERVICE_URL for cloud; localhost:8001 remains the local default.
    # Override with env XGBOOST_MODEL_PATH; default is backend/models/xgboost_road_risk.joblib
    xgboost_model_path: str = _DEFAULT_XGBOOST_MODEL_PATH


@lru_cache
def get_settings() -> Settings:
    return Settings()
