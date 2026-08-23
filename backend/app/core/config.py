from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


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
    xgboost_model_path: str = r"C:\Users\Furquan sohel.LAPTOP-V2QEI4B3\Desktop\INFRA-X-RoadAI\models\xgboost_road_risk.joblib"



@lru_cache
def get_settings() -> Settings:
    return Settings()
