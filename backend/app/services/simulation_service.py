from datetime import datetime, timezone

from pymongo.database import Database

from app.models.collections import ASSETS, SIMULATIONS
from app.schemas.simulation import OptimizeItem, OptimizeOut, SimulationOut
from app.services.maintenance_service import _priority_score


def run_simulation(db: Database, asset_id: str, repair_quality: float, budget: float) -> SimulationOut:
    asset = db[ASSETS].find_one({"asset_id": asset_id})
    if asset and "risk_score" in asset:
        before_risk = float(asset["risk_score"])
    else:
        # Fallback baseline risk score for dynamically inspected road locations
        before_risk = 68.0

    quality_factor = repair_quality / 100
    budget_factor = min(budget / 500_000, 1.0)
    improvement = (quality_factor * 0.6 + budget_factor * 0.4) * 28
    after_risk = max(5.0, before_risk - improvement)
    reduction = before_risk - after_risk
    access_time = max(0.0, 24 - reduction * 0.4)

    try:
        db[SIMULATIONS].insert_one(
            {
                "asset_id": asset_id,
                "repair_quality": repair_quality,
                "budget": budget,
                "before_risk": before_risk,
                "after_risk": after_risk,
                "risk_reduction": reduction,
                "estimated_access_time": access_time,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception:
        pass

    return SimulationOut(
        assetId=asset_id,
        beforeRisk=round(before_risk, 1),
        afterRisk=round(after_risk, 1),
        riskReduction=round(reduction, 1),
        estimatedAccessTime=round(access_time, 1),
    )


def run_optimization(db: Database, budget: float, strategy: str) -> OptimizeOut:
    assets = list(db[ASSETS].find({"type": "bridge"}))

    def sort_key(asset: dict) -> float:
        if strategy == "accessibility":
            return asset["traffic"] / 1000 + asset["risk_score"] * 0.2
        if strategy == "economic":
            return asset["traffic"] / 500 + asset["risk_score"] * 0.15
        return _priority_score(asset)

    ranked = sorted(assets, key=sort_key, reverse=True)
    priorities: list[OptimizeItem] = []
    used = 0.0

    for asset in ranked:
        cost = 120_000 + asset["risk_score"] * 2_500
        if used + cost > budget:
            continue
        used += cost
        priorities.append(
            OptimizeItem(
                assetId=asset["asset_id"],
                name=asset["name"],
                priorityScore=_priority_score(asset),
                estimatedCost=round(cost, 0),
            )
        )

    improvement = min(35.0, len(priorities) * 4.5 + used / budget * 10 if budget else 0)

    return OptimizeOut(
        strategy=strategy,
        budget=budget,
        budgetUsed=round(used, 0),
        expectedNetworkImprovement=round(improvement, 1),
        priorities=priorities,
    )
