import logging
from datetime import datetime, timezone

from pymongo.database import Database

from app.models.collections import USER_PROFILES

logger = logging.getLogger(__name__)


class UserProfile:
    def __init__(
        self,
        *,
        supabase_user_id: str,
        display_name: str | None = None,
        role: str = "user",
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        self.supabase_user_id = supabase_user_id
        self.display_name = display_name
        self.role = role
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    @classmethod
    def from_doc(cls, doc: dict) -> "UserProfile":
        return cls(
            supabase_user_id=doc["supabase_user_id"],
            display_name=doc.get("display_name"),
            role=doc.get("role", "user"),
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at"),
        )


def get_profile_by_supabase_id(db: Database, supabase_user_id: str) -> UserProfile | None:
    try:
        doc = db[USER_PROFILES].find_one({"supabase_user_id": supabase_user_id})
        return UserProfile.from_doc(doc) if doc else None
    except Exception as exc:
        logger.warning("Could not query user_profiles collection from MongoDB: %s", exc)
        return None


def get_or_create_profile(
    db: Database,
    *,
    supabase_user_id: str,
    display_name: str | None = None,
    role: str = "user",
) -> UserProfile:
    try:
        existing = get_profile_by_supabase_id(db, supabase_user_id)
        if existing:
            if display_name and not existing.display_name:
                db[USER_PROFILES].update_one(
                    {"supabase_user_id": supabase_user_id},
                    {"$set": {"display_name": display_name, "updated_at": datetime.now(timezone.utc)}},
                )
                existing.display_name = display_name
            return existing

        now = datetime.now(timezone.utc)
        doc = {
            "supabase_user_id": supabase_user_id,
            "display_name": display_name,
            "role": role,
            "created_at": now,
            "updated_at": now,
        }
        db[USER_PROFILES].insert_one(doc)
        return UserProfile.from_doc(doc)
    except Exception as exc:
        logger.warning("MongoDB unavailable for user profile, returning fallback profile: %s", exc)
        return UserProfile(
            supabase_user_id=supabase_user_id,
            display_name=display_name,
            role=role,
        )
