from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.services import asset_service

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("")
def list_assets(
    search: str | None = Query(default=None),
    risk: str | None = Query(default=None),
    type: str | None = Query(default=None, alias="type"),
    conditionMin: float | None = Query(default=None),
    conditionMax: float | None = Query(default=None),
    db: Database = Depends(get_db),
    _: AuthenticatedUser = Depends(get_current_user),
):
    assets = asset_service.list_assets(
        db,
        search=search,
        risk=risk,
        asset_type=type,
        condition_min=conditionMin,
        condition_max=conditionMax,
    )
    return success_response(assets)


@router.get("/{asset_id}")
def get_asset(asset_id: str, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)):
    return success_response(asset_service.get_asset(db, asset_id))
