import pytest
from httpx import AsyncClient

USER_EMAIL = "test@example.com"
USER_PASSWORD = "StrongPass123!"


async def register_user(client: AsyncClient, email: str = USER_EMAIL, password: str = USER_PASSWORD):
    """Helper to register a user and return the response."""
    return await client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )


async def login_user(client: AsyncClient, email: str = USER_EMAIL, password: str = USER_PASSWORD):
    """Helper to log in and return the response (sets auth cookie)."""
    return await client.post(
        "/auth/jwt/login",
        data={"username": email, "password": password},
    )


# ── Registration Tests ──────────────────────────────────────────────


class TestRegistration:
    async def test_register_success(self, client: AsyncClient):
        response = await register_user(client)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == USER_EMAIL
        assert "id" in data
        assert data["is_active"] is True

    async def test_register_duplicate_email(self, client: AsyncClient):
        await register_user(client)
        response = await register_user(client)
        assert response.status_code == 400

    async def test_register_invalid_email(self, client: AsyncClient):
        response = await register_user(client, email="not-an-email")
        assert response.status_code == 422

    async def test_register_missing_password(self, client: AsyncClient):
        """Missing password field should return 422."""
        response = await client.post("/auth/register", json={"email": USER_EMAIL})
        assert response.status_code == 422


# ── Password Validation Tests ───────────────────────────────────────


class TestPasswordValidation:
    async def test_password_too_short(self, client: AsyncClient):
        response = await register_user(client, password="Ab1!")
        assert response.status_code == 400
        assert "8 characters" in response.json()["detail"]["reason"]

    async def test_password_no_uppercase(self, client: AsyncClient):
        response = await register_user(client, password="lowercase1!")
        assert response.status_code == 400
        assert "uppercase" in response.json()["detail"]["reason"]

    async def test_password_no_lowercase(self, client: AsyncClient):
        response = await register_user(client, password="UPPERCASE1!")
        assert response.status_code == 400
        assert "lowercase" in response.json()["detail"]["reason"]

    async def test_password_no_digit(self, client: AsyncClient):
        response = await register_user(client, password="NoDigits!!")
        assert response.status_code == 400
        assert "digit" in response.json()["detail"]["reason"]

    async def test_password_no_special_char(self, client: AsyncClient):
        response = await register_user(client, password="NoSpecial1A")
        assert response.status_code == 400
        assert "special character" in response.json()["detail"]["reason"]

    async def test_password_contains_email_username(self, client: AsyncClient):
        response = await register_user(client, email="john@example.com", password="John1234!")
        assert response.status_code == 400
        assert "email" in response.json()["detail"]["reason"]

    async def test_valid_strong_password(self, client: AsyncClient):
        response = await register_user(client, password="V3ryStr0ng!")
        assert response.status_code == 201


# ── Login Tests ──────────────────────────────────────────────────────


class TestLogin:
    async def test_login_success(self, client: AsyncClient):
        await register_user(client)
        response = await login_user(client)
        assert response.status_code == 200 or response.status_code == 204
        assert "auth" in response.cookies

    async def test_login_wrong_password(self, client: AsyncClient):
        await register_user(client)
        response = await login_user(client, password="WrongPassword!")
        assert response.status_code == 400

    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await login_user(client, email="nobody@example.com")
        assert response.status_code == 400


# ── Logout Tests ─────────────────────────────────────────────────────


class TestLogout:
    async def test_logout(self, client: AsyncClient):
        await register_user(client)
        await login_user(client)
        response = await client.post("/auth/jwt/logout")
        assert response.status_code == 200 or response.status_code == 204


# ── Current User / Users Tests ───────────────────────────────────────


class TestCurrentUser:
    async def test_get_me_authenticated(self, client: AsyncClient):
        await register_user(client)
        await login_user(client)
        response = await client.get("/users/me")
        assert response.status_code == 200
        assert response.json()["email"] == USER_EMAIL

    async def test_get_me_unauthenticated(self, client: AsyncClient):
        response = await client.get("/users/me")
        assert response.status_code == 401

    async def test_patch_me(self, client: AsyncClient):
        await register_user(client)
        await login_user(client)
        response = await client.patch("/users/me", json={"email": "new@example.com"})
        # fastapi-users may return 200
        assert response.status_code == 200
        # Email should be unchanged or updated depending on verification settings
        assert "email" in response.json()


# ── Protected Route Tests ────────────────────────────────────────────


class TestProtectedRoute:
    async def test_protected_route_authenticated(self, client: AsyncClient):
        await register_user(client)
        await login_user(client)
        response = await client.get("/protected-route")
        assert response.status_code == 200
        assert "Hello" in response.json()["message"]

    async def test_protected_route_unauthenticated(self, client: AsyncClient):
        response = await client.get("/protected-route")
        assert response.status_code == 401
