from pymongo.database import Database

from app.models.collections import ASSETS
from app.services.risk_service import calculate_risk_level


def get_metrics(db: Database) -> dict:
    assets = list(db[ASSETS].find())
    bridges = [a for a in assets if a["type"] == "bridge"]

    total_assets = len(assets)
    critical_assets = sum(1 for a in assets if calculate_risk_level(a["risk_score"]) == "CRITICAL")
    average_condition = round(sum(a["condition"] for a in assets) / total_assets, 1) if assets else 0
    network_risk = round(sum(a["risk_score"] for a in bridges) / len(bridges), 1) if bridges else 0

    risk_distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for asset in assets:
        level = calculate_risk_level(asset["risk_score"]).lower()
        risk_distribution[level] = risk_distribution.get(level, 0) + 1

    asset_categories = {
        "bridges": sum(1 for a in assets if a["type"] == "bridge"),
        "roads": sum(1 for a in assets if a["type"] == "road"),
        "hospitals": sum(1 for a in assets if a["type"] == "hospital"),
    }

    return {
        "totalAssets": total_assets,
        "criticalAssets": critical_assets,
        "networkRisk": network_risk,
        "averageCondition": average_condition,
        "riskDistribution": [
            {"level": "low", "label": "Low", "count": risk_distribution["low"]},
            {"level": "medium", "label": "Medium", "count": risk_distribution["medium"]},
            {"level": "high", "label": "High", "count": risk_distribution["high"]},
            {"level": "critical", "label": "Critical", "count": risk_distribution["critical"]},
        ],
        "assetCategories": [
            {"category": "Bridges", "count": asset_categories["bridges"], "fill": "#60A5FA"},
            {"category": "Roads", "count": asset_categories["roads"], "fill": "#38BDF8"},
            {"category": "Hospitals", "count": asset_categories["hospitals"], "fill": "#22C55E"},
        ],
        "conditionTrend": [
            {"month": "Jan", "condition": 68, "predicted": 66},
            {"month": "Feb", "condition": 67, "predicted": 65},
            {"month": "Mar", "condition": 66, "predicted": 64},
            {"month": "Apr", "condition": 65, "predicted": 63},
            {"month": "May", "condition": 64, "predicted": 62},
            {"month": "Jun", "condition": 63, "predicted": 61},
        ],
        "monthlyInspections": [
            {"month": "Jan", "completed": 12, "scheduled": 18},
            {"month": "Feb", "completed": 15, "scheduled": 16},
            {"month": "Mar", "completed": 14, "scheduled": 17},
            {"month": "Apr", "completed": 18, "scheduled": 20},
            {"month": "May", "completed": 16, "scheduled": 19},
            {"month": "Jun", "completed": 20, "scheduled": 22},
        ],
    }
