from fastapi import APIRouter

from features.auth.schemas import UserCreate, UserRead, UserUpdate
from features.auth.service import auth_backend, fastapi_users


def get_auth_jwt_router() -> APIRouter:
    return fastapi_users.get_auth_router(auth_backend)


def get_auth_register_router() -> APIRouter:
    return fastapi_users.get_register_router(UserRead, UserCreate)


def get_auth_verify_router() -> APIRouter:
    return fastapi_users.get_verify_router(UserRead)


def get_auth_reset_password_router() -> APIRouter:
    return fastapi_users.get_reset_password_router()


def get_users_router() -> APIRouter:
    return fastapi_users.get_users_router(UserRead, UserUpdate)
