import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    assets,
    auth,
    health,
    inspections,
    maintenance,
    metrics,
    network,
    predictions,
    risk,
    simulation,
)

from app.core.config import get_settings
from app.core.database import ensure_indexes, get_database, ping_database
from app.core.responses import AppError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(title="INFRA-X API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    detail = exc.detail if isinstance(exc.detail, dict) else {"code": "ERROR", "message": str(exc.detail)}
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": detail},
    )


@app.on_event("startup")
def on_startup() -> None:
    db = get_database()
    mongo_ok = ping_database()
    if mongo_ok:
        try:
            ensure_indexes(db)
        except Exception as exc:
            logger.warning("Could not ensure database indexes: %s", exc)
    logger.info(
        "MongoDB connected=%s db=%s ML_PROVIDER=%s",
        mongo_ok,
        settings.mongodb_db_name,
        settings.ml_provider,
    )


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(inspections.router)
app.include_router(predictions.router)
app.include_router(risk.router)
app.include_router(maintenance.router)
app.include_router(network.router)
app.include_router(simulation.router)
app.include_router(metrics.router)
