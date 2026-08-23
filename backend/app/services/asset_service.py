import json
from datetime import datetime, timezone

from pymongo.database import Database

from app.core.responses import AppError
from app.models.collections import ASSETS, PREDICTIONS
from app.schemas.asset import asset_to_dict
from app.schemas.prediction import PredictionOut
from app.services.ml.prediction_service import PredictionService



def list_assets(
    db: Database,
    *,
    search: str | None = None,
    risk: str | None = None,
    asset_type: str | None = None,
    condition_min: float | None = None,
    condition_max: float | None = None,
) -> list[dict]:
    query: dict = {}
    if asset_type:
        query["type"] = asset_type
    if condition_min is not None or condition_max is not None:
        query["condition"] = {}
        if condition_min is not None:
            query["condition"]["$gte"] = condition_min
        if condition_max is not None:
            query["condition"]["$lte"] = condition_max
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"asset_id": {"$regex": search, "$options": "i"}},
        ]

    assets = list(db[ASSETS].find(query))
    if risk:
        from app.services.risk_service import calculate_risk_level

        assets = [a for a in assets if calculate_risk_level(a["risk_score"]).lower() == risk.lower()]
    return [asset_to_dict(a) for a in assets]


def get_asset(db: Database, asset_id: str) -> dict:
    asset = db[ASSETS].find_one({"asset_id": asset_id})
    if not asset:
        raise AppError("ASSET_NOT_FOUND", f"Asset {asset_id} not found", 404)
    return asset_to_dict(asset)


def get_asset_doc(db: Database, asset_id: str) -> dict:
    asset = db[ASSETS].find_one({"asset_id": asset_id})
    if not asset:
        raise AppError("ASSET_NOT_FOUND", f"Asset {asset_id} not found", 404)
    return asset


def run_prediction(db: Database, asset_id: str) -> PredictionOut:
    asset = get_asset_doc(db, asset_id)

    service = PredictionService()
    result = service.predict(asset["asset_id"], asset["condition"], asset["age"], asset["traffic"])

    db[ASSETS].update_one(
        {"asset_id": asset_id},
        {
            "$set": {
                "predicted_condition": result.predictedCondition,
                "risk_score": result.riskScore,
                "confidence": result.confidence * 100,
            }
        },
    )

    db[PREDICTIONS].insert_one(
        {
            "asset_id": asset["asset_id"],
            "current_condition": result.currentCondition,
            "predicted_condition": result.predictedCondition,
            "deterioration": result.deterioration,
            "risk_score": result.riskScore,
            "risk_level": result.riskLevel,
            "confidence": result.confidence,
            "feature_importance": [f.model_dump() for f in result.featureImportance],
            "created_at": datetime.now(timezone.utc),
        }
    )
    return result


def get_latest_prediction(db: Database, asset_id: str) -> PredictionOut:
    row = db[PREDICTIONS].find_one({"asset_id": asset_id}, sort=[("created_at", -1)])
    if not row:
        return run_prediction(db, asset_id)

    feature_importance = row.get("feature_importance") or []
    if isinstance(row.get("feature_importance_json"), str):
        feature_importance = json.loads(row["feature_importance_json"] or "[]")

    return PredictionOut(
        assetId=row["asset_id"],
        currentCondition=row["current_condition"],
        predictedCondition=row["predicted_condition"],
        deterioration=row["deterioration"],
        riskScore=row["risk_score"],
        riskLevel=row["risk_level"],
        confidence=row["confidence"],
        featureImportance=feature_importance,
    )
