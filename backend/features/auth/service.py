import logging
import re
import uuid
from typing import Any

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, InvalidPasswordException, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, JWTStrategy
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.db import get_async_session
from features.auth.email import send_reset_password_email, send_verify_email
from features.auth.models import User

logger = logging.getLogger(__name__)


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    """Get user database instance."""
    yield SQLAlchemyUserDatabase(session, User)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """Custom user manager with strong password validation."""

    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY

    async def validate_password(self, password: str, user: Any) -> None:
        """Validate password strength."""
        errors = []

        if len(password) < settings.PASSWORD_MIN_LENGTH:
            errors.append(f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long.")

        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter.")

        if settings.PASSWORD_REQUIRE_LOWERCASE and not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter.")

        if settings.PASSWORD_REQUIRE_DIGIT and not re.search(r"\d", password):
            errors.append("Password must contain at least one digit.")

        if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r"[^A-Za-z0-9]", password):
            errors.append("Password must contain at least one special character.")

        if hasattr(user, "email") and user.email:
            email_username = user.email.split("@")[0].lower()
            if email_username in password.lower():
                errors.append("Password must not contain your email username.")

        if errors:
            raise InvalidPasswordException(reason=" ".join(errors))

    async def on_after_register(self, user: User, request: Request | None = None):
        """Hook called after user registration."""
        logger.info("User %s has registered.", user.id)
        await self.request_verify(user, request)

    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None):
        """Hook called after password reset request."""
        logger.info("User %s has requested a password reset.", user.id)
        await send_reset_password_email(user.email, token)

    async def on_after_request_verify(self, user: User, token: str, request: Request | None = None):
        """Hook called after email verification request."""
        logger.info("User %s has requested email verification.", user.id)
        await send_verify_email(user.email, token)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    """Get user manager instance."""
    yield UserManager(user_db)


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


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
