from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    assetId: str
    repairQuality: float = Field(ge=0, le=100)
    budget: float = Field(ge=0)


class SimulationOut(BaseModel):
    assetId: str
    beforeRisk: float
    afterRisk: float
    riskReduction: float
    estimatedAccessTime: float
    disclaimer: str = "Simulated outcome based on model assumptions."


class OptimizeRequest(BaseModel):
    budget: float = Field(ge=0)
    strategy: str = Field(default="safety")


class OptimizeItem(BaseModel):
    assetId: str
    name: str
    priorityScore: float
    estimatedCost: float


class OptimizeOut(BaseModel):
    strategy: str
    budget: float
    budgetUsed: float
    expectedNetworkImprovement: float
    priorities: list[OptimizeItem]
