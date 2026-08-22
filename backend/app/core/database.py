from collections.abc import Generator

from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import get_settings

_client: MongoClient | None = None
_db: Database | None = None

COLLECTIONS = (
    "assets",
    "user_profiles",
    "predictions",
    "simulations",
    "network_nodes",
    "network_edges",
)


def get_client() -> MongoClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = MongoClient(settings.mongodb_url)
    return _client


def get_database() -> Database:
    global _db
    if _db is None:
        settings = get_settings()
        _db = get_client()[settings.mongodb_db_name]
    return _db


def get_db() -> Generator[Database, None, None]:
    yield get_database()


def set_database(client: MongoClient, db_name: str) -> None:
    """Override the active database (used in tests)."""
    global _client, _db
    _client = client
    _db = client[db_name]


def reset_database() -> None:
    global _client, _db
    _client = None
    _db = None


def ensure_indexes(db: Database) -> None:
    db.assets.create_index("asset_id", unique=True)
    db.assets.create_index("type")
    db.user_profiles.create_index("supabase_user_id", unique=True)
    db.predictions.create_index("asset_id")
    db.predictions.create_index([("asset_id", 1), ("created_at", -1)])
    db.simulations.create_index("asset_id")
    db.network_nodes.create_index("node_id", unique=True)
    db.network_edges.create_index("edge_id", unique=True)


def ping_database() -> bool:
    try:
        get_client().admin.command("ping")
        return True
    except Exception:
        return False
