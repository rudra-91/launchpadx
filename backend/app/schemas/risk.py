from pydantic import BaseModel


class RiskOut(BaseModel):
    assetId: str
    riskScore: float
    riskLevel: str
    factors: dict
