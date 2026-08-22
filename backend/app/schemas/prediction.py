from pydantic import BaseModel, Field


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class PredictionOut(BaseModel):
    assetId: str
    currentCondition: float
    predictedCondition: float
    deterioration: float
    riskScore: float
    riskLevel: str
    confidence: float
    featureImportance: list[FeatureImportanceItem] = Field(default_factory=list)
