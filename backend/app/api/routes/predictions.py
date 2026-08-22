from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.services import asset_service

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("/{asset_id}")
def create_prediction(
    asset_id: str, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)
):
    result = asset_service.run_prediction(db, asset_id)
    return success_response(result.model_dump())


@router.get("/{asset_id}")
def get_prediction(
    asset_id: str, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)
):
    result = asset_service.get_latest_prediction(db, asset_id)
    return success_response(result.model_dump())
