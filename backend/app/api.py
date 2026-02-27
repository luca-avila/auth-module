import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.db import create_db_and_tables
from features.auth.models import Base
from features.auth.wiring import include_auth_routers
from features.protected.wiring import protected_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context - startup/shutdown."""
    await create_db_and_tables(Base.metadata)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="FastAPI Users Auth", version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    include_auth_routers(app)
    app.include_router(protected_router, tags=["protected"])

    @app.get("/health", tags=["health"])
    async def health_check():
        """Health check endpoint for Docker/orchestrator probes."""
        return {"status": "healthy"}

    return app


app = create_app()
