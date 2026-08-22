from pymongo.database import Database

from app.core.responses import AppError
from app.models.collections import NETWORK_EDGES, NETWORK_NODES
from app.schemas.network import CascadeImpactOut, NetworkEdgeOut, NetworkNodeOut, NetworkOut


def get_network(db: Database) -> NetworkOut:
    nodes = list(db[NETWORK_NODES].find())
    edges = list(db[NETWORK_EDGES].find())
    return NetworkOut(
        nodes=[
            NetworkNodeOut(
                id=n["node_id"],
                label=n["label"],
                type=n["type"],
                riskScore=n["risk_score"],
                x=n.get("x"),
                y=n.get("y"),
            )
            for n in nodes
        ],
        edges=[
            NetworkEdgeOut(
                id=e["edge_id"],
                sourceId=e["source_id"],
                targetId=e["target_id"],
                relation=e["relation"],
            )
            for e in edges
        ],
    )


CASCADE_MAP: dict[str, CascadeImpactOut] = {
    "B17": CascadeImpactOut(
        affectedRoads=["R42", "R51"],
        affectedHospitals=["H03"],
        cascadeRisk="high",
        estimatedAccessTimeIncrease=18,
    ),
    "B31": CascadeImpactOut(
        affectedRoads=["R51"],
        affectedHospitals=["H03"],
        cascadeRisk="medium",
        estimatedAccessTimeIncrease=12,
    ),
    "B62": CascadeImpactOut(
        affectedRoads=["R63"],
        affectedHospitals=["H04", "H07"],
        cascadeRisk="high",
        estimatedAccessTimeIncrease=22,
    ),
}


def get_network_node(db: Database, node_id: str) -> dict:
    node = db[NETWORK_NODES].find_one({"node_id": node_id})
    if not node:
        raise AppError("NODE_NOT_FOUND", f"Network node {node_id} not found", 404)

    cascade = CASCADE_MAP.get(
        node_id,
        CascadeImpactOut(
            affectedRoads=["R42"],
            affectedHospitals=["H03"],
            cascadeRisk="medium",
            estimatedAccessTimeIncrease=15,
        ),
    )

    return {
        "node": NetworkNodeOut(
            id=node["node_id"],
            label=node["label"],
            type=node["type"],
            riskScore=node["risk_score"],
            x=node.get("x"),
            y=node.get("y"),
        ).model_dump(),
        "cascade": cascade.model_dump(),
    }


def build_cascade_for_asset(db: Database, asset_id: str) -> CascadeImpactOut:
    return CASCADE_MAP.get(
        asset_id,
        CascadeImpactOut(
            affectedRoads=["R42"],
            affectedHospitals=["H03"],
            cascadeRisk="medium",
            estimatedAccessTimeIncrease=15,
        ),
    )
