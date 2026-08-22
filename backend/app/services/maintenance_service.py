from pymongo.database import Database

from app.core.responses import AppError
from app.models.collections import ASSETS
from app.schemas.maintenance import MaintenanceAssetOut, MaintenancePriority
from app.services.risk_service import calculate_risk_level


def _priority_score(asset: dict) -> float:
    deterioration = max(0, asset["condition"] - asset["predicted_condition"])
    network_weight = 1.15 if asset["risk_score"] >= 70 else 1.0
    return round((asset["risk_score"] * 0.55 + deterioration * 3 + asset["age"] * 0.2) * network_weight, 2)


def get_maintenance_priorities(db: Database, limit: int = 20) -> list[MaintenancePriority]:
    assets = list(db[ASSETS].find({"type": "bridge"}))
    ranked = sorted(assets, key=_priority_score, reverse=True)[:limit]
    results: list[MaintenancePriority] = []
    for asset in ranked:
        deterioration = max(0, asset["condition"] - asset["predicted_condition"])
        results.append(
            MaintenancePriority(
                assetId=asset["asset_id"],
                name=asset["name"],
                priorityScore=_priority_score(asset),
                riskScore=asset["risk_score"],
                deterioration=round(deterioration, 1),
                estimatedCost=round(120_000 + asset["risk_score"] * 2_500, 0),
                rationale=(
                    f"Risk level {calculate_risk_level(asset['risk_score'])} with "
                    f"{round(deterioration, 1)}-point projected deterioration."
                ),
            )
        )
    return results


def get_maintenance_for_asset(db: Database, asset_id: str) -> MaintenanceAssetOut:
    asset = db[ASSETS].find_one({"asset_id": asset_id})
    if not asset:
        raise AppError("ASSET_NOT_FOUND", f"Asset {asset_id} not found", 404)

    score = _priority_score(asset)
    importance = "high" if asset["risk_score"] >= 70 else "medium" if asset["risk_score"] >= 45 else "standard"
    return MaintenanceAssetOut(
        assetId=asset["asset_id"],
        name=asset["name"],
        priorityScore=score,
        recommendedAction="Schedule structural inspection and targeted deck rehabilitation",
        estimatedCost=round(120_000 + asset["risk_score"] * 2_500, 0),
        networkImportance=importance,
    )
