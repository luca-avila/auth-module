# auth-module

Reusable auth starter you can plug into new projects.

It includes:
- `backend`: FastAPI + fastapi-users auth API
- `frontend`: React + Vite UI for auth flows (builds to static `dist/`)
- `nginx`: sample host nginx config for static frontend + API proxy
- `docker-compose.yaml`: backend + PostgreSQL containers (no in-compose proxy/TLS)

## Backend architecture

The backend uses a lightweight feature-based layout:

- `backend/core`: shared infrastructure (`config`, DB engine/session)
- `backend/features/auth`: auth feature (`api`, `service`, `models`, `schemas`, `email`, `wiring`)
- `backend/features/protected`: protected route feature (`api`, `service`, `wiring`)
- `backend/app/api.py`: FastAPI app factory and feature router registration

## Runtime architecture

- Host `nginx + certbot` handles HTTPS and serves frontend static files.
- Docker Compose runs only `backend` and `db`.
- Host nginx proxies API routes to backend on `127.0.0.1:8002`.

## Build frontend artifact (for VPS nginx)

Run these from the repository root:

```bash
docker build -t auth-frontend-build ./frontend
docker create --name auth-frontend-tmp auth-frontend-build
docker cp auth-frontend-tmp:/out/dist ./dist
docker rm auth-frontend-tmp
```

Deploy `./dist` to your nginx web root (example used in `nginx/nginx.conf`: `/var/www/auth-frontend/dist`).
```bash
sudo mkdir -p /var/www/auth-frontend
sudo rsync -a --delete ./dist/ /var/www/auth-frontend/
sudo chown -R www-data:www-data /var/www/auth-frontend
```

## Start backend + db

1. Copy env values:
   - `cp .env.example .env`
2. Start runtime services:
   - `docker compose up --build -d`
3. Check API docs:
   - `http://127.0.0.1:8002/docs`

## Host nginx + certbot setup

- Use `nginx/nginx.conf` as a base server block.
- Set `server_name` to your domain.
- Set `root` to where you deployed `dist`.
- Add certbot-managed TLS directives.
- API routes proxied to backend:
  - `/auth/`
  - `/users/`
  - `/health`
  - `/protected-route`
- SPA fallback:
  - `try_files $uri $uri/ /index.html;`

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
