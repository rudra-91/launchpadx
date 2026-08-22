from pydantic import BaseModel, Field


class NetworkNodeOut(BaseModel):
    id: str
    label: str
    type: str
    riskScore: float
    x: float | None = None
    y: float | None = None


class NetworkEdgeOut(BaseModel):
    id: str
    sourceId: str
    targetId: str
    relation: str


class NetworkOut(BaseModel):
    nodes: list[NetworkNodeOut]
    edges: list[NetworkEdgeOut]


class CascadeImpactOut(BaseModel):
    affectedRoads: list[str]
    affectedHospitals: list[str]
    cascadeRisk: str
    estimatedAccessTimeIncrease: float
