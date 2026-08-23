"""Seed INFRA-X infrastructure data into MongoDB."""

from datetime import datetime, timezone

from pymongo.database import Database

from app.core.config import get_settings
from app.core.database import COLLECTIONS, ensure_indexes, get_client, get_database
from app.models.collections import ASSETS, NETWORK_EDGES, NETWORK_NODES, USER_PROFILES
from app.services.risk_service import calculate_risk_score

BRIDGE_NAMES = [
    "Liberty Bridge",
    "Queens Bridge",
    "Trade Bridge",
    "Central Bridge",
    "North Bridge",
    "South Bridge",
    "East Bridge",
    "West Bridge",
    "River Bridge",
    "Lake Bridge",
    "Park Bridge",
    "Market Bridge",
    "Union Bridge",
    "State Bridge",
    "County Bridge",
    "Highland Bridge",
    "Valley Bridge",
    "Summit Bridge",
    "Creek Bridge",
    "Forest Bridge",
    "Industrial Bridge",
    "Harbor Bridge",
    "Metro Bridge",
    "Gateway Bridge",
    "Heritage Bridge",
    "Crossing Bridge",
    "Transit Bridge",
    "Commerce Bridge",
    "Regional Bridge",
    "Express Bridge",
]

ROAD_NAMES = [f"Road R{i:02d}" for i in range(1, 21)]
HOSPITAL_NAMES = [f"Hospital H{i:02d}" for i in range(1, 9)]
MATERIALS = ["Steel", "Concrete", "Composite", "Prestressed Concrete"]


def build_bridge_ids(count: int = 30) -> list[str]:
    ids = ["B17", "B31", "B62"]
    n = 1
    while len(ids) < count:
        candidate = f"B{n:02d}"
        if candidate not in ids:
            ids.append(candidate)
        n += 1
    return ids


def remove_legacy_collections(db: Database) -> None:
    """Remove unrelated tutorial collections (e.g. movies) from the cluster."""
    for legacy_name in ("movies", "movie", "films"):
        if legacy_name in db.list_collection_names():
            db.drop_collection(legacy_name)
            print(f"Dropped legacy collection: {legacy_name}")


def seed(db: Database, *, force: bool = False) -> None:
    if not force and db[ASSETS].count_documents({}) > 0:
        print("Assets already seeded — skipping.")
        return

    if force:
        for name in COLLECTIONS:
            db[name].delete_many({})

    remove_legacy_collections(db)

    now = datetime.now(timezone.utc)
    db[USER_PROFILES].insert_one(
        {
            "supabase_user_id": "00000000-0000-4000-8000-000000000001",
            "display_name": "Admin User",
            "role": "admin",
            "created_at": now,
            "updated_at": now,
        }
    )

    base_lat, base_lng = 35.2271, -80.8431
    bridge_ids = build_bridge_ids(30)
    asset_docs: list[dict] = []

    for i in range(30):
        asset_id = bridge_ids[i]
        condition = 45 + (i * 3) % 40
        age = 18 + (i * 2) % 55
        traffic = 15000 + (i * 1700) % 55000
        predicted = max(20, condition - (4 + i % 10))
        deterioration = condition - predicted
        risk = calculate_risk_score(condition, predicted, deterioration, age, traffic)
        asset_docs.append(
            {
                "asset_id": asset_id,
                "name": f"Bridge {asset_id} — {BRIDGE_NAMES[i]}",
                "type": "bridge",
                "latitude": base_lat + (i % 6) * 0.02 - 0.05,
                "longitude": base_lng + (i // 6) * 0.025 - 0.06,
                "condition": float(condition),
                "predicted_condition": float(predicted),
                "risk_score": round(risk, 1),
                "confidence": float(85 + i % 10),
                "traffic": traffic,
                "age": age,
                "material": MATERIALS[i % len(MATERIALS)],
                "status": "active" if risk < 80 else "critical",
            }
        )

    for i, name in enumerate(ROAD_NAMES):
        asset_id = f"R{i + 1:02d}"
        condition = 55 + (i * 2) % 35
        asset_docs.append(
            {
                "asset_id": asset_id,
                "name": name,
                "type": "road",
                "latitude": base_lat + (i % 5) * 0.018,
                "longitude": base_lng + (i // 5) * 0.02,
                "condition": float(condition),
                "predicted_condition": float(max(30, condition - 5)),
                "risk_score": float(20 + i * 2),
                "confidence": 80.0,
                "traffic": 8000 + i * 900,
                "age": 10 + i,
                "material": "Asphalt",
                "status": "active",
                "capacity": 20000 + i * 500,
            }
        )

    for i, name in enumerate(HOSPITAL_NAMES):
        asset_id = f"H{i + 1:02d}"
        asset_docs.append(
            {
                "asset_id": asset_id,
                "name": name,
                "type": "hospital",
                "latitude": base_lat + 0.04 + i * 0.01,
                "longitude": base_lng - 0.03 + i * 0.015,
                "condition": 90.0,
                "predicted_condition": 88.0,
                "risk_score": 12.0 + i,
                "confidence": 95.0,
                "traffic": 0,
                "age": 5 + i,
                "material": "Concrete",
                "status": "active",
            }
        )

    db[ASSETS].insert_many(asset_docs)

    nodes = [
        ("B17", "Bridge B17", "bridge", 82, 120, 280),
        ("B31", "Bridge B31", "bridge", 74, 120, 420),
        ("B62", "Bridge B62", "bridge", 76, 320, 350),
        ("R42", "Road R42", "road", 45, 240, 200),
        ("R51", "Road R51", "road", 38, 240, 350),
        ("R63", "Road R63", "road", 42, 400, 280),
        ("H03", "Hospital H03", "hospital", 15, 240, 80),
        ("H04", "Hospital H04", "hospital", 18, 480, 200),
        ("H07", "Hospital H07", "hospital", 12, 480, 400),
    ]
    db[NETWORK_NODES].insert_many(
        [
            {
                "node_id": node_id,
                "label": label,
                "type": ntype,
                "risk_score": float(risk),
                "x": float(x),
                "y": float(y),
            }
            for node_id, label, ntype, risk, x, y in nodes
        ]
    )

    edges = [
        ("e1", "B17", "R42", "CONNECTED_TO"),
        ("e2", "B31", "R51", "CONNECTED_TO"),
        ("e3", "B62", "R63", "CONNECTED_TO"),
        ("e4", "R42", "R51", "CONNECTED_TO"),
        ("e5", "R51", "R63", "CONNECTED_TO"),
        ("e6", "R42", "H03", "PROVIDES_ACCESS"),
        ("e7", "R63", "H04", "PROVIDES_ACCESS"),
        ("e8", "R63", "H07", "PROVIDES_ACCESS"),
        ("e9", "B17", "R51", "CONNECTED_TO"),
    ]
    db[NETWORK_EDGES].insert_many(
        [
            {
                "edge_id": edge_id,
                "source_id": source,
                "target_id": target,
                "relation": relation,
            }
            for edge_id, source, target, relation in edges
        ]
    )


def main() -> None:
    settings = get_settings()
    client = get_client()
    db = client[settings.mongodb_db_name]
    ensure_indexes(db)
    seed(db, force="--force" in __import__("sys").argv)
    print(f"Seed complete. Database: {settings.mongodb_db_name}")


if __name__ == "__main__":
    main()
