import logging
import re
import uuid
from typing import Any
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, InvalidPasswordException, UUIDIDMixin
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

from config import settings
from .database import get_user_db
from .models import User

logger = logging.getLogger(__name__)


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

    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None):
        """Hook called after password reset request."""
        logger.info("User %s has requested a password reset.", user.id)

    async def on_after_request_verify(self, user: User, token: str, request: Request | None = None):
        """Hook called after email verification request."""
        logger.info("User %s has requested email verification.", user.id)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    """Get user manager instance."""
    yield UserManager(user_db)
