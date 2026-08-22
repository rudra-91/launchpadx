from fastapi import Depends

from app.core.responses import AppError
from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthenticatedUser


def require_admin(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    if current_user.role != "admin":
        raise AppError("FORBIDDEN", "Admin access required", 403)
    return current_user
