from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.services import network_service

router = APIRouter(prefix="/api/network", tags=["network"])


@router.get("")
def get_network(db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)):
    network = network_service.get_network(db)
    return success_response(network.model_dump())


@router.get("/{node_id}")
def get_network_node(node_id: str, db: Database = Depends(get_db), _: AuthenticatedUser = Depends(get_current_user)):
    return success_response(network_service.get_network_node(db, node_id))
