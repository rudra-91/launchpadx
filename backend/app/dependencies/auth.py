from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.database import Database

from app.core.database import get_db
from app.core.responses import AppError
from app.core.supabase_client import verify_supabase_access_token
from app.schemas.auth import AuthenticatedUser
from app.services.user_profile_service import get_or_create_profile

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Database = Depends(get_db),
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AppError("UNAUTHORIZED", "Authentication required", 401)

    token = credentials.credentials.strip()
    if not token:
        raise AppError("UNAUTHORIZED", "Authentication required", 401)

    supabase_user = verify_supabase_access_token(token)
    if supabase_user is None or not supabase_user.id:
        raise AppError("UNAUTHORIZED", "Invalid or expired credentials", 401)

    email = supabase_user.email or ""
    metadata = supabase_user.user_metadata or {}
    display_name = metadata.get("display_name") or metadata.get("full_name") or metadata.get("name")

    profile = get_or_create_profile(
        db,
        supabase_user_id=supabase_user.id,
        display_name=display_name,
    )

    return AuthenticatedUser(
        supabase_user_id=supabase_user.id,
        email=email,
        role=profile.role,
        display_name=profile.display_name,
    )
