from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_publishable_key)


def verify_supabase_access_token(access_token: str):
    """Verify a Supabase access token and return the authenticated Supabase user."""
    client = get_supabase_client()
    response = client.auth.get_user(access_token)
    if response is None or response.user is None:
        return None
    return response.user
