import hashlib

from app.schemas.prediction import FeatureImportanceItem, PredictionOut
from app.services.ml.base import BasePredictor
from app.services.risk_service import calculate_risk_level, calculate_risk_score


class MockPredictor(BasePredictor):
    """Deterministic demo predictor — not real ML output."""

    def predict(self, asset_id: str, current_condition: float, age: int, traffic: int) -> PredictionOut:
        seed = int(hashlib.sha256(asset_id.encode()).hexdigest(), 16) % 10_000
        deterioration = 4 + (seed % 12)
        predicted = max(20.0, current_condition - deterioration)
        risk_score = calculate_risk_score(current_condition, predicted, deterioration, age, traffic)
        risk_level = calculate_risk_level(risk_score)
        confidence = round(0.82 + (seed % 15) / 100, 2)

        feature_importance = [
            FeatureImportanceItem(feature="Age", importance=round(0.18 + (seed % 5) / 100, 2)),
            FeatureImportanceItem(feature="Traffic Load", importance=round(0.14 + (seed % 4) / 100, 2)),
            FeatureImportanceItem(feature="Material Condition", importance=round(0.22 + (seed % 6) / 100, 2)),
            FeatureImportanceItem(feature="Inspection History", importance=round(0.12 + (seed % 3) / 100, 2)),
            FeatureImportanceItem(feature="Deck Rating", importance=round(0.16 + (seed % 4) / 100, 2)),
        ]

        return PredictionOut(
            assetId=asset_id,
            currentCondition=round(current_condition, 1),
            predictedCondition=round(predicted, 1),
            deterioration=round(deterioration, 1),
            riskScore=round(risk_score, 1),
            riskLevel=risk_level,
            confidence=confidence,
            featureImportance=feature_importance,
        )
