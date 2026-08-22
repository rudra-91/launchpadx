from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.services import metrics_service

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("")
def metrics(db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)):
    return success_response(metrics_service.get_metrics(db))
