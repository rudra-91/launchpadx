from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.services import maintenance_service

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])


@router.get("/priorities")
def maintenance_priorities(db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)):
    priorities = maintenance_service.get_maintenance_priorities(db)
    return success_response([p.model_dump() for p in priorities])


@router.get("/{asset_id}")
def maintenance_for_asset(
    asset_id: str, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)
):
    result = maintenance_service.get_maintenance_for_asset(db, asset_id)
    return success_response(result.model_dump())
