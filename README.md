# auth-module

Reusable auth starter you can plug into new projects.

It includes:
- `backend`: FastAPI + fastapi-users auth API
- `frontend`: React + Vite UI for auth flows
- `nginx`: reverse proxy for frontend/backend
- `docker-compose.yaml`: full local stack with PostgreSQL

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
   - `uv run uvicorn api_app:app --reload`
4. Run tests:
   - `uv run pytest`

## Main auth endpoints

- `POST /auth/register`
- `POST /auth/jwt/login`
- `POST /auth/jwt/logout`
- `GET /users/me`
- `GET /protected-route`

## Notes

- Dependencies are managed with `uv` in `backend/pyproject.toml`.
- Locked versions are in `backend/uv.lock` for reproducible installs.
