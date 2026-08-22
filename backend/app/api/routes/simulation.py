from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.schemas.simulation import OptimizeRequest, SimulationRequest
from app.services import simulation_service

router = APIRouter(tags=["simulation"])


@router.post("/api/simulate")
def simulate(
    payload: SimulationRequest, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)
):
    result = simulation_service.run_simulation(db, payload.assetId, payload.repairQuality, payload.budget)
    return success_response(result.model_dump())


@router.post("/api/optimize")
def optimize(
    payload: OptimizeRequest, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)
):
    result = simulation_service.run_optimization(db, payload.budget, payload.strategy)
    return success_response(result.model_dump())
