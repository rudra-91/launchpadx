from fastapi import APIRouter, Depends

from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUserOut, AuthenticatedUser

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
def me(current_user: AuthenticatedUser = Depends(get_current_user)):
    payload = AuthUserOut(
        id=current_user.supabase_user_id,
        email=current_user.email,
        role=current_user.role,
        display_name=current_user.display_name,
    )
    return success_response(payload.model_dump())
