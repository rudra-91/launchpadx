from dataclasses import dataclass

from pydantic import BaseModel, EmailStr


@dataclass
class AuthenticatedUser:
    supabase_user_id: str
    email: str
    role: str
    display_name: str | None = None


class AuthUserOut(BaseModel):
    id: str
    email: EmailStr
    role: str
    display_name: str | None = None
