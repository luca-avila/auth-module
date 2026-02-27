# auth-module

Reusable auth starter you can plug into new projects.

It includes:
- `backend`: FastAPI + fastapi-users auth API
- `frontend`: React + Vite UI for auth flows
- `nginx`: reverse proxy for frontend/backend
- `docker-compose.yaml`: full local stack with PostgreSQL

## Backend architecture

The backend uses a lightweight feature-based layout:

- `backend/core`: shared infrastructure (`config`, DB engine/session)
- `backend/features/auth`: auth feature (`api`, `service`, `models`, `schemas`, `email`, `wiring`)
- `backend/features/protected`: protected route feature (`api`, `service`, `wiring`)
- `backend/app/api.py`: FastAPI app factory and feature router registration

## Quick start (Docker, easiest)

1. Copy env values:
   - `cp .env.example .env`
2. Start all services:
   - `docker compose up --build`
3. Open:
   - App: `http://localhost`
   - API docs: `http://localhost/docs`

## Backend only (local with uv)

1. Go to backend:
   - `cd backend`
2. Install deps (creates `.venv`):
   - `uv sync --dev`
3. Run API:
   - `uv run uvicorn app.api:app --reload`
4. Run tests:
   - `uv run pytest`

## Main auth endpoints

- `POST /auth/register`
- `POST /auth/jwt/login`
- `POST /auth/jwt/logout`
- `POST /auth/forgot-password` (sends reset email)
- `POST /auth/request-verify-token` (sends verify email)
- `POST /auth/verify` (verifies email with token)
- `GET /users/me`
- `GET /protected-route`

## Notes

- Dependencies are managed with `uv` in `backend/pyproject.toml`.
- Locked versions are in `backend/uv.lock` for reproducible installs.
- Resend email is configured with: `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL`, `VERIFY_PATH`, `RESET_PASSWORD_PATH`.
- Logging is configured with: `LOG_LEVEL` and `LOG_REQUESTS`.
- Registration triggers a verification email automatically.
