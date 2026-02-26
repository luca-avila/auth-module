import uuid
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, JWTStrategy

from config import settings
from .manager import get_user_manager
from .models import User


# Cookie transport for JWT
cookie_transport = CookieTransport(
    cookie_name="auth",
    cookie_max_age=3600,
    cookie_secure=settings.ENVIRONMENT == "production",
    cookie_httponly=True,
    cookie_samesite="lax",
)


def get_jwt_strategy() -> JWTStrategy:
    """Get JWT strategy."""
    return JWTStrategy(secret=settings.SECRET_KEY, lifetime_seconds=3600)


# Authentication backend
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPI Users instance
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

# Dependency for getting current active user
current_active_user = fastapi_users.current_user(active=True)
