import asyncio
import json
import logging
from urllib import request
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

from core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


def _build_action_url(path: str, token: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    route = path if path.startswith("/") else f"/{path}"
    return f"{base}{route}?{urlencode({'token': token})}"


async def _send_email(*, to_email: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not set. Skipping email send.")
        return

    if not settings.EMAIL_FROM:
        logger.warning("EMAIL_FROM is not set. Skipping email send.")
        return

    payload = json.dumps(
        {
            "from": settings.EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
    ).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    req = request.Request(RESEND_API_URL, data=payload, headers=headers, method="POST")

    try:
        await asyncio.to_thread(request.urlopen, req, timeout=10)
        logger.info("Email sent to %s via Resend.", to_email)
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        logger.error("Failed sending email via Resend: %s %s", exc.code, body)
    except URLError as exc:
        logger.error("Failed sending email via Resend: %s", exc.reason)


async def send_verify_email(to_email: str, token: str) -> None:
    verify_url = _build_action_url(settings.VERIFY_PATH, token)
    await _send_email(
        to_email=to_email,
        subject="Verify your email",
        html=(
            "<p>Welcome!</p>"
            f"<p>Verify your email by clicking <a href=\"{verify_url}\">this link</a>.</p>"
        ),
    )


async def send_reset_password_email(to_email: str, token: str) -> None:
    reset_url = _build_action_url(settings.RESET_PASSWORD_PATH, token)
    await _send_email(
        to_email=to_email,
        subject="Reset your password",
        html=(
            "<p>We received a password reset request.</p>"
            f"<p>Reset your password by clicking <a href=\"{reset_url}\">this link</a>.</p>"
            "<p>If you did not request this, you can ignore this email.</p>"
        ),
    )
