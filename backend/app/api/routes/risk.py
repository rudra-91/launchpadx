from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import AppError, success_response
from app.dependencies.auth import get_current_user
from app.models.collections import ASSETS
from app.schemas.auth import AuthenticatedUser
from app.services.risk_service import calculate_risk_level

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("/{asset_id}")
def get_risk(asset_id: str, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)):
    asset = db[ASSETS].find_one({"asset_id": asset_id})
    if not asset:
        raise AppError("ASSET_NOT_FOUND", f"Asset {asset_id} not found", 404)

    deterioration = max(0, asset["condition"] - asset["predicted_condition"])
    return success_response(
        {
            "assetId": asset["asset_id"],
            "riskScore": asset["risk_score"],
            "riskLevel": calculate_risk_level(asset["risk_score"]),
            "factors": {
                "currentCondition": asset["condition"],
                "predictedCondition": asset["predicted_condition"],
                "deterioration": round(deterioration, 1),
                "age": asset["age"],
                "traffic": asset["traffic"],
            },
        }
    )
