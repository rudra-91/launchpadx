from pydantic import BaseModel


class MaintenancePriority(BaseModel):
    assetId: str
    name: str
    priorityScore: float
    riskScore: float
    deterioration: float
    estimatedCost: float
    rationale: str


class MaintenanceAssetOut(BaseModel):
    assetId: str
    name: str
    priorityScore: float
    recommendedAction: str
    estimatedCost: float
    networkImportance: str
